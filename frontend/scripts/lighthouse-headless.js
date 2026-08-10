#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import process from 'node:process'
import { join } from 'node:path'

const PORT = 5050
const SITE_URL = `http://localhost:${PORT}`
const REPORTS_DIR = 'lighthouse-reports'
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
const REPORT_BASENAME = `report-${timestamp}`
const JSON_REPORT = join(REPORTS_DIR, `${REPORT_BASENAME}.report.json`)
const HTML_REPORT = join(REPORTS_DIR, `${REPORT_BASENAME}.report.html`)

// ตรวจสอบว่าใช้ package manager อะไร
const packageManager = process.env.npm_execpath?.includes('pnpm')
  ? 'pnpm'
  : process.env.npm_execpath?.includes('yarn')
    ? 'yarn'
    : 'npm'

console.log(`🚀 Starting Lighthouse Headless (using ${packageManager})...\n`)

// สร้างโฟลเดอร์ reports ถ้ายังไม่มี
if (!existsSync(REPORTS_DIR))
  await mkdir(REPORTS_DIR, { recursive: true })

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

    if (output.includes('localhost') && !serverReady) {
      serverReady = true
      console.log('✅ Preview server is ready!\n')

      // Step 3: Wait for server
      console.log('⏳ Step 3/4: Waiting for server to stabilize...')
      setTimeout(() => {
        console.log('✅ Server stabilized!\n')

        // Step 4: Run Lighthouse (headless with JSON output)
        console.log('🔍 Step 4/4: Running Lighthouse (headless mode)...\n')

        const lighthouseArgs = [
          'lighthouse',
          SITE_URL,
          '--output=json',
          '--output=html',
          `--output-path=${REPORTS_DIR}/${REPORT_BASENAME}`,
          '--quiet',
          '--chrome-flags="--headless --no-sandbox"',
        ]

        const lighthouseProcess = spawn('npx', lighthouseArgs, {
          stdio: 'inherit',
          shell: true,
        })

        lighthouseProcess.on('close', async (lighthouseCode) => {
          if (lighthouseCode === 0) {
            console.log('\n✅ Lighthouse scan completed!')

            // อ่านและวิเคราะห์ผลลัพธ์
            try {
              await analyzeReport(JSON_REPORT)
            }
            catch (error) {
              console.error('❌ Error analyzing report:', error.message)
            }
          }
          else {
            console.error('\n❌ Lighthouse scan failed!')
          }

          // ปิด preview server
          console.log('\n🛑 Shutting down preview server...')
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
      }, 2000)
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

// ฟังก์ชันวิเคราะห์ report
async function analyzeReport(reportPath) {
  console.log('\n📊 ========== LIGHTHOUSE REPORT SUMMARY ==========\n')

  const data = await readFile(reportPath, 'utf-8')
  const report = JSON.parse(data)

  // แสดงคะแนนทั้งหมด
  const categories = report.categories
  console.log('📈 SCORES:\n')

  const scoreEmoji = (score) => {
    if (score >= 0.9)
      return '🟢'
    if (score >= 0.5)
      return '🟡'
    return '🔴'
  }

  for (const [key, category] of Object.entries(categories)) {
    const score = Math.round(category.score * 100)
    console.log(`${scoreEmoji(category.score)} ${category.title}: ${score}/100`)
  }

  // แสดง Opportunities (สิ่งที่ควรปรับปรุง)
  console.log('\n⚡ OPPORTUNITIES (ปรับปรุงเพื่อเพิ่มความเร็ว):\n')
  const audits = report.audits
  const opportunities = Object.values(audits)
    .filter(audit => audit.details?.type === 'opportunity' && audit.score < 1)
    .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
    .slice(0, 10)

  if (opportunities.length === 0) {
    console.log('   ✅ No major opportunities found!')
  }
  else {
    opportunities.forEach((audit, index) => {
      const savings = audit.numericValue
        ? `(ประหยัด ~${(audit.numericValue / 1000).toFixed(2)}s)`
        : ''
      console.log(`   ${index + 1}. ${audit.title} ${savings}`)
      if (audit.description)
        console.log(`      → ${audit.description.replace(/<[^>]*>/g, '')}`)
    })
  }

  // แสดง Diagnostics (ปัญหาที่ตรวจพบ)
  console.log('\n🔍 DIAGNOSTICS (ปัญหาที่ควรแก้):\n')
  const diagnostics = Object.values(audits)
    .filter(audit =>
      audit.score !== null
      && audit.score < 1
      && audit.details?.type !== 'opportunity'
      && audit.scoreDisplayMode === 'binary',
    )
    .slice(0, 10)

  if (diagnostics.length === 0) {
    console.log('   ✅ No major diagnostics found!')
  }
  else {
    diagnostics.forEach((audit, index) => {
      console.log(`   ${index + 1}. ${audit.title}`)
      if (audit.description)
        console.log(`      → ${audit.description.replace(/<[^>]*>/g, '')}`)
    })
  }

  // แสดง path ของ reports
  console.log('\n📁 REPORTS SAVED:')
  console.log(`   • JSON: ${JSON_REPORT}`)
  console.log(`   • HTML: ${HTML_REPORT}`)

  console.log('\n💡 TIP: คัดลอกไฟล์ JSON มาให้ Claude เพื่อรับคำแนะนำการแก้ไขโดยละเอียด')
  console.log('\n================================================\n')
}
