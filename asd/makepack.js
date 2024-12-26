const makepack = {
  "template": "typescript",
  "serve": {
    "port": 3000,
    "entry": "src/index.ts"
  },
  "build": {
    "entry": "src/**/*.{tsx,ts,js,jsx}",
    "outdir": "build",
    "esbuild": {}
  }
}
export default makepack
