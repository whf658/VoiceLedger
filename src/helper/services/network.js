var network = require('@system.network')

function checkOnline() {
  return new Promise(function(resolve) {
    try {
      network.getType({
        success: function(res) {
          resolve(res.type && res.type !== 'none')
        },
        fail: function() {
          resolve(false)
        }
      })
    } catch (error) {
      console.error('network check failed', error)
      resolve(false)
    }
  })
}

export default {
  checkOnline: checkOnline
}
