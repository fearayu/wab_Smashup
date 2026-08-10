#!/usr/bin/env node

import { spawn } from 'node:child_process'
import process from 'node:process'

const args = process.argv.slice(2)
const mode = args[0] || 'full' // 'full' หรือ 'page'

const PORT = 5050
const SITE_URL = `http://localhost:${PORT}`

// ตรวจสอบว่าใช้ package manager อะไร
const packageManager = process.env.npm_execpath?.includes('pnpm')
  ? 'pnpm'
  : process.env.npm_execpath?.includes('yarn')
    ? 'yarn'
    : 'npm'

const runCommand = packageManager === 'npm' ? 'npm run' : packageManager

console.log(`🚀 Starting Lighthouse automation (using ${packageManager})...\n`)

// Step 1: Build
console.log('📦 Step 1/4: Building project...')
const buildArgs = packageManager === 'npm' ? ['run', 'build'] : ['build']
const buildProcess = spawn(packageManager, buildArgs, {
  stdio: 'inherit',
  shell: true,
})

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed!')
    process.exit(code)
  }

  console.log('✅ Build completed!\n')

  // Step 2: Start preview server
  console.log(`🌐 Step 2/4: Starting preview server on port ${PORT}...`)
  const previewArgs = packageManager === 'npm' ? ['run', 'preview'] : ['preview']
  const previewProcess = spawn(packageManager, previewArgs, {
    stdio: 'pipe',
    shell: true,
  })

  let serverReady = false

  previewProcess.stdout.on('data', (data) => {
    const output = data.toString()
    process.stdout.write(output)

    // ตรวจสอบว่า server พร้อมแล้วหรือยัง
    if (output.includes('localhost') && !serverReady) {
      serverReady = true
      console.log('✅ Preview server is ready!\n')

      // Step 3: Wait a bit for server to stabilize
      console.log('⏳ Step 3/4: Waiting for server to stabilize...')
      setTimeout(() => {
        console.log('✅ Server stabilized!\n')

        // Step 4: Run Lighthouse
        const lighthouseCommand = mode === 'page'
          ? ['lighthouse', SITE_URL, '--view']
          : ['unlighthouse', '--site', SITE_URL]

        console.log(`🔍 Step 4/4: Running Lighthouse (${mode} mode)...\n`)
        const lighthouseProcess = spawn('npx', lighthouseCommand, {
          stdio: 'inherit',
          shell: true,
        })

        lighthouseProcess.on('close', (lighthouseCode) => {
          console.log('\n✅ Lighthouse scan completed!')

          // ปิด preview server
          console.log('🛑 Shutting down preview server...')
          previewProcess.kill()

          process.exit(lighthouseCode)
        })

        // จัดการการกด Ctrl+C
        process.on('SIGINT', () => {
          console.log('\n⚠️  Process interrupted by user')
          lighthouseProcess.kill()
          previewProcess.kill()
          process.exit(0)
        })
      }, 2000) // รอ 2 วินาทีให้ server พร้อม
    }
  })

  previewProcess.stderr.on('data', (data) => {
    process.stderr.write(data)
  })

  previewProcess.on('error', (error) => {
    console.error('❌ Failed to start preview server:', error)
    process.exit(1)
  })
})

buildProcess.on('error', (error) => {
  console.error('❌ Failed to start build:', error)
  process.exit(1)
})
