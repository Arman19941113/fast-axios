import * as http from 'http'

import { logger } from './util'

const server = http.createServer(async function (request, response) {
  const path = request.url
  switch (path) {
    case '/api/hello-world': {
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json')
      response.write('hello world')
      response.end()
      break
    }
    case '/api/sleep': {
      const buffers = []
      for await (const chunk of request) {
        buffers.push(chunk)
      }
      const data = JSON.parse(Buffer.concat(buffers).toString() || 'null')
      setTimeout(() => {
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.write('hello world')
        response.end()
      }, Number(data))
      break
    }
    default: {
      response.statusCode = 404
      response.setHeader('Content-Type', 'application/json')
      response.write('Not Found')
      response.end()
    }
  }
})

export const httpServer = {
  listen (port = 9000) {
    return new Promise((resolve, reject) => {
      server.listen(port)
        .on('listening', function () {
          logger('Listening http://127.0.0.1:' + port)
          resolve(true)
        })
        .on('error', function (error) {
          reject(error)
        })
    })
  },
  close () {
    server.close()
  },
}
