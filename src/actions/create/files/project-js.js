export default (args) => {
  const content = `
function add(a, b) {
  return a + b;
}

export default add
  `
  return {
    content,
    filename: `${args.rootdir}/${args.entry}`
  }
}