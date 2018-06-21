'use strict';
import { Promise } from 'bluebird';
import NotSuccessfulResponseError from './NotSuccessfulResponseError';
const RequestAsync = require('./RequestAsync');

export default class RequestFactory {

  options: Options;
  baseApi: string;
  interceptor: Interceptor;

  constructor(baseApi: string, options: Options, interceptor: Interceptor) {
    this.options = options || {}
    this.baseApi = baseApi
    this.interceptor = interceptor
  }

  get(path: string) {
    let options : Options = this.getOptions(path, `get`)
    return doRequest.call(this, options)
  }

  post(path: string, body) {
    let options : Options  = this.getOptions(path, `post`, body)
    return doRequest.call(this, options)
  }

  put(path: string, body) {
    let options : Options  = this.getOptions(path, `put`, body)
    return doRequest.call(this, options)
  }

  patch(path: string, body) {
    let options : Options  = this.getOptions(path, `patch`, body)
    return doRequest.call(this, options)
  }

  delete(path: string) {
    let options : Options  = this.getOptions(path, `delete`)
    return doRequest.call(this, options)
  }

  getOptions(path: string, method: string, body?) : Options {
    body = body || {}
    let result : Options = Object.assign({
        timeout: 10000,
        forever: true,
      },
      this.options,
      {
        url: `${this.baseApi}${path}`,
        method: method,
      }
    )

    if (body.formData) {
      result = Object.assign(result, { formData: body.formData })
    } else if (Object.keys(body).length !== 0) {
      result = Object.assign(result, { body: body, json: true })
    } else {
      result.json = true
    }
    return result
  }

  
  get headers() { //Backward compatible
    return this.getHeaders()
  }

  getHeaders() {
    return this.options.headers
  }

  setHeaders(headers) {
    Object.assign(this.options.headers, headers)
  }
}

let doRequest = function(options : Options) {
  const startTime : [number, number] = process.hrtime()
  doInterceptor.call(this, `before`, options)
  return RequestAsync.request(options)
    .then(r => {
      r = <any> r;
      const diff : [number, number]  = process.hrtime(startTime)
      const responseTime = (diff[0] * 1e9) + diff[1]
      r.responseTime = responseTime
      return r   
    })
    .then(checkStatusCode)
    .then(doInterceptor.bind(this, `success`, options))
    .then(obj => obj.body)
    .catch((e) => {
      doInterceptor.call(this, `error`, options, e)
      e.request = options
      throw e
    })
}

let doInterceptor = function(type: string, options : Options, result) {
  if(this.interceptor && this.interceptor[type]) {
    this.interceptor[type](options, result)
  }
  return result
}

let checkStatusCode = function(res) {
  return Promise.try(() => {
    if (res.statusCode >= 400) {
      throw new NotSuccessfulResponseError(res)
    }
    return res
  })
}

type Interceptor = object;

/*
type Options = {
  timeout?: number,
  forever?: boolean,
  url?: string,
  method?: string,
  formData?: any,
  headers?: any,
  body?: any,
  json?: boolean
};
*/

type Options = any;
