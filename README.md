<p align="center">
  <a href="https://github.com/devnax/makepack" rel="noopener" target="_blank"><img  src="https://raw.githubusercontent.com/devnax/makepack/main/logo.png" alt="Makepack logo"></a>
</p>

<h1 align="center">Makepack</h1>

**MakePack** is a command-line interface (CLI) tool that helps you to quickly set up, build, and manage JavaScript, TypeScript, React, and React-TypeScript libraries for use in npm projects. With just a few simple commands, you can generate your own libraries, start a development server, or build and publish your project to the npm repository.


## 📥 Installation

Install `makepack` globally to get started:

```sh
npm install -g makepack
```

---

## 🎯 Why Choose makepack?
- **Zero-Config Setup** – Instantly scaffold a structured project.
- **TypeScript Support** – Seamlessly work with modern JavaScript.
- **Integrated Dev Server** – Run your package with Vite and Express.
- **Efficient Build System** – Generate optimized ESM and CJS outputs.
- **One-Command Publish** – Deploy your package to npm effortlessly.
---

## 📜 CLI Commands

### ✨ `makepack create` – Scaffold a New Project
Quickly initialize a structured package with the following setup:

```
src/index.ts or tsx or js or jsx
.gitignore
package.json
README.md
```

Run:
```sh
makepack create
```
Follow the interactive prompts to configure your project.

### 🚀 `makepack start` – Launch the Development Server
Run a Vite + Express server to develop and test your package in real-time.

```sh
makepack start
```

### 🏗️ `makepack build` – Compile Your Package
Builds and optimizes your package into the `build` directory.

```sh
makepack build
```

### 📦 `makepack publish` – Deploy to NPM
Publish your package to the npm registry in one command.

```sh
makepack publish
```

---

## ⚙️ Configuration

Customize your project by creating a `makepack.js` file in the root directory. This file allows full control over the build and dev environment.

### 🔧 Default Configuration

```js
module.exports = (prevConfig) => ({
  build: {
    outdir: "build",
    types: true,
    formatPackageJson: (p) => p,
    configs: [
      {
        entryPoints: "src/**/*.{tsx,ts,js,jsx}",
        outdir: "esm",
        format: "esm",
        sourcemap: true,
        jsx: 'automatic',
        loader: {
          '.ts': 'ts',
          '.tsx': 'tsx'
        },
      },
      {
        entryPoints: "src/**/*.{tsx,ts,js,jsx}",
        outdir: "",
        format: "cjs",
        sourcemap: true,
        jsx: 'automatic',
        loader: {
          '.ts': 'ts',
          '.tsx': 'tsx'
        },
      }
    ]
  },
  start: {
    port: 5000,
    entry: "App.tsx",
  }
});
```

---

## 📜 License

`makepack` is released under the **MIT License**, allowing free usage in both open-source and commercial projects.

---

🚀 **Start building your next NPM package with `makepack` today!**

