/**
 * 导出 apis 下目录的所有接口
 */
var files = require.context('.', true, /\.js/)
var modules = {}

files.keys().forEach(function(key) {
  if (key === './index.js') {
    return
  }
  modules[key.replace(/(^\.\/|\.js$)/g, '')] = files(key).default
})

export default modules
