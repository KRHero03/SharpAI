import React ,{ Component } from "react"
import { withRouter } from 'react-router-dom'
import { Send, Publish, MoreVert, Favorite, Cancel,Close } from '@material-ui/icons'
import CameraIcon from '@material-ui/icons/Camera'
import firebase from 'firebase'
import { IconButton,  CardHeader, Card, CardActions, CardContent, Container, Grid, Paper, TextField, Box, Fab, Tooltip, Zoom, Divider, Avatar, Typography, CircularProgress, Dialog, DialogContent, DialogTitle,Snackbar, ThemeProvider } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import CreatePost from '../../components/CreatePost'
import MetaTags from 'react-meta-tags'


class CreateClass extends Component {

  constructor(props) {
    super(props)
    this.state = {
      user: null,
      isAuthenticated: false,
      isUserDataLoading: true,

    }
  }
  async componentDidMount() {

    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.setState({
          user: user,
          isUserDataLoading: false,
          isAuthenticated: true,
          className:"",
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
    // Validations..
    if(this.state.className === "")
    {
      this.showMessage('Empty Field')
    }
    else
    {


      const db = firebase.firestore();
      const data =  await db.collection("teachers").doc(this.state.user.uid).collection("classes").doc(this.state.className).get()
      if( data.exists)
      {
        this.showMessage('Class Already Exists')
      }
      else
      {
        const ref =await db.collection("teachers").doc(this.state.user.uid).collection("classes").doc(this.state.className).set({});
        this.props.history.push(`/myclass/${this.state.className}`)
      }
      
      
    }

  }

  render() {
    return (
     
      <Container className = "home" style= {{width: "60%"}}> 
      <Paper elevation={0} >
       
        <Grid className='createPost'>
          <Grid item xs={12}>
            <TextField
              className='createPostTextField'
              label="Write Your Class Name"
              id="outlined-size-normal"
              variant="outlined"
              color='secondary'
              multiline
              onChange={this.handleTextFieldChange}
              value={this.state.className}

              rowsMax='3'
            />
           
          </Grid>
          <Grid item xs={12}>

          <Box display='flex' flexDirection="row-reverse">
              <Tooltip TransitionComponent={Zoom} title="Create Post" aria-label="Create Post" arrow>
                <Fab color="secondary" className='createPostFAB' size='small' onClick={this.CreateClass} >
                  <Send />
                </Fab>
              </Tooltip>
             
            </Box>
          </Grid>
          <Divider />
          
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