const FUNDIST_SYSTEM_CODE = '998'

export default (table, code) =>
  !table.codes.includes(FUNDIST_SYSTEM_CODE + ':' + code)
    ? table.codes.push(FUNDIST_SYSTEM_CODE + ':' + code)
    : null
