import {tables} from '../store.js'

export default id => {
  for (const table of Object.values(tables)) {
    if (table.id === id) {
      return table
    }
    if (table.mId === id) {
      return table
    }
  }
  return null
}
