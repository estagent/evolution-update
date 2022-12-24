import evolutionRequest from 'request-promise'
import config from './config.js'

const getLobbyURL = async (player, url, opts = {}) =>
  evolutionRequest({
    method: 'GET',
    uri: url,
    simple: false,
    followRedirect: false,
    resolveWithFullResponse: true,
    headers: {
      'User-Agent': player.mobile ? config.agent.mobile : config.agent.desktop,
    },
    timeout: opts.timeout || 5000,
    transform: function (body, response, resolveWithFullResponse) {
      if (response.statusCode === 302) return response.headers.location
    },
  })

const getEvolutionCookies = async (player, url, opts = {}) =>
  evolutionRequest({
    method: 'GET',
    uri: url,
    simple: false,
    followRedirect: false,
    resolveWithFullResponse: true,
    headers: {
      'User-Agent': player.mobile ? config.agent.mobile : config.agent.desktop,
    },
    timeout: opts.timeout || 5000,
    transform: function (body, response, resolveWithFullResponse) {
      if (response.statusCode === 302) {
        return response.headers['set-cookie']
      }
    },
  })

export default async (player, loginURL, opts = {}) => {
  let cookieUrl = await getLobbyURL(player, loginURL, opts)

  if (!cookieUrl) {
    throw 'cookie url not found'
  }

  const url = new URL(loginURL)

  if (!/^(ht)tps?:\/\//i.test(cookieUrl)) {
    cookieUrl = `${url.protocol}//${url.host}${
      cookieUrl.startsWith('/') ? cookieUrl : '/' + cookieUrl
    }`
  }

  const cookies = await getEvolutionCookies(player, cookieUrl, opts)

  if (!(cookies instanceof Array)) {
    throw 'cookies is not an array'
  }

  let re = /(\w+=[^\s\r\n]+;?).*/
  return cookies.map(cookie => cookie.replace(re, '$1')).join(' ')
}
