/**
 * 封装了一些网络请求方法，方便通过 Promise 的形式请求接口
 */
import $fetch from '@system.fetch'
import $utils from './utils'

var TIMEOUT = 20000

if (!Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    var P = this.constructor
    return this.then(
      function(value) {
        return P.resolve(callback()).then(function() {
          return value
        })
      },
      function(reason) {
        return P.resolve(callback()).then(function() {
          throw reason
        })
      }
    )
  }
}

function fetchPromise(params) {
  return new Promise(function(resolve, reject) {
    $fetch
      .fetch({
        url: params.url,
        method: params.method,
        data: params.data
      })
      .then(function(response) {
        var result = response.data
        var content = JSON.parse(result.data)
        /* @desc: 可跟具体不同业务接口数据，返回你所需要的部分，使得使用尽可能便捷 */
        content.success ? resolve(content.value) : resolve(content.message)
      })
      .catch(function(error, code) {
        console.log('request fail, code = ' + code)
        reject(error)
      })
      .finally(function() {
        console.log('request @' + params.url + ' has been completed.')
        resolve()
      })
  })
}

function requestHandle(params, timeout) {
  var limit = typeof timeout === 'number' ? timeout : TIMEOUT
  try {
    return Promise.race([
      fetchPromise(params),
      new Promise(function(resolve, reject) {
        setTimeout(function() {
          reject(new Error('网络状况不太好，再刷新一次？'))
        }, limit)
      })
    ])
  } catch (error) {
    console.log(error)
  }
}

export default {
  post: function(url, params) {
    return requestHandle({
      method: 'post',
      url: url,
      data: params
    })
  },
  get: function(url, params) {
    return requestHandle({
      method: 'get',
      url: $utils.queryString(url, params)
    })
  },
  put: function(url, params) {
    return requestHandle({
      method: 'put',
      url: url,
      data: params
    })
  }
  // 如果，method 您需要更多类型，可自行添加更多方法；
}
