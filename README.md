# MakePack CLI Documentation

## Overview

**MakePack** is a command-line interface (CLI) tool that helps you to quickly set up, build, and manage JavaScript, TypeScript, React, and React-TypeScript libraries for use in npm projects. With just a few simple commands, you can generate your own libraries, start a development server, or build and publish your project to the npm repository.

## Installation

To install **MakePack** globally, run the following command:

```bash
npm install -g makepack
```

This will allow you to use the `makepack` command anywhere in your terminal.

## Commands

### `create`

The `create` command is used to create a new library project. It initializes the project structure, configures essential files, and sets up the environment for you to start working on your library.

#### Usage

```bash
makepack create
```

#### Description

- Creates a new library project by setting up the necessary configurations and boilerplate files.
  
This command will guide you through the initial setup for your library.

---

### `serve`

The `serve` command starts a development server for your library, providing you with a live-reload environment where you can test and iterate on your library in real-time.

#### Usage

```bash
makepack serve [options]
```

#### Options

- `-p, --port <type>`  
  _Port number_ (default is `3000`).
  
- `-e, --entry <type>`  
  _Entry file_ (optional). The entry point for your application. Specify the main JavaScript/TypeScript file to start the server.

#### Description

- Starts a local development server for testing and debugging your library.
  
Example:

```bash
makepack serve --port 4000 --entry src/index.ts
```

---

### `pack`

The `pack` command is used to build your library and optionally publish it to the npm repository. This command compiles your code into a distributable format and prepares it for sharing with others.

#### Usage

```bash
makepack pack [options]
```

#### Options

- `-e, --entry <type>`  
  _Entry file or directory_ (default is `src/**/*.{tsx,ts,js,jsx}`).  
  Specify the entry file or use a glob pattern to select the files to include in your library.

- `-p, --publish`  
  _Publish the project to the npm repository_ (default is `false`).  
  Add this flag if you want to publish the library to npm after building it.

#### Description

- Builds the project by compiling and bundling your library.
- Optionally publishes the library to the npm repository.

Example:

```bash
makepack pack --entry src/index.ts --publish
```

This will compile the project from `src/index.ts` and then publish the library to npm.

---

## Example Workflow

1. Create a new project:

```bash
makepack create
```

2. Start the server for development:

```bash
makepack serve --port 4000 --entry src/index.ts
```

3. Once you're ready to build and publish your library:

```bash
makepack pack --entry src/**/*.{tsx,ts,js,jsx} --publish
```

This will build your library and publish it to npm.

## GitHub Repository

For more details, open issues, or contribute to the project, visit the [MakePack GitHub Repository](https://github.com/devnax/makepack).

---

## License

This project is licensed under the MIT License. See the LICENSE file for more information.