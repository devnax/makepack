export default async (args) => {
  const content = `
function add(a: number, b: number): number {
  return a + b;
}
export default add`
  return {
    content,
    filename: `${args.sourceDir}/${args.sourceEntry}`
  }
}