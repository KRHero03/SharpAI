
import React, { Component } from 'react'
import firebase from 'firebase'
import { Card, CardHeader, CardContent, Grid, Box, CardActions, Button, Typography, TextField, Avatar, Snackbar, IconButton, CircularProgress } from '@material-ui/core'
import { ExitToApp, PlayArrow, Close } from '@material-ui/icons'
import { Skeleton } from '@material-ui/lab'
import Logo from '../../logo.png'
import GoogleLogo from '../../assets/images/google_logo.png'
class MainWidget extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isAuthenticated: false,
      user: null,
      proctorMode: 0,
      examCode: "",
      startTime: 0,
      endTime: 0,
      isLoading: true,
      isProctorClicked: false,
      snackbarText: '',
      openSnackbar: false,
      flags: [],
      timeInterval: null,
      flagInterval: null,
    }
  }



  async componentDidMount() {
    var isAuthenticated = await localStorage.getItem('isAuthenticated')
    var user = JSON.parse(await localStorage.getItem('user'))
    var proctorMode = await parseInt(localStorage.getItem('proctorMode'))
    var examCode = await localStorage.getItem('examCode')
    var startTime = 0
    var endTime = 0
    var flags = await localStorage.getItem('flags')

    isAuthenticated = isAuthenticated ? isAuthenticated : false
    proctorMode = proctorMode ? proctorMode : 0
    examCode = examCode ? examCode : ""
    startTime = startTime ? startTime : 0
    endTime = endTime ? endTime : 0
    if (proctorMode === 2) {
      const dbRef = firebase.firestore()
      const examRef = dbRef.collection('exams').doc(examCode)
      const examResult = await examRef.get()
      if (!examResult.exists) {
        await localStorage.setItem('proctorMode', 1)
        await localStorage.removeItem('examCode')
        await localStorage.removeItem('flags')
        proctorMode = 1
        startTime = 0
        endTime = 0
        flags = []
        this.setState({
          user: user,
          proctorMode: proctorMode,
          isAuthenticated: isAuthenticated,
          examCode: examCode,
          isLoading: false,
          startTime: startTime,
          endTime: endTime,
          timeLeftString: "",
          flags: flags == null ? [] : JSON.parse(flags)
        })
        return

      }
      const examData = examResult.data()
      if (examData.Attendence[user.email] === undefined) {
        await localStorage.setItem('proctorMode', 1)
        await localStorage.removeItem('examCode')
        await localStorage.removeItem('flags')
        proctorMode = 1
        startTime = 0
        endTime = 0
        flags = []
        this.setState({
          user: user,
          proctorMode: proctorMode,
          isAuthenticated: isAuthenticated,
          examCode: examCode,
          isLoading: false,
          startTime: startTime,
          endTime: endTime,
          timeLeftString: "",
          flags: flags == null ? [] : JSON.parse(flags)
        })
        return
      }
      startTime = examData.StartTime
      endTime = examData.EndTime
    }

    this.setState({
      user: user,
      proctorMode: proctorMode,
      isAuthenticated: isAuthenticated,
      examCode: examCode,
      isLoading: false,
      startTime: startTime,
      endTime: endTime,
      timeLeftString: "",
      flags: flags == null ? [] : JSON.parse(flags)
    })

    if (this.state.proctorMode === 2) {
      this.getTimeLeft()
      this.getFlags()
    }
  }

  handleSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({
      openSnackbar: !this.state.openSnackbar
    })
  }

  showMessage = (msg) => {
    this.setState({
      snackbarText: msg,
      openSnackbar: true
    })
  }

  signInMethod = async () => {

    try {
      const provider = new firebase.auth.GoogleAuthProvider()
      provider.addScope("profile")
      await firebase.auth().signInWithPopup(provider)
      const user = await firebase.auth().currentUser
      const userObj = { displayName: user.displayName, email: user.email.replace('.', '(dot)'), photoURL: user.photoURL.replace('s96-c', 's500-c') }
      await localStorage.setItem('user', JSON.stringify(userObj))
      await localStorage.setItem('proctorMode', 1)
      await localStorage.setItem('isAuthenticated', true)

      this.setState({
        isAuthenticated: true,
        user: userObj,
        proctorMode: 1,
      })
    } catch (e) {
      await localStorage.removeItem('user')
      await localStorage.removeItem('proctorMode')
      await localStorage.removeItem('isAuthenticated')
      console.log(e)

    }
  }

  signOutMethod = async () => {
    await firebase.auth().signOut()
    await localStorage.removeItem('user')
    await localStorage.removeItem('proctorMode')
    await localStorage.removeItem('isAuthenticated')
    await localStorage.removeItem('examCode')
    await localStorage.removeItem('flags')

    this.setState({
      isAuthenticated: false,
      user: null,
      proctorMode: 0,
      examCode: "",
    })

  }

  startProctoring = async () => {
    this.setState({
      onProctorClicked: true,
    })

    if (!this.state.examCode || this.state.examCode.length === 0) {
      this.showMessage('Please enter a valid Exam Code!')
      this.setState({
        onProctorClicked: false,
      })
      return
    }
    const dbRef = firebase.firestore()

    const examRef = dbRef.collection('exams').doc(this.state.examCode)

    const examResult = await examRef.get()

    if (!examResult.exists) {
      this.showMessage('Invalid Exam Code!')
      this.setState({
        onProctorClicked: false,
      })
      return
    }

    var examData = examResult.data()

    if (examData.Attendence[this.state.user.email] === undefined) {
      this.showMessage('You are not authorized for this Exam!')
      this.setState({
        onProctorClicked: false,
      })
      return
    }

    if (examData.Attendence[this.state.user.email]) {
      let flags = []
      flags = JSON.parse(await localStorage.getItem('flags'))
      if (flags === null)
        flags = []
      flags.unshift({ 'Remarks': 'Rejoined Examination', 'Type': 1, 'Timestamp': new Date().getTime(), 'Image': '' })
      await localStorage.setItem('flags', JSON.stringify(flags))
    }

    var timeStamp = new Date().getTime()

    var startTime = parseFloat(examData.StartTime)
    var endTime = parseFloat(examData.EndTime)

    if (timeStamp < startTime - 1000 * 60 * 10) {
      this.showMessage('The Exam has not started yet! You can join 10 mins prior to the start of the Exam')
      this.setState({
        onProctorClicked: false,
      })
      return
    }

    if (timeStamp > endTime) {
      this.showMessage('Exam has already Ended!')
      this.setState({
        onProctorClicked: false,
      })
      return

    }
    var update = {};
    update[`Attendence.${this.state.user.email}`] = true;
    await examRef.update(update, { merge: true })

    await localStorage.setItem('examCode', this.state.examCode)
    await localStorage.setItem('proctorMode', 2)

    this.setState({
      onProctorClicked: false,
      proctorMode: 2,
      startTime: startTime,
      endTime: endTime
    })

    this.getTimeLeft()
    this.getFlags()

  }

  getFlags = () => {
    var interval = setInterval(async () => {
      const flags = await localStorage.getItem('flags')
      this.setState({
        flags: flags == null ? [] : JSON.parse(flags)
      })
    }, 10000)
    this.setState({
      flagInterval: interval
    })
  }

  getTimeLeft = () => {
    if (this.state.proctorMode !== 2) return
    var interval = setInterval(() => {
      var curTime = new Date().getTime()
      if (curTime < this.state.startTime) {
        var diff = this.state.startTime - curTime
        diff = Math.floor(diff / 1000)
        var days = Math.floor(diff / 86400)
        diff -= days * 86400
        var hours = Math.floor(diff / 3600) % 24
        diff -= hours * 3600
        hours = hours < 10 ? '0' + hours : hours
        var minutes = Math.floor(diff / 60) % 60
        diff -= minutes * 60
        minutes = minutes < 10 ? '0' + minutes : minutes
        var seconds = diff % 60
        seconds = seconds < 10 ? '0' + seconds : seconds
        this.setState({
          timeLeftString: 'To Start: ' + hours + ':' + minutes + ':' + seconds
        })
      } else if (curTime < this.state.endTime) {
        diff = this.state.endTime - curTime
        diff = Math.floor(diff / 1000)
        days = Math.floor(diff / 86400)
        diff -= days * 86400
        hours = Math.floor(diff / 3600) % 24
        diff -= hours * 3600
        hours = hours < 10 ? '0' + hours : hours
        minutes = Math.floor(diff / 60) % 60
        diff -= minutes * 60
        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = diff % 60
        seconds = seconds < 10 ? '0' + seconds : seconds
        this.setState({
          timeLeftString: 'Time Left: ' + hours + ':' + minutes + ':' + seconds
        })

      } else {
        this.removeInterval()
        this.setState({
          proctorMode: 1,
          startTime: 0,
          endTime: 0,
          examCode: '',
          timeLeft: '',
          flags: [],
        })
        localStorage.removeItem('examCode')
        localStorage.removeItem('startTime')
        localStorage.removeItem('endTime')
        localStorage.removeItem('flags')
        localStorage.setItem('proctorMode', 1)
        this.showMessage('Your Exam has been completed!')
      }
    }, 1000)
    this.setState({
      timeInterval: interval
    })
  }

  getTimeFromStart = (time) => {

    var diff = time - this.state.startTime
    diff = Math.floor(diff / 1000)
    var days = Math.floor(diff / 86400)
    diff -= days * 86400
    var hours = Math.floor(diff / 3600) % 24
    diff -= hours * 3600
    hours = hours < 10 ? '0' + hours : hours
    var minutes = Math.floor(diff / 60) % 60
    diff -= minutes * 60
    minutes = minutes < 10 ? '0' + minutes : minutes
    var seconds = diff % 60
    seconds = seconds < 10 ? '0' + seconds : seconds
    return hours + ':' + minutes + ':' + seconds
  }

  removeInterval = (f) => {
    clearInterval(this.state.timeInterval)
    clearInterval(this.state.flagInterval)
    this.setState({
      timeInterval: null,
      flagInterval: null,
    })

  }

  handleTextFieldChange = (e) => {
    if (e.target.value.length > 6) return;
    this.setState({
      ...this.state,
      examCode: e.target.value.toUpperCase(),
    })
  }

  handleLearnButton = () => {
    window.open('https://sharp-ai.herokuapp.com/', '_blank')
  }

  render() {
    if (this.state.isLoading) return <Skeleton type='rect' className='rectangleSkeleton'></Skeleton>
    return (
      <Card className='mainCard'>
        <CardHeader
          avatar={
            <img src={Logo} className='mainLogo' alt='logo' />
          }
          title="Sharp AI Anti Cheat"
          subheader="Exam Proctoring Tool V 1.0.0"
        />
        <CardContent>
          {
            this.state.proctorMode === 0
              ?
              <Grid>
                <Grid item xs={12} className='gridItem'>
                  <Box display='flex' justifyContent='center'>
                    <Button onClick={this.signInMethod} className='mainButton' variant="contained" color="primary">
                      <img src={GoogleLogo} alt="GoogleLogo" className='homeGoogleLogo' />
                      SIGN IN WITH GOOGLE
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} className='gridItem'>
                  <Typography color='textSecondary' variant='caption'>
                    To enable Sharp AI Extension features, please Login using your Authorized Google Account by the Instructor.
                  </Typography>
                </Grid>
                <Grid item xs={12} className='gridItem'>
                  <Typography color='textSecondary' variant='caption'>
                    Please contact your Instructor regarding any Examination related Queries.
                  </Typography>
                </Grid>
                <Grid item xs={12} className='gridItem'>
                  <Typography color='textSecondary' variant='caption'>
                    For more information or queries, email us at help@sharp-ai.com
                  </Typography>
                </Grid>
              </Grid>
              :
              this.state.proctorMode === 1
                ?
                <Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Typography color='textSecondary' variant='caption'>
                      You are logged in as
                    </Typography>
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <CardHeader
                      avatar={
                        <Avatar alt={this.state.user.displayName} src={this.state.user.photoURL} />}
                      title={this.state.user.displayName}
                    />
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Box display='flex' justifyContent='center'>
                      <TextField
                        className='examCodeTextField'
                        label="Exam Code"
                        id="outlined-size-normal"
                        variant="outlined"
                        color='secondary'
                        onChange={this.handleTextFieldChange}
                        value={this.state.examCode}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Typography color='textSecondary' variant='caption'>
                      To Start Proctoring session, enter the Exam Code as provided in the Email sent to you or as provided by the Instructor.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Box display='flex' justifyContent='center'>
                      {
                        this.state.onProctorClicked
                          ?
                          <CircularProgress color='secondary' />
                          :
                          <Button onClick={this.startProctoring} className='mainButton' variant="contained" color="secondary">
                            <PlayArrow />
                            START PROCTORING
                          </Button>

                      }
                    </Box>
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Typography color='textSecondary' variant='caption'>
                      Please start Proctoring during Exam duration only.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Box display='flex' justifyContent='center'>
                      <Button onClick={this.signOutMethod} className='mainButton' variant="contained" color="primary">
                        <ExitToApp />
                        LOGOUT
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
                :
                <Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Typography color='textSecondary' variant='caption'>
                      You are logged in as
                    </Typography>
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <CardHeader
                      avatar={
                        <Avatar alt={this.state.user.displayName} src={this.state.user.photoURL} />}
                      title={this.state.user.displayName}
                    />
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Typography className='blink'>
                      🔴 Proctoring Enabled!
                    </Typography>
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Box display='flex' justifyContent='center'>
                      <Typography variant='h4'>
                        {this.state.timeLeftString}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Typography color='textSecondary' variant='caption'>
                      Your violations will appear here. Note that if you have switched or tampered the tool, all of your flags may not be visible. They, however, are already reported to the Instructor.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} className='gridItem flagScroll'>
                    {this.state.flags.map((flag) => {
                      return (
                        <Card variant='outlined' className={flag.Type === 1 ? 'flagCard type1' : flag.Type === 2 ? 'flagCard type2' : 'flagCard type3'}>
                          <CardContent>
                            <Box display='flex' justifyContent='space-between' alignItems='center'>
                              <Typography variant='body1'>
                                {flag.Remarks}
                              </Typography>
                              <Typography variant='caption' color='textSecondary'>
                                {this.getTimeFromStart(flag.Timestamp)}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Typography color='textSecondary' variant='caption'>
                      For any Queries, contact your Instructor.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} className='gridItem'>
                    <Typography color='textSecondary' variant='caption'>
                      For any Information, email us at help@sharp-ai.com
                    </Typography>
                  </Grid>
                </Grid>

          }

        </CardContent>
        <CardActions>
          <Button size="small" color="secondary" onClick={this.handleLearnButton}>
            Learn More
          </Button>
        </CardActions>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.openSnackbar}
          autoHideDuration={6000}
          onClose={this.handleSnackbar}
          message={this.state.snackbarText}
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleSnackbar}>
                <Close fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </Card>
    )
  }
}

export default MainWidget