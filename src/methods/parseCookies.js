export default str =>
  str
    .trim()
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
      if (v[1]){
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
      }
      return acc
    }, {})
