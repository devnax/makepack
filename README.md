<div align="center">

<img src="./logo.png" alt="makepack" width="90"/>

# makepack

<strong>A zero‑config (yet configurable) CLI to scaffold, develop, build, and publish modern JavaScript / TypeScript / React libraries.</strong>

<p>
Create a production‑ready npm package in seconds: pick a template, start a hot‑reloading dev server, bundle to ESM + CJS (and optionally a single bundle), generate type declarations, and publish – all with one tool.
</p>

<p>
<!-- Badges (add/adjust once published on npm) -->
<a href="https://www.npmjs.com/package/makepack"><img src="https://img.shields.io/npm/v/makepack?color=3B82F6" alt="npm version"/></a>
<a href="https://github.com/devnax/makepack/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen" alt="build"/></a>
<a href="https://github.com/devnax/makepack/issues"><img src="https://img.shields.io/github/issues/devnax/makepack" alt="issues"/></a>
<a href="#license"><img src="https://img.shields.io/badge/license-TBD-lightgrey" alt="license"/></a>
</p>

</div>

---

## ✨ Features

- Rapid project creation with four templates:
	- TypeScript library
	- JavaScript library
	- React + TypeScript component library
	- React + JavaScript component library
- Development server with hot reload + optional Express middleware (`express.ts` / `express.js`)
- Automatic dependency graph tracking (via `madge`) for efficient reloads
- Incremental TypeScript compilation and declaration output
- Dual module build (`esm`, `cjs`, or both) with optional single bundled file
- Tree‑shaken and optionally minified output
- Sourcemaps & type declarations by default
- Clean build output in an isolated `.mpack` directory (publish‑ready)
- Simple release workflow (`makepack release` or `npm run release` guidance)

---

## 🚀 Quick Start

Install globally (recommended) or use `npx`.

```bash
npm install -g makepack            # global
# or
npx makepack create                # without global install
```

Create a new project:

```bash
makepack create
# Answer the interactive prompts:
#  - Project name
#  - Template
```

Enter the project (if created in a new folder) and start the dev server:

```bash
cd your-project
npm start
```

Build the library:

```bash
makepack build
```

Release (after building):

```bash
makepack release   # publishes the contents of ./.mpack to npm
```

> Tip: You can also run via package scripts (auto‑generated or added manually): `npm run build` / `npm run start`.

---

## 📦 Generated Project Structure

Depending on template, you’ll get something like:

```
your-lib/
	package.json
	readme.md
	tsconfig.json (TypeScript templates)
	src/
		index.(ts|js|tsx|jsx)
		(React templates include an example component + export)
```

During development/build:

```
.mpack/          # Build output (cleaned & regenerated each build)
	package.json   # Stripped (scripts & "type" removed for publishing clarity)
	readme.md
	dist files     # ESM/CJS outputs + declarations + sourcemaps
```

> Do not edit files inside `.mpack` directly. Treat it as a disposable publish directory.

---

## 🧪 Development Server

Run: `makepack start --port 3000`

Features:
- Hot reload on dependency change
- Optional custom Express bootstrap via a root `express.ts` or `express.js` exporting a default function `(app) => { ... }`
- Safe handler wrapping to catch async errors

Example `express.ts`:

```ts
import { Express } from 'express';

export default function routes(app: Express) {
	app.get('/health', (_req, res) => {
		res.json({ ok: true, ts: Date.now() });
	});
}
```

If present, it’s reloaded automatically when edited.

---

## 🏗 Build System

Command:

```bash
makepack build [options]
```

| Option                 | Default | Values               | Description                                         |
| ---------------------- | ------- | -------------------- | --------------------------------------------------- |
| `--format` / `-f`      | `both`  | `cjs`, `esm`, `both` | Module formats to output                            |
| `--bundle` / `-b`      | `false` | `true/false`         | Bundle into a single file (rollup/esbuild assisted) |
| `--minify` / `-m`      | `false` | `true/false`         | Minify output (Terser)                              |
| `--sourcemap` / `-s`   | `true`  | `true/false`         | Emit source maps                                    |
| `--declaration` / `-d` | `true`  | `true/false`         | Emit TypeScript `.d.ts` files                       |

Behavior notes:
- The tool auto‑detects `src/index.(ts|js|tsx|jsx)` as the entry.
- Boolean flags accept either actual booleans or string equivalents: `--minify=true`.
- Output is always placed in `.mpack/` (cleaned each run).
- `package.json` in output has `scripts` and `type` removed for neutral publishing.

### Example Builds

Dual build with declarations (default):

```bash
makepack build
```

ESM only, minified, bundled:

```bash
makepack build --format=esm --bundle=true --minify=true
```

Disable sourcemaps & declarations (faster):

```bash
makepack build -s=false -d=false
```

---

## 🚢 Releasing

1. Ensure you are logged in to npm: `npm login`
2. Build your package: `makepack build`
3. Publish from the generated directory:
	 - Quick command: `makepack release`
	 - Manual: `cd .mpack && npm publish`

> The release command simply runs `npm publish` inside `.mpack` after verifying a build exists.

