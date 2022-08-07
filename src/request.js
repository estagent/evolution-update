import axios from 'axios'
import error from '@revgaming/error'
import config from './config.js'

axios.defaults.timeoutErrorMessage = 'timeout exceeded'

export function Request(options = {}) {
  const request = axios.create({
    baseURL: options.url,
    withCredentials: false,
    maxRedirects: 0,
    timeout: options['timeout'] || 30000,
    headers: {
      'User-Agent': options['agent'] || config.agent.desktop,
      Authorization: `Bearer ${options['token']}`,
    },
  })
  request.interceptors.response.use(
    response => response.data,
    err => {
      throw error(err)
    },
  )
  return request
}
