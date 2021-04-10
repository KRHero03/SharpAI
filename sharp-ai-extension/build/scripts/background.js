/* eslint-disable no-undef */
function addFlag(flag) {
  if(parseInt(localStorage.getItem('proctorMode'))!==2) return
  if (!localStorage.getItem("flags")) {
    localStorage.setItem(
      "flags",
      JSON.stringify([
        flag
      ])
    );
  } else {
    let flags = JSON.parse(localStorage.getItem("flags"));
    flags.unshift(flag);
    localStorage.setItem("flags", JSON.stringify(flags));
  }
}


chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.onActivated.addListener((e) => {
    chrome.tabs.get(e.tabId, (tab) => {
      if (parseInt(localStorage.getItem('proctorMode')) !== 2) return
      let flag = { Remarks: 'Visited ' + (tab.url === '' ? 'a New Tab' : tab.url), Type: 2, Timestamp: new Date().getTime(), Image: '' }
      addFlag(flag)

    });
  });

  // eslint-disable-next-line no-unused-vars
  chrome.tabs.onCreated.addListener((tab) => {
    if (parseInt(localStorage.getItem('proctorMode')) !== 2) return
    let flag = { Remarks: 'Created a New Tab', Type: 2, Timestamp: new Date().getTime(), Image: '' }
    addFlag(flag)
  });

  // eslint-disable-next-line no-unused-vars
  chrome.tabs.onRemoved.addListener((tabId, _) => {
    if (parseInt(localStorage.getItem('proctorMode')) !== 2) return
    let flag = { Remarks: 'Removed a Tab', Type: 2, Timestamp: new Date().getTime(), Image: '' }
    addFlag(flag)
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (parseInt(localStorage.getItem('proctorMode')) !== 2) return
    if (changeInfo.url) {
      let flag = { Remarks: 'Visited ' + (changeInfo.url === '' ? 'a New Tab' : changeInfo.url), Type: 2, Timestamp: new Date().getTime(), Image: '' }
      addFlag(flag)
    } else if (changeInfo.audible) {
      let flag = { Remarks: 'Audio Activity Detected from ' + (changeInfo.url === '' ? 'a New Tab' : changeInfo.url), Type: 3, Timestamp: new Date().getTime(), Image: '' }
      addFlag(flag)
    }

  });

  // eslint-disable-next-line no-unused-vars
  chrome.downloads.onCreated.addListener((download) => {
    if (parseInt(localStorage.getItem('proctorMode')) !== 2) return
    let flag = { Remarks: 'Downloaded a File from ' + download.referrer, Type: 3, Timestamp: new Date().getTime(), Image: '' }
    addFlag(flag)
  });

  // eslint-disable-next-line no-unused-vars
  chrome.windows.onBoundsChanged.addListener((window) => {
    if (parseInt(localStorage.getItem('proctorMode')) !== 2) return
    let flag = { Remarks: 'Resized Window', Type: 1, Timestamp: new Date().getTime(), Image: '' }
    addFlag(flag)
  });

  // eslint-disable-next-line no-unused-vars
  chrome.windows.onCreated.addListener((window) => {

    if (parseInt(localStorage.getItem('proctorMode')) !== 2) return
    let flag = { Remarks: 'Created new Window', Type: 3, Timestamp: new Date().getTime(), Image: '' }
    addFlag(flag)
  });

  // eslint-disable-next-line no-unused-vars
  chrome.windows.onFocusChanged.addListener((window) => {
    if (parseInt(localStorage.getItem('proctorMode')) !== 2) return
    let flag = { Remarks: 'Switched to new Window', Type: 2, Timestamp: new Date().getTime(), Image: '' }
    addFlag(flag)
  });

  // eslint-disable-next-line no-unused-vars
  chrome.windows.onRemoved.addListener((window) => {
    if (parseInt(localStorage.getItem('proctorMode')) !== 2) return
    let flag = { Remarks: 'Removed a Window', Type: 2, Timestamp: new Date().getTime(), Image: '' }
    addFlag(flag)
  });
});


chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    switch (request.action) {
      case 'get_proctor_mode': sendResponse({ proctorMode: parseInt(await localStorage.getItem('proctorMode')) }); break;
      case 'add_flag': addFlag(request.flag); break;
      default: return
  }
    return true
  }
);

