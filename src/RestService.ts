'use strict'
const _ = require(`lodash`)
const RequestFactoryMock = require(`./RequestFactoryMock`)
import RequestFactory from './RequestFactory';

const clientType = {}
const defaultHeaderList = []
const RestClient = {}

function filterHeader(headers, type: CurrentType) {
  if (!headers && type.headers.list.length === 0) {
    return headers
  }
  const whiteList = type.headers.whiteList.concat(defaultHeaderList)
  let tmp = _.pick(headers, whiteList)

  let uniqueHeaders = _.reduce(type.headers.list, (result, value) => {
    Object.assign(result, value)
    return result
  }, {})

  uniqueHeaders = _.reduce(uniqueHeaders, (result, value, key) => {
      if(_.isFunction(value)) {
        Object.assign(result, {[key]: value()})
      } else {
        result[key] = value
      }
      return result
    }, {})

  Object.assign(tmp, uniqueHeaders)

  return tmp
}

function reset() : void {
  for (let key in RestClient) {
    delete RestClient[key]
  }
}

/*
 * Initialize with given options.
 */
function init(options) : void {
  let clients : Client[] = options.clients
  let defaultHeaders : string[] = options.defaultHeaders || []
  
  validateClients(clients);
  validateDefaultHeaders(defaultHeaders);
  
  Object.assign(defaultHeaderList, defaultHeaders);

  clients.forEach(register);
}

/*
 * Registers a client
 */
function register(client: Client) : void {
  let headers : any[] = client.headers || []
  let url : string = client.url
  let type : string  = client.type
  let interceptor : Interceptor = client.interceptor
  let timeout : number = client.timeout
  
  validateHeaders(headers);
  validateUrl(url);
  validateType(type);
  validateInterceptor(interceptor); 

  let currentType : CurrentType = createCurrentType(url, headers);

  RestClient[type] = function(req) {
    req = req || {}
    let headers = req.headers
    headers = filterHeader(headers, Object.assign({}, currentType))
    let options = _.omitBy(_.assign({
      headers: headers, 
      timeout: timeout,
    }, client.options), _.isNil)
    return new RequestFactory(currentType.url, options, interceptor)
  }
}

function validateClients(clients: Client[]) : void{
  if (!clients) {
    throw new Error(`Cannot init RestClient, \'clients\' property is required.`)
  }
}

function validateDefaultHeaders(defaultHeaders: string[]) : void {
  if (!_.isArray(defaultHeaders) || !defaultHeaders.every(element => _.isString(element))) {
    throw new Error(`\'defaultHeaders\' should be array, and each element should be a string!`)
  }
}

function validateHeaders(headers: any[]) : void {
  if (!_.isArray(headers)) {
    throw new Error(`\'headers\' should be an array!`)
  }
}

function validateType(type: string) : void {
  if (!_.isString(type)) {
    throw new Error(`\'type\' should be a string!`)
  }
}

function validateUrl(url: string) : void {
  if (!_.isString(url)) {
    throw new Error(`\'url\' should be a string!`)
  }
}

function validateInterceptor(interceptor: Interceptor) : void {
  if(interceptor) {
    if (!interceptor || !_.isPlainObject(interceptor)) {
      throw new Error(`interceptor is not an object or, interceptor.success or interceptor.error are undefined.`)
    }
    if(!_.every(interceptor, element => _.isFunction(element))) {
      throw new Error(`interceptor property is not a function.`)
    }
  }
}

function createCurrentType(url: string, headers: any[]) : CurrentType {
  return {
    url,
    headers: {
      whiteList: _.filter(headers, obj => _.isString(obj)),
      list: _.filter(headers, obj => _.isPlainObject(obj))
    }
  }
}

/*
 * Gets a mock instance
 */
function mock() {
  if (typeof jasmine === `undefined`) {
    throw new Error(`Please use mock function in jasmine test environment.`)
  }
  return new RequestFactoryMock()
}

module.exports = { init: init, reset: reset, register: register, mock: mock, RestClient: RestClient }


type Interceptor = object;

type Client = {
  headers: any[],
  url: string,
  type: string,
  interceptor?: Interceptor,
  timeout: number,
  options: RequestOptions
}

type RequestOptions = {
  forever: boolean,
  pool: object,
  timeout: number
}

type CurrentType = {
  url: string,
  headers: {
    whiteList: any[],
    list: any[]
  }
}