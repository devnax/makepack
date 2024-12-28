export default args => {
  const content = `
function add(a: number, b: number): number {
  return a + b;
}
console.log(add(5, 3));`
  return {
    content,
    filename: `${args.rootdir}/${args.entry}`
  }
}