import { Avatar, Dialog, DialogContent, DialogTitle, Divider, List, ListItem, ListItemIcon, ListItemText, Typography,Box,IconButton } from "@material-ui/core"
import { AccountCircle, ExitToApp, GroupWork, Help, Home,Brightness4 } from "@material-ui/icons"
import { Component } from "react"
import { withRouter } from 'react-router-dom'
import firebase from 'firebase/app'
import policy from '../policy'
var template = { __html: policy };

class SignInLinks extends Component {

  
  constructor(props) {
    super(props)
    this.state = {
      openPolicy: false,
      openHelp: false,
      isAuthenticated: false,
      user: null,
      isLoading: true,
      isModalOpen: false,
    }

  }

  componentDidMount()   {
    firebase.auth().onAuthStateChanged((user)=>{
      if (user) {
        user.photoURL.replace('s96-c','s500-c')
        this.setState({
          isAuthenticated: true,
          user: user,
          isLoading: false,
        })
      } else {
        this.props.history.push('/')
      }
    })
    
  }


  preventDefault = (event) => event.preventDefault();
  handlePolicyModal = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    this.setState({
      ...this.state,
      openPolicy: !this.state.openPolicy,
    })
  }
  handleHelpModal = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    this.setState({
      ...this.state,
      openHelp: !this.state.openHelp,
    })
  }

  signOutMethod = async () => {
    await firebase.auth().signOut()
    this.props.history.push('/')
  }


  toggleModalOpen = () => {
    this.setState({
      ...this.state,
      isModalOpen: !this.state.isModalOpen
    })
  }
  render() {
    if(this.state.isLoading) return (null);
    return (
      <div className='list'>
        <List>
          <ListItem style={{display:'block'}}>
            <Box display='flex' alignItems='center' justifyContent='space-between'>

            <Avatar alt={this.state.user.displayName} src={this.state.user.photoURL.replace('s96-c','s500-c')} className='drawerPhoto' onClick={this.toggleModalOpen} />      
            <IconButton onClick={()=>{this.props.toggleDarkMode()}}>
              <Brightness4/>
            </IconButton>
            </Box>      
            <Typography variant="h6" >Hey There,<br/> {this.state.user.displayName}</Typography>
          </ListItem>
          <Divider />
          <ListItem button key="Home" component="a" href="/">
            <ListItemIcon> <Home /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <Divider />
          <ListItem button key="Our Story" component="a" href="/ourstory/">
            <ListItemIcon> <GroupWork /></ListItemIcon>
            <ListItemText primary="Our Story" />
          </ListItem>
          <ListItem button key="Help" onClick={this.handleHelpModal}>
            <ListItemIcon> <Help /></ListItemIcon>
            <ListItemText primary="Help" />
          </ListItem>
          <ListItem button key="Sign Out" onClick={this.signOutMethod}>
            <ListItemIcon> <ExitToApp /></ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
          <Divider />
          <ListItem key="Copyright">
            <ListItemText secondary="© Copyright 2021 - Present" />
          </ListItem>
          <div>
            <ListItem onClick={this.handlePolicyModal} component="a" href="#" key="Privacy Policy">
              <ListItemText secondary="Privacy Policy | Sharp AI" />
            </ListItem>
            <Dialog className='dialog'
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description" onClick={this.handleHelpModal}  open={this.state.openHelp}>

              <DialogTitle id="alert-dialog-title">Sharp AI | Help & FAQ</DialogTitle>
              <DialogContent>
                <Typography variant="h6">What is Sharp AI all about?</Typography>
                <Typography >
                  Sharp AI Anti Cheat is a Proctoring Tool that helps you take hassle free Online Examinations.
                </Typography>
                <Typography variant="h6">What Information do you store about me?</Typography>
                <Typography >
                  Apart from your Email ID, Display Image, Name and the details that you upload, nothing else.
                </Typography>
                <Typography variant="h6">What more can I do after logging in?</Typography>
                <Typography >
                  First things first. You need to create a Class of students. You can create more than one class and add or remove students in those Classes. You can then assign Proctoring sessions to the Classes during when the Exam is taken. After the exam is completed, you get a detailed analysis of any violations done by any of the Students.
                </Typography>
                <Typography variant="h6">Are there any Microtransactions on Sharp AI?</Typography>
                <Typography >
                  Sharp AI is free, and will always be. It doesn't have any kinds of Microtransactions.
                </Typography>
                <Typography variant="h6">My question is not listed above. What do I do?</Typography>
                <Typography >
                  Don't worry. Write us at help(at)sharp-ai(dot)com. We'll definitely ping you within a day regarding your query.
                </Typography>
              </DialogContent>
            </Dialog>

            <Dialog className='dialog'
              aria-labelledby='Profile Photo Dialog'
              aria-describedby='Profile Photo' onClose={this.toggleModalOpen} open={this.state.isModalOpen}>
                <img src={this.state.user.photoURL.replace('s96-c','s500-c')} alt='Profile'/>
            </Dialog>
            <Dialog className='dialog'
              aria-describedby="alert-dialog-description" onClose={this.handlePolicyModal} open={this.state.openPolicy}>

              <DialogContent>
                <div className='paper'>
                  <h2 id="transition-modal-title">Sharp AI Privacy Policy</h2>

                  <span dangerouslySetInnerHTML={template} />
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </List>

      </div>
    )
  }

}

export default withRouter(SignInLinks);