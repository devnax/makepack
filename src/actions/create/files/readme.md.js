
export default async (info) => {
   let pkgname = info.projectDirName
   const content = `# ${pkgname}

[![npm version](https://img.shields.io/npm/v/${pkgname}.svg)](https://www.npmjs.com/package/${pkgname})
[![License](https://img.shields.io/npm/l/${pkgname}.svg)](https://github.com/your-username/${pkgname}/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dt/${pkgname}.svg)](https://www.npmjs.com/package/${pkgname})

A brief description of what your package does and its purpose.

## Installation

\`\`\`sh
npm install ${pkgname}
\`\`\`

or with yarn:

\`\`\`sh
yarn add ${pkgname}
\`\`\`

## Usage

\`\`\`js
   import { feature } from "${pkgname}";

   const result = feature("example");
   console.log(result);
\`\`\`

## API

### \`feature(input: string): string\`
Description of the function and its parameters.

## Configuration (if applicable)
Explain any configuration options if your package requires setup.

## Examples
Provide additional usage examples for clarity.

## Contributing
Contributions are welcome! Please follow the guidelines in [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Links
- [GitHub Repository](https://github.com/your-username/${pkgname})
- [NPM Package](https://www.npmjs.com/package/${pkgname})

---

Feel free to modify this template based on your package's specific needs.
`;
   return {
      content,
      filename: `readme.md`
   }
}