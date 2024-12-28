export default args => {
  const content = `
function add(a: number, b: number): number {
  return a + b;
}
export default add`
  return {
    content,
    filename: `${args.rootdir}/${args.entry}`
  }
}