import {Request} from './request.js'
import listenSocket from './listenSocket.js'
import loadStringPlugins from '@revgaming/strings'
import {categories, types, tables} from './store.js'
import categoryMiddleware from './middlewares/categoryFromTitle.js'
import defaultCategory from './middlewares/defaultCategory.js'
import error from '@revgaming/error'
import config from './config.js'

export class EvolutionUpdate {
  constructor(opts = {}) {
    loadStringPlugins()
    this.request = new Request(opts)
  }


  async updateTables(opts = {}) {


    return await this.request.get('profiles').then(async profiles => {

      let account

      for (const profile of profiles) {
        await this.request
          .post('login', profile, {
            headers: {
              'User-Agent': profile.mobile
                ? config.agent.mobile
                : config.agent.desktop,
            },
          })
          .then(async data => {
            try {

              const player = {...data.player, ...profile}
              const result = await listenSocket(player, data.url, opts)

              if (!account) {
                account = player.account
              }

              if (process.env.APP_DEBUG === true) {
                console.log(
                  `${player.login_name} ${
                    profile.mobile ? 'Phone' : 'Desktop'
                  } ${result}`,
                )
              }
            } catch (err) {
              throw `${error(err)}`
            }
          })
      }
      categoryMiddleware('blackjack')
      categoryMiddleware('roulette')
      categoryMiddleware('baccarat_sicbo')
      defaultCategory('game_shows')
      return {
        createdAt: new Date().getTime(),
        account: account,
        types: types,
        categories: categories,
        tables: Object.values(tables),
        count: Object.keys(tables).length,
      }
    })
  }

  async updateGames(data, params = {}, options = {}) {
    return this.request.post('tables', {
        data: data,
        ...params,
      },
      {timeout: 60000, ...options},
    )
  }
}
