export default  category => {
  switch (category.id) {
    case 'baccarat_sicbo':
      return 'baccarat'
    case 'rng':
    case 'game_shows':
      return false
    default:
      return category.special ? false : category.id
  }
}