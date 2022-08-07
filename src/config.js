export default {
  socket: {
    url: 'wss://{SERVER_NAME}/public/lobby/socket/v2/{PATH}?messageFormat=json&device={DEVICE}&instance=avrq0-{PATH}-&intent=rng&EVOSESSIONID={SESSION_ID}&client_version=6.20220726.62639.13703-ec70633513',
    timeout: 2000,
  },
  agent: {
    desktop:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    mobile:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  },
}
