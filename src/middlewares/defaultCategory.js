import {categories, tables} from '../store.js'


/**
 * @param defaultId
 * @returns {null}
 */
export default defaultId => {
  const defaultCategory = categories.find(c => c.id === defaultId)

  if (!(defaultCategory instanceof Object)) {
    throw `defaultCategory ${defaultId} not found!`
  }

  const ignoreList = [
    'rng',
    'new',
    'salon_prive',
    'dual_play',
    'speed',
    'native_dealer',
    'my_list',
    'recently_played',
  ]
  for (const table of Object.values(tables)) {

    const categoryCount = table.categories.filter(categoryId => {
      const category = categories.find(c => c.id === categoryId)
      return category.special === false || !ignoreList.includes(categoryId)
    }).length

    if (categoryCount  === 0 && !table.categories.includes(defaultCategory.id)){
      table.categories.push(defaultCategory.id)
    }
  }
  return null
}
