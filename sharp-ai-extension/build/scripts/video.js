var video = document.createElement('video')
var canvas = document.createElement('canvas')
video.width = 320
video.height = 240
canvas.width = 320
canvas.height = 240
const seekWebCamStream = function () {
  chrome.runtime.sendMessage({ action: 'get_proctor_mode' }, async (response) => {
    if (response.proctorMode !== 2) return
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      console.log(stream)
      video.srcObject = stream
      video.play()
      var interval = setInterval(() => {

        chrome.runtime.sendMessage({ action: 'get_proctor_mode' }, async (response) => {
          if (response.proctorMode !== 2) {
            clearInterval(interval)
            return
          }
          canvas.getContext('2d').drawImage(video, 0, 0, video.width, video.height)
          var data = canvas.toDataURL()

          var result = 0//request

          if (result) {
            chrome.runtime.sendMessage({ action: 'add_flag', flag: { Remarks: 'Suspicious Video Activity', Type: 2, Timestamp: new Date().getTime(), Image: '' } })
          }
        })

      }, 5000)
    }, () => {
      chrome.runtime.sendMessage({ action: 'add_flag', flag: { Remarks: 'Denied WebCam Permission', Type: 3, Timestamp: new Date().getTime(), Image: '' } })
    });

  })

}

seekWebCamStream()