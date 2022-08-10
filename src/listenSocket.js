import {WebSocket} from 'ws'
import getCookies from './getCookies.js'
import parseCookies from './methods/parseCookies.js'
import addWalletCode from './methods/addWalletCode.js'
import findTable from './methods/findTable.js'
import makeId from './methods/makeId.js'
import normaliseCategoryCode from './methods/normaliseCategoryCode.js'
import config from './config.js'

import {categories, tables, types} from './store.js'
import addCategoryCodes from './methods/addCategoryCodes.js'

export default async (player, entryString, opts = {}) => {
  let timer

  const cookieString = await getCookies(player, entryString, opts)
  const cookies = parseCookies(cookieString)

  const entryURL = new URL(entryString)

  if (!cookies.EVOSESSIONID) {
    throw 'EVOSESSIONID not found'
  }

  const socketTimeout = opts.socket?.timeout || 2000

  return new Promise(function (resolve, reject) {
    const socketURL = config.socket.url
      .replace('{SERVER_NAME}', entryURL.hostname)
      .replaceAll('{PATH}', cookies.EVOSESSIONID.slice(0, 16))
      .replace('{SESSION_ID}', cookies.EVOSESSIONID)
      .replace('{DEVICE}', player.IsMobile ? 'Phone' : 'Desktop')

    const socket = new WebSocket(socketURL, {
      origin: entryString.replace(entryURL.search, ''),
      headers: {
        Cookie: cookieString,
        'User-Agent':
          player.IsMobile === 1 ? config.agent.mobile : config.agent.desktop,
      },
      timeout: socketTimeout,
    })

    socket
      .on('open', function open() {
        sendMessage({
          id: makeId(10),
          type: 'lobby.initLobby',
          args: {version: 2},
        })
      })
      .on('message', function (text) {
        let data = JSON.parse(text)
        switch (data.type) {
          case 'lobby.configs':
            Object.keys(data.args.configs).map(id => {
              const table = data.args.configs[id]

              // optimization for mobile codes. supress new game creation for mobile code
              if (player.IsMobile && id.includes(':') && !tables[id]) {
                const ids = id.split(':')
                const mainId = ids[0]
                const vId = ids[1]

                for (const item of Object.values(tables)) {
                  if (
                    item.id.includes(mainId) &&
                    item.platforms.includes('Desktop') &&
                    (item.gt === table.gt || item.mt === table.gt) &&
                    item['gst'] === table['gst'] &&
                    item.limits[player.currency]?.max === table['bl'].max
                  ) {
                    // optimisation MUST run for all runtime cycles!   // if !item.mId &&  NEVER!!!
                    if (!item.mId || item.mId === id) {
                      item.mId = id // mobile  xxxx:xxxx
                      item.mvId = vId // xxxx
                      item.MobilePageCode = `${item.gt}:${id}`
                      addWalletCode(item, `${item.mt ?? item.gt}:${vId}`)
                      id = item.id // do not create new Game for mobile code!!!
                      break
                    } else {
                      console.warn(
                        `MULTIPLE_MOBILE_CODE_FOUND  Table [${mainId}] [${item.mId}]  [${id}]`,
                      ) // this means it is already solved we did not set id. (v_table is not-optimized)
                    }
                  }
                }
              }

              if (!tables[id]) {
                table.id = id
                table.platforms = []
                table.limits = {}
                table.categories = []
                table.codes = []

                if (!table.gt) {
                  throw `table type not exists for table id [${id}]`
                }

                table.PageCode = `${table.gt}:${table.id}`

                addWalletCode(table, `${table.gt}:${id}`)
                if (id.includes(':')) {
                  table.vId = id.split(':')[1]
                  addWalletCode(table, `${table.gt}:${table.vId}`)
                }

                if (table['gst']) {
                  const subType = table['gst']
                  const mainType = table.gt
                  table.mt = mainType
                  if (subType.includes(mainType)) {
                    table.gt = subType
                  } else {
                    table.gt = `${subType} ${mainType}`.kebab()
                  }

                  if (!types.includes(mainType)) {
                    types.push(mainType)
                  }
                }

                if (!types.includes(table.gt)) {
                  types.push(table.gt)
                }

                table.platforms.push(player.IsMobile ? 'Phone' : 'Desktop')

                if (table['bl'] instanceof Object) {
                  table.limits[player.currency] = table['bl']
                }

                delete table['bl']
                tables[id] = table
              } else {
                if (
                  table['bl'] instanceof Object &&
                  !(tables[id].limits[player.currency] instanceof Object)
                ) {
                  // #USD_EUR_SAME_LIMITS
                  if (player.currency === 'eur') {
                    tables[id].limits['eur'] = table['bl']
                    tables[id].limits['usd'] = table['bl']
                  } else {
                    tables[id].limits[player.currency] = table['bl']
                  }
                }

                const platform = player.IsMobile ? 'Phone' : 'Desktop'

                if (!tables[id].platforms.includes(platform)) {
                  tables[id].platforms.push(platform)
                }
              }
            })
            break
          case 'lobby.categories':
            for (const category of data.args.categories) {
              const categoryCode = normaliseCategoryCode(category)

              for (const id of category['tables']) {
                const table = findTable(id)

                if (table instanceof Object) {
                  if (!table.categories.includes(category.id)) {
                    table.categories.push(category.id)
                  }

                  if (categoryCode) {
                    addCategoryCodes(table, categoryCode)
                  }
                } else {
                  console.error(
                    `CATEGORIES_TABLE_NOT_FOUND  Category [${category.id}]  Table [${id}]`,
                  )
                }
              }
              if (!categories.map(c => c.id).includes(category.id)) {
                delete category['tables']
                categories.push(category)
              }
            }
            break

          case 'lobby.thumbnails': // images
            for (const id of Object.keys(data.args.thumbnails)) {
              const thumbnails = data.args.thumbnails[id]
              const table = findTable(id)
              if (table instanceof Object && !table['thumbnail']) {
                if (thumbnails['16:9'] && thumbnails['template']) {
                  table['thumbnail'] = thumbnails['template'].replace(
                    '%s',
                    thumbnails['16:9']['L'],
                  )
                } else {
                  console.error(`{id} has different thumbnail data`)
                }
              }
            }
            break

          case 'lobby.videos': // streams
            for (const id of Object.keys(data.args.videos)) {
              const video = data.args.videos[id]
              const table = findTable(id)
              if (table instanceof Object && !table['video']) {
                if (video['host'] && video['res'] instanceof Object) {
                  table['video'] = video.host
                    .concat('/')
                    .concat(video.res.MEDIUM ?? video.res.HIGH)
                } else {
                  console.error(`{id} has different video data`)
                }
              }
            }

            done()

            break

          case 'lobby.categoriesOrder':
          case 'lobby.seats': // online players
          case 'lobby.infos': // dealers
          case 'lobby.infoUpdated': // dealers
          case 'lobby.histories': // result histories
          case 'lobby.historyUpdated':
          case 'lobby.hero': // reklam
          case 'lobby.jackpots': // jackpots
          case 'lobby.playerData':
          case 'lobby.settings':
          case 'lobby.mylist':
          case 'lobby.balanceUpdated':
          case 'lobby.playersCount':
          case 'lobby.playerTables':
            break
          case 'connection.kickout':
            reject('connection.kickout')
            break

          default:
            console.info('OTHER', data.type, data.args)
        }
      })
      .on('close', function () {
        clearTimeout(timer)
        reject('closed')
      })

    const done = () => {
      clearTimeout(timer)
      socket.terminate()
      resolve('done')
    }

    const sendMessage = message => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        socket.terminate()
        reject('socket timeout')
      }, socketTimeout)
      socket.send(JSON.stringify(message))
    }
  })
}
