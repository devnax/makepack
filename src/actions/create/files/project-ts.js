export default async () => {
  const content = `
function sum(a: number, b: number): number {
  return a + b;
}
export default sum`
  return {
    content,
    filename: `src/index.ts`
  }
}