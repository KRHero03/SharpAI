import React, { Component } from "react"
import { withRouter } from 'react-router-dom'
import { Send, Close } from '@material-ui/icons'
import firebase from 'firebase'
import { IconButton, Container, Grid, Paper, TextField, Box, Fab, Tooltip, Zoom, Divider, Typography, Snackbar, CircularProgress } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import MetaTags from 'react-meta-tags'


class CreateClass extends Component {

  constructor(props) {
    super(props)
    this.state = {
      user: null,
      isAuthenticated: false,
      isUserDataLoading: true,
      isButtonClicked: false,
      className: "",
    }
  }
  async componentDidMount() {

    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.setState({
          user: user,
          isUserDataLoading: false,
          isAuthenticated: true,
          className: "",
          snackbarText: '',
          openSnackbar: false,
        })
      } else {
        this.props.history.push('/')
      }
      return
    })


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

  handleTextFieldChange = (e) => {
    this.setState({
      ...this.state,
      className: e.target.value
    })
  }

  CreateClass = async () => {
    this.setState({
      isButtonClicked: true
    })
    if (this.state.className.length === 0) {
      this.showMessage('Please enter a valid Class Name!')
      return
    }


    const db = firebase.firestore();
    const data = await db.collection("teachers").doc(this.state.user.uid).collection("classes").doc(this.state.className).get()
    if (data.exists) {
      this.showMessage('The given Class Name already exists!')
      this.setState({
        isButtonClicked: false
      })
    }
    else {
      const ref = await db.collection("teachers").doc(this.state.user.uid).collection("classes").doc(this.state.className).set({});
      await this.setState({
        isButtonClicked: true
      })
      this.props.history.push(`/myclass/${this.state.className}`)
    }




  }

  render() {
    return (

      <Container className="home" style={{ width: "60%" }}>
        <Paper elevation={0} >

          <Grid className='createPost'>
            <Grid item xs={12}>
              <TextField
                className='createPostTextField'
                label="Write Your Class Name"
                id="outlined-size-normal"
                variant="outlined"
                color='secondary'
                onChange={this.handleTextFieldChange}
                value={this.state.className}
              />

            </Grid>
            <Grid item xs={12}>

              <Box display='flex' flexDirection="row-reverse">
                {
                  this.state.isButtonClicked
                    ?
                    <CircularProgress style={{marginTop: 10,marginBottom: 10}} color='secondary' />
                    :
                    <Tooltip TransitionComponent={Zoom} title="Create New Class" aria-label="Create New Class" arrow>
                      <Fab color="secondary" className='createPostFAB' size='small' onClick={this.CreateClass} >
                        <Send />
                      </Fab>
                    </Tooltip>
                }

              </Box>
            </Grid>

          </Grid>

          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
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
        </Paper>
      </Container>

    )
  }

}

export default withRouter(CreateClass);