var storage = require('@system.storage')

var BILL_KEY = 'voiceledger_bills'
var SETTINGS_KEY = 'voiceledger_settings'
var defaultSettings = {
  vibrate: true,
  autoSave: false
}

// ... read 和 write 函数保持不变 ...
function read(key, fallback) {
  return new Promise(function(resolve) {
    storage.get({
      key: key,
      success: function(res) {
        var raw = null
        if (typeof res === 'string') {
          raw = res
        } else if (res && typeof res.value !== 'undefined') {
          raw = res.value
        } else if (res && typeof res.data !== 'undefined') {
          raw = res.data
        }
        console.log('[storage.get] key=', key, 'raw=', raw)
        try {
          resolve(raw ? JSON.parse(raw) : fallback)
        } catch (error) {
          console.warn('storage parse error', error)
          resolve(fallback)
        }
      },
      fail: function(err) {
        console.log('[storage.get fail]', err)
        resolve(fallback)
      }
    })
  })
}

function write(key, value) {
  var raw = JSON.stringify(value)
  return new Promise(function(resolve, reject) {
    storage.set({
      key: key,
      value: raw,
      success: function() {
        resolve(value)
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}

// --- 新增：专门用于删除数据的 remove 函数 ---
function remove(key) {
  return new Promise(function(resolve, reject) {
    storage.delete({
      key: key,
      success: function() {
        console.log('[storage.delete success] key=', key)
        resolve()
      },
      fail: function(data, code) {
        // 即使删除失败（比如key本身就不存在），也视为成功，不阻断流程
        console.log('[storage.delete fail] key=', key, code)
        resolve()
      }
    })
  })
}

function getBills() {
  return read(BILL_KEY, [])
}

function setBills(list) {
  return write(BILL_KEY, list || [])
}

function addBill(bill) {
  return getBills().then(function(list) {
    var next = list.slice()
    next.unshift(bill)
    return setBills(next)
  })
}

function deleteBill(id) {
  return getBills().then(function(list) {
    var next = list.filter(function(item) {
      return item.id !== id
    })
    return setBills(next)
  })
}

// --- 修改：使用 remove 彻底删除 Key ---
function clearBills() {
  // 原来的写法: return setBills([]) 
  // 现在的写法: 直接删除 Key，更稳健
  return remove(BILL_KEY)
}

function getSettings() {
  return read(SETTINGS_KEY, defaultSettings).then(function(saved) {
    var result = {}
    for (var k in defaultSettings) {
      result[k] = defaultSettings[k]
    }
    for (var k2 in saved) {
      result[k2] = saved[k2]
    }
    return result
  })
}

function saveSettings(patch) {
  var patchObj = patch || {}
  return getSettings().then(function(current) {
    var next = {}
    for (var k in current) {
      next[k] = current[k]
    }
    for (var p in patchObj) {
      next[p] = patchObj[p]
    }
    return write(SETTINGS_KEY, next)
  })
}

export default {
  BILL_KEY: BILL_KEY,
  SETTINGS_KEY: SETTINGS_KEY,
  getBills: getBills,
  setBills: setBills,
  addBill: addBill,
  deleteBill: deleteBill,
  clearBills: clearBills,
  getSettings: getSettings,
  saveSettings: saveSettings
}