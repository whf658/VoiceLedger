var prompt = require('@system.prompt')

function queryString(url, query) {
  var pairs = []
  var q = query || {}
  for (var key in q) {
    if (Object.prototype.hasOwnProperty.call(q, key)) {
      pairs.push(key + '=' + q[key])
    }
  }
  var paramStr = pairs.join('&')
  return paramStr ? url + '?' + paramStr : url
}

function showToast(message, duration) {
  var msg = message || ''
  var dur = duration || 0
  if (!msg) return
  prompt.showToast({
    message: msg,
    duration: dur
  })
}

function formatDate(date) {
  var d = typeof date === 'string' ? new Date(date) : date
  var year = d.getFullYear()
  var m = d.getMonth() + 1
  var month = m < 10 ? '0' + m : '' + m
  var dayNum = d.getDate()
  var day = dayNum < 10 ? '0' + dayNum : '' + dayNum
  return year + '-' + month + '-' + day
}

function dateWithOffset(offset) {
  var off = typeof offset === 'number' ? offset : 0
  var now = new Date()
  now.setDate(now.getDate() + off)
  return formatDate(now)
}

function formatCurrency(amount) {
  var num = Number(amount) || 0
  return num.toFixed(2)
}

export default {
  showToast: showToast,
  queryString: queryString,
  formatDate: formatDate,
  dateWithOffset: dateWithOffset,
  formatCurrency: formatCurrency
}
