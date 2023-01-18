import type { AxiosRequestConfig } from 'axios'

export interface RequestConfig extends AxiosRequestConfig {
  cancelWhenRepeated: boolean
  cancelWhenClearing: boolean
  _requestId: string
  _abortController: AbortController
}

export class RequestCache {
  readonly #set: Set<RequestConfig>

  constructor () {
    this.#set = new Set()
  }

  get size (): number {
    return this.#set.size
  }

  add (requestConfig: RequestConfig): Set<RequestConfig> {
    return this.#set.add(requestConfig)
  }

  delete (requestConfig: RequestConfig): boolean {
    return this.#set.delete(requestConfig)
  }

  cancelRepeatedRequest (newRequestId: string): boolean {
    for (const requestConfig of this.#set) {
      if (requestConfig.cancelWhenRepeated && requestConfig._requestId === newRequestId) {
        requestConfig._abortController.abort('Cancel repeated request')
        return true
      }
    }

    return false
  }

  clearRequests (): number {
    const requests = []
    for (const requestConfig of this.#set) {
      if (requestConfig.cancelWhenClearing) {
        requests.push(requestConfig)
      }
    }
    for (const request of requests) {
      request._abortController.abort('Cancel request manually')
    }
    return requests.length
  }
}
