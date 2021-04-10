
firebase.initializeApp(firebaseConfig)




var interval = setInterval(async () => {
  console.log('Running')
  if (parseInt(localStorage.getItem('proctorMode')) !== 2) return

  const flagJSON = await localStorage.getItem('flags')
  if (flagJSON === null) return
  const user = JSON.parse(await localStorage.getItem('user'))
  const examCode = await localStorage.getItem('examCode')
  const dbRef = firebase.firestore()


  const examRef = dbRef.collection('exams').doc(examCode)

  const examResult = await examRef.get()
  const examData = examResult.data()

  const curTime = new Date().getTime()
  if(parseFloat(examData.EndTime)<curTime){
    await localStorage.setItem('proctorMode',1)
    await localStorage.removeItem('examCode')
    await localStorage.removeItem('flags')
    clearInterval(interval)
    return
  }
  var update = {}
  update[`Flags.${user.email}`] = flagJSON
  await examRef.update(update, { merge: true })
}, 60000)
