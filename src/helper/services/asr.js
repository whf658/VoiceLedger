var asr = null

function getAsr() {
  if (asr) {
    return asr
  }
  try {
    var moduleName = '@service.' + 'asr'
    asr = require(moduleName)
  } catch (error) {
    asr = null
  }
  return asr
}

function startOnce(options) {
  var opts = options || {}
  return new Promise(function(resolve, reject) {
    try {
      var service = getAsr()
      if (!service || !service.start) {
        reject(new Error('ASR 服务不可用'))
        return
      }
      var done = false
      var prevComplete = service.oncompleteresult
      var cleanup = function() {
        if (service && service.oncompleteresult === onComplete) {
          service.oncompleteresult = prevComplete || null
        }
      }
      var onComplete = function(res) {
        if (done) return
        done = true
        cleanup()
        var text = ''
        if (res != null) {
          if (typeof res === 'string') text = res
          else if (res.result != null) text = res.result
          else if (res.text != null) text = res.text
        }
        resolve(text)
      }
      var config = {
        lang: 'zh-CN',
        punctuation: true
      }
      for (var key in opts) {
        if (Object.prototype.hasOwnProperty.call(opts, key)) {
          if (key !== 'success' && key !== 'fail' && key !== 'cancel') {
            config[key] = opts[key]
          }
        }
      }
      service.oncompleteresult = onComplete
      config.success = function() {
        // ASR start success only, result comes from oncompleteresult
      }
      config.fail = function(data, code) {
        if (done) return
        done = true
        cleanup()
        if (code != null) {
          reject(new Error('ASR start fail, code=' + code + ', data=' + data))
          return
        }
        reject(data)
      }
      config.cancel = function(data, code) {
        if (done) return
        done = true
        cleanup()
        if (code != null) {
          reject(new Error('ASR canceled, code=' + code + ', data=' + data))
          return
        }
        reject(data || new Error('ASR canceled'))
      }
      service.start(config)
    } catch (error) {
      reject(error)
    }
  })
}

function stop() {
  try {
    var service = getAsr()
    if (service && service.stop) {
      service.stop()
    }
  } catch (error) {
    console.error('stop asr error', error)
  }
}

export default {
  startOnce: startOnce,
  stop: stop
}
