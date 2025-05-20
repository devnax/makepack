export default async () => {
  const content = `
function sum(a, b) {
  return a + b;
}

export default sum
  `
  return {
    content,
    filename: `src/index.js`
  }
}