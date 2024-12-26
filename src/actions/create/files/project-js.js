export default (args) => {
  const content = `
function add(a, b) {
  return a + b;
}

console.log(add(5, 3));
  `
  return {
    content,
    filename: `${args.rootdir}/${args.entry}`
  }
}