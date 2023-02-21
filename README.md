# Fast Axios

Promise based HTTP client built on axios.

1. Cancel repeated(with same url and method) request whose `config.cancelWhenRepeated` is true
2. Cancel all the requests whose `config.cancelWhenClearing` is true when `clearRequests()` is called

## Install

```
pnpm add @armantang/fast-axios
```

## Quick Start

```js
const http = new FastAxios({
  timeout: 10000,
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
}, {
  onReqFulfilled: function (config) {
    // Do something before request is sent
    return config
  },
  onReqRejected: function (error) {
    // Do something with request error
    return Promise.reject(error)
  },
  onResFulfilled: function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    const resData = response.data
    if (resData.code === 0) {
      return resData
    } else {
      const message = `${resData.code} ${resData.message}`
      messageError(message)
      return Promise.reject(new Error(message))
    }
  },
  onResRejected: function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // For canceled request: error.code === 'ERR_CANCELED'
    if (error.code !== 'ERR_CANCELED') {
      messageError(error.message)
    }
    return Promise.reject(error)
  },
})
```

## cancelWhenRepeated (default `true`)

```js
http.get('/api/foo') // will be canceled
http.get('/api/foo', { cancelWhenRepeated: false }) // wonn't be canceled
http.get('/api/foo') // wonn't be canceled
```

## cancelWhenClearing (default `true`)

This feature can be useful if we want to cancel requests when the web url is changed.

```js
http.post('/api/foo', 'hello') // will be canceled
http.post('/api/foo', 'hello', { cancelWhenClearing: false }) // wonn't be canceled
http.clearRequests()
```
