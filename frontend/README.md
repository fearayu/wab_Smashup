# Fakduai - Premium Web App Starter Template

<details>
  <summary>Click to View Logs</summary>
  
  - 21 Dec 2024
    - Init Readme
</details>

<hr>

## Table of Contents

- [Fakduai Standard Web](#fakduai-standard-web)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Project setup](#project-setup)
    - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
    - [Compiles and minifies for production](#compiles-and-minifies-for-production)
    - [Lints and fixes files](#lints-and-fixes-files)
  - [Folder Structure](#folder-structure)
    - [Document](#document)
  - [Conventions](#conventions)
    - [Naming](#naming)
    - [Component](#component)

## Overview

A web frontend for Fakduai Standard Web project

- **Recommended Editor: VS code**
- Main Framework: Vue3 (Typescript)
- UI Libs: Vuetify
- Build Tools: Vite
- Theme : Fakduai (Modern & Premium)
- Test Tools: Vitest

**Recommended VS Code Extensions**

- Prettier
- Vue Language Features (Volar)


Use the right node version with `nvm`

```bash
nvm use
```

### Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and minifies for production

```
npm run build
```
### Lints and fixes files

```
npm run lint
```


## Folder Structure
### Folder Structure

```bash
├── .vscode
├── public
└──  src
   ├── assets
   ├── components
   │   └── global
   ├── layouts
   ├── plugins
   ├── services
   ├── pages
   └── utils|
   └── views

```


## Conventions

This section will guide you about convention that are being used in this project

### Naming

We use `kebab-case` naming style for almost everything.  
Except for a `Vue component` and `JS, TS Class file`

- **Folder**: `helloWorld`
- **JS File**: `helloWorld.js`
- **TS File**: `hello-world.ts`

### Component
- Use `Single File Component (SFC)` concept
- Always use `<script setup>.....</script>` instead of `defineComponent`
- All components should scope its style `<style scoped>`
- `<script setup>...</script>` should be top level of the component (template below)

```
  <script setup>...</script>
  <template>...</template>
  <style>...</style>
```
