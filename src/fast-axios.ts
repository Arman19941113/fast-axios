import axios, {
  AxiosInstance,
  CreateAxiosDefaults,
  RawAxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { RequestCache, RequestConfig } from './request-cache'

export interface UserConfig extends RawAxiosRequestConfig {
  cancelWhenRepeated?: boolean
  cancelWhenClearing?: boolean
}

export interface FastAxiosConfig {
  onReqFulfilled?: ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>) | null
  onReqRejected?: ((error: any) => any) | null
  onResFulfilled?: ((config: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>) | null
  onResRejected?: ((error: any) => any) | null
}

export class FastAxios {
  axiosInstance: AxiosInstance
  requestCache: RequestCache

  constructor (createAxiosConfig: CreateAxiosDefaults, {
    onReqFulfilled,
    onReqRejected,
    onResFulfilled,
    onResRejected,
  }: FastAxiosConfig = {}) {
    const axiosInstance = axios.create(createAxiosConfig)
    const requestCache = new RequestCache()

    axiosInstance.interceptors.request.use(function (config) {
      // Do something before request is sent
      requestCache.cancelRepeatedRequest((config as RequestConfig)._requestId)
      requestCache.add(config as RequestConfig)
      return onReqFulfilled ? onReqFulfilled(config) : config
    }, function (error) {
      // Do something with request error
      return onReqRejected ? onReqRejected(error) : Promise.reject(error)
    })

    axiosInstance.interceptors.response.use(function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      requestCache.delete(response.config as RequestConfig)
      return onResFulfilled ? onResFulfilled(response) : response
    }, function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      // For canceled request: error.code === 'ERR_CANCELED'
      requestCache.delete(error.config as RequestConfig)
      return onResRejected ? onResRejected(error) : Promise.reject(error)
    })

    this.axiosInstance = axiosInstance
    this.requestCache = requestCache
  }

  get requestSize (): number {
    return this.requestCache.size
  }

  clearRequests (): number {
    return this.requestCache.clearRequests()
  }

  request<T> (
    method: 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch' | 'postForm' | 'putForm' | 'patchForm',
    url: string,
    data?: any,
    userConfig?: UserConfig,
  ): Promise<AxiosResponse<T>> {

    const controller = new AbortController()
    const requestConfig = {
      cancelWhenRepeated: true,
      cancelWhenClearing: true,
      ...userConfig,
      signal: controller.signal,
      _requestId: `${method.toUpperCase()} ${url}`,
      _abortController: controller,
    }

    return (method === 'get' || method === 'head' || method === 'delete' || method === 'options')
      ? this.axiosInstance[method]<T>(url, requestConfig)
      : this.axiosInstance[method]<T>(url, data, requestConfig)
  }

  get<T> (url: string, userConfig?: UserConfig) {
    return this.request<T>('get', url, null, userConfig)
  }

  delete<T> (url: string, userConfig?: UserConfig) {
    return this.request<T>('delete', url, null, userConfig)
  }

  head<T> (url: string, userConfig?: UserConfig) {
    return this.request<T>('head', url, null, userConfig)
  }

  options<T> (url: string, userConfig?: UserConfig) {
    return this.request<T>('options', url, null, userConfig)
  }

  post<T> (url: string, data?: any, userConfig?: UserConfig) {
    return this.request<T>('post', url, data, userConfig)
  }

  put<T> (url: string, data?: any, userConfig?: UserConfig) {
    return this.request<T>('put', url, data, userConfig)
  }

  patch<T> (url: string, data?: any, userConfig?: UserConfig) {
    return this.request<T>('patch', url, data, userConfig)
  }

  postForm<T> (url: string, data?: any, userConfig?: UserConfig) {
    return this.request<T>('postForm', url, data, userConfig)
  }

  putForm<T> (url: string, data?: any, userConfig?: UserConfig) {
    return this.request<T>('putForm', url, data, userConfig)
  }

  patchForm<T> (url: string, data?: any, userConfig?: UserConfig) {
    return this.request<T>('patchForm', url, data, userConfig)
  }
}
