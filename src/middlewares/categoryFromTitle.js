import {categories, tables} from '../store.js'
import normaliseCategoryCode from '../methods/normaliseCategoryCode.js'
import addCategoryCodes from '../methods/addCategoryCodes.js'

export default (str) => {
  const category = categories.find(c => c.id === str)

  if (!(category instanceof Object)) {
    throw `category ${str} not found!`
  }

  const categoryCode = normaliseCategoryCode(category)

  const re = new RegExp(categoryCode, 'i')

  for (const table of Object.values(tables)) {
    if (table.title.match(re) && !table.categories.includes(category.id)) {
      table.categories.push(category.id)
      if (categoryCode){
        addCategoryCodes(table,categoryCode)
      }
      if (process.env.APP_DEBUG === true) {
        console.log(
          `Table [${table.id}][${table.title}] added to ${category.id} with title`,
        )
      }
    }
  }
  return null
}
