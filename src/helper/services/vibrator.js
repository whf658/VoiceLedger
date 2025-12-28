var vibrator = require('@system.vibrator')

function vibrate(duration) {
  var dur = typeof duration === 'number' ? duration : 30
  try {
    vibrator.vibrate({
      mode: 'long',
      duration: dur
    })
  } catch (error) {
    console.warn('vibrate skipped', error)
  }
}

export default {
  vibrate: vibrate
}
