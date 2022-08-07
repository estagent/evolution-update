import {Request} from './request.js'
import listenSocket from './listenSocket.js'
import loadStringPlugins from '@revgaming/strings'
import {categories, types, tables} from './store.js'
import categoryMiddleware from './middlewares/categoryFromTitle.js'
import defaultCategory from './middlewares/defaultCategory.js'
import error from '@revgaming/error'

export class EvolutionUpdate {
  constructor(opts = {}) {
    loadStringPlugins()
    this.request = new Request(opts)
    this.paths = {
      players: opts.paths?.players || 'players/?account={account}',
      games: opts.paths?.games || 'games',
    }
    this.account = opts.account
  }

  async updateTables(opts = {}) {
    return await this.request
      .get(this.paths.players.replace('{account}', this.account))
      .then(async players => {
        for (const player of players) {
          await this.request
            .post('/players', {...player, account: this.account})
            .then(async url => {
              try {
                const result = await listenSocket(player, url, opts)

                if (process.env.APP_DEBUG === true) {
                  console.log(
                    `${player.login_name} ${
                      player.IsMobile ? 'Phone' : 'Desktop'
                    } ${result}`,
                  )
                }
              } catch (err) {
                throw `${player.login_name}: ${error(err)}`
              }
            })
        }
        categoryMiddleware('blackjack')
        categoryMiddleware('roulette')
        categoryMiddleware('baccarat_sicbo')
        defaultCategory('game_shows')
        return {
          createdAt: new Date().getTime(),
          account: this.account,
          types: types,
          categories: categories,
          tables: Object.values(tables),
          count: Object.keys(tables).length,
        }
      })
  }

  async updateGames(data, params = {}, options = {}) {
    return this.request.post(
      this.paths.games,
      {
        data: data,
        ...params,
      },
      {timeout: 60000, ...options},
    )
  }
}
