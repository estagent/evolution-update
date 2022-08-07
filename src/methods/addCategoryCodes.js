import addWalletCode from './addWalletCode.js'

export default (table, categoryCode) => {

  addWalletCode(table, `${categoryCode}:${table.id}`)

  if (table.vId) {
    addWalletCode(table, `${categoryCode}:${table.vId}`)
  }

  if (table.mvId) {
    addWalletCode(table, `${categoryCode}:${table.mvId}`)
  }

  if (table.mId) {
    addWalletCode(table, `${categoryCode}:${table.mId}`)
  }
}