---

## 🔌 Express Integration (Optional)

Add `express.ts` or `express.js` in the project root. Export a default function receiving the Express `app`. Example with middleware:

```ts
import compression from 'compression';

export default function(app) {
	app.use(compression());
	app.get('/', (_req, res) => res.send('Hello from makepack dev server'));
}
```

The file and all its dependency graph (resolved via `madge`) are watched; edits trigger a reload.

---

## 🧬 Technology Stack

| Area       | Tooling                                                                |
| ---------- | ---------------------------------------------------------------------- |
| CLI        | `commander`                                                            |
| Dev Server | `express`, `vite`, `chokidar`, `madge`                                 |
| Builds     | `rollup`, `@rollup/plugin-*`, `esbuild`, `rollup-plugin-dts`, `terser` |
| UX         | `inquirer`, `ora`                                                      |
| FS/Utils   | `fs-extra`, `lodash.debounce`                                          |

---

## 🛠 Templates Overview

| Template                | Use Case                      | Entry           | Extras              |
| ----------------------- | ----------------------------- | --------------- | ------------------- |
| `typescript`            | Library in TypeScript         | `src/index.ts`  | `tsconfig.json`     |
| `javascript`            | Plain JS library              | `src/index.js`  | –                   |
| `react with typescript` | React component library (TSX) | `src/index.tsx` | React + types setup |
| `react with javascript` | React component library (JSX) | `src/index.jsx` | React setup         |

Generated React templates export a sample component you can replace.

---

## 🔄 Lifecycle Summary

1. `create` → scaffold + install deps
2. `start` → hot dev (optionally with express middleware)
3. `build` → produce distributable code in `.mpack`
4. `release` → publish the build to npm

---

## 📘 Command Reference

```bash
makepack create            # Interactive project scaffolding
makepack start --port 4000 # Start dev server on custom port
makepack build [flags]     # Build library
makepack release           # Publish from .mpack
```

See build flags in the [Build System](#-build-system) section.

---

## 🧩 Using From `package.json`

You can wire scripts (some templates already do this):

```jsonc
{
	"scripts": {
		"start": "makepack start --port 3000",
		"build": "makepack build",
		"release": "makepack release"
	}
}
```

Run with `npm run build` etc.

---

## 🧷 Best Practices

- Keep a clean root: limit extra build artifacts outside `src/`.
- Export your public API from a single `src/index.*`.
- Use semantic versioning (e.g. `npm version patch`).
- For React libraries, avoid bundling peer deps – list `react` & `react-dom` as `peerDependencies` in your own `package.json` before publishing.
- Add a LICENSE file (see below) – required for many consumers.

---

## 🐞 Troubleshooting

| Issue                 | Cause                                | Fix                                                                     |
| --------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| "No entry file found" | Missing `src/index.*`                | Create `src/index.ts` or equivalent                                     |
| Express not reloading | File outside dependency graph        | Import files directly from `express.(ts                                 | js)` |
| Declarations missing  | `--declaration=false` or JS template | Use TS template or enable flag                                          |
| Publish fails         | Not built                            | Run `makepack build` first                                              |
| ESM import errors     | Missing `"type": "module"` in root   | Add `type` back in your source project (it’s stripped only in `.mpack`) |

---

## 🤝 Contributing

Contributions welcome! Suggested flow:

1. Fork & clone
2. Create a feature branch: `git checkout -b feat/your-idea`
3. Implement + add/update docs
4. Commit with conventional style: `feat(build): add xyz`
5. Open a PR

Please include clear reproduction steps for any bug fix.

### Future Ideas (Open for PRs)
- Plugin system for custom build steps
- Peer dependency auto‑detection
- Template customization presets
- E2E test harness

---

## 🔐 Security

No network calls are performed beyond npm install/publish and user code execution. Always audit generated dependencies before publishing.

Report vulnerabilities via GitHub Issues (consider labeling as `security`). Avoid posting exploit details publicly – request a private channel if needed.

---

## 📄 License

License: **TBD** (e.g. MIT). Add a `LICENSE` file such as:

```text
MIT License
Copyright (c) 2025 Devnax
Permission is hereby granted, free of charge, to any person obtaining a copy...
```

---

## 🙋 FAQ

**Why strip `scripts` and `type` from the published package.json?**  
To minimize accidental exposure of internal scripts and to keep the distributed package neutral; consumers rarely need them.

**Can I output only one format?**  
Yes: `--format=esm` or `--format=cjs`.

**How do I include assets (e.g. CSS)?**  
Import them from your entry; configure rollup/esbuild plugins in future versions (PRs welcome) – currently you’d manually copy in a post-step.

**Does it support monorepos?**  
Not natively; you can still run it per package folder.

**Why another tool?**  
To reduce the ceremony of picking + wiring rollup, tsconfig, scripts, vite dev preview, express hooks, and publish layout – all unified.

---

## 📬 Support

Open an issue for bugs, ideas, or questions: https://github.com/devnax/makepack/issues

---

<div align="center">
<sub>Built with ❤️ to streamline modern package creation.</sub>
</div>

