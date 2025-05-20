export default async () => {
  const content = `
function add(a, b) {
  return a + b;
}

export default add
  `
  return {
    content,
    filename: `src/index.js`
  }
}