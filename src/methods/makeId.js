export default (max_length = 10) => {
  let text = ''
  let possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < max_length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}