import assert from 'assert'
import { beforeAll, afterAll, describe, it, expect } from 'vitest'

import { FastAxios } from '../src'
import { httpServer, sleep } from './helper'

const port = 9001
beforeAll(async () => {
  await httpServer.listen(port)
})
afterAll(httpServer.close)

const http = new FastAxios({
  baseURL: 'http://127.0.0.1:' + port,
})

describe('http', () => {
  it('should work', async () => {
    expect(http.requestSize).toEqual(0)
    http.get('/api/hello-world').then(res => {
      expect(res.status).toEqual(200)
      expect(res.statusText).toEqual('OK')
      expect(res.data).toEqual('hello world')
    })
    http.post('/api/sleep').then(res => {
      expect(res.status).toEqual(200)
      expect(res.statusText).toEqual('OK')
      expect(res.data).toEqual('hello world')
    })
    expect(http.requestSize).toEqual(0)
    await sleep()
    expect(http.requestSize).toEqual(2)
    await sleep(30)
    expect(http.requestSize).toEqual(0)
  })

  it('should cancel synchronous repetitive request', async () => {

    const [res1, res2] = await Promise.allSettled([
      http.post('/api/sleep', '100'),
      http.post('/api/sleep', '50'),
    ])
    expect(http.requestSize).toEqual(0)

    expect(res1.status).toEqual('rejected')
    assert(res1.status === 'rejected')
    expect(res1.reason.code).toEqual('ERR_CANCELED')
    expect(res1.reason.message).toEqual('canceled')

    expect(res2.status).toEqual('fulfilled')
    assert(res2.status === 'fulfilled')
    expect(res2.value.status).toEqual(200)
    expect(res2.value.statusText).toEqual('OK')
    expect(res2.value.data).toEqual('hello world')
  })

  it('should cancel asynchronous repetitive request', async () => {

    http.post('/api/sleep', '100').then(res => {
      expect(res).toBeFalsy()
    }).catch(err => {
      expect(err.code).toEqual('ERR_CANCELED')
      expect(err.message).toEqual('canceled')
    })
    expect(http.requestSize).toEqual(0)
    await sleep()
    expect(http.requestSize).toEqual(1)

    http.post('/api/sleep', '50').then(res => {
      expect(res.status).toEqual(200)
      expect(res.statusText).toEqual('OK')
      expect(res.data).toEqual('hello world')
    })
    await sleep()
    expect(http.requestSize).toEqual(1)
    await sleep(60)
    expect(http.requestSize).toEqual(0)
  })

  it('should permit repetitive request', async () => {

    http.post('/api/sleep', '100', {
      cancelWhenRepeated: false,
    }).then(res1 => {
      expect(res1.status).toEqual(200)
      expect(res1.statusText).toEqual('OK')
      expect(res1.data).toEqual('hello world')
    })
    await sleep()
    expect(http.requestSize).toEqual(1)

    http.post('/api/sleep', '50').then(res2 => {
      expect(res2.status).toEqual(200)
      expect(res2.statusText).toEqual('OK')
      expect(res2.data).toEqual('hello world')
    })
    await sleep(30)
    expect(http.requestSize).toEqual(2)
    await sleep(80)
    expect(http.requestSize).toEqual(0)
  })

  it('should cancel request when clearRequests is called', async () => {
    http.post('/api/sleep', '100').then(res => {
      expect(res).toBeFalsy()
    }).catch(err => {
      expect(err.code).toEqual('ERR_CANCELED')
      expect(err.message).toEqual('canceled')
    })
    await sleep()
    expect(http.requestSize).toEqual(1)

    await sleep(50)
    http.clearRequests()
    await sleep()
    expect(http.requestSize).toEqual(0)
  })

  it('should permit request when clearRequests is called', async () => {
    http.post('/api/sleep', '100', {
      cancelWhenClearing: false,
    }).then(res => {
      expect(res.status).toEqual(200)
      expect(res.statusText).toEqual('OK')
      expect(res.data).toEqual('hello world')
    })
    await sleep()
    expect(http.requestSize).toEqual(1)

    await sleep(50)
    http.clearRequests()
    await sleep()
    expect(http.requestSize).toEqual(1)
    await sleep(50)
  })
})
