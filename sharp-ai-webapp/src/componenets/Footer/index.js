import { Component } from "react"
import { Link, withRouter } from 'react-router-dom'
import { Grid, Dialog, DialogContent,DialogTitle,Typography } from '@material-ui/core'
import policy from '../policy'
var template = { __html: policy };

class Footer extends Component {

  constructor(props) {
    super(props)
    this.state = {
      openPolicy: false,
      openHelp: false,
    }
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

  render() {
    return (
      <Grid container className='footer'>
        <Grid container className='footerCenter'>
          <Grid item xs={3} sm={1}>
            <Link to='/ourstory'>About</Link>
          </Grid>
          <Grid item xs={3} sm={1}>
            <Link to='/'>Blog</Link>
          </Grid>
          <Grid item xs={3} sm={1}>
            <Link onClick={this.handleHelpModal}>Help</Link>
          </Grid>
          <Grid item xs={3} sm={1}>
            <Link to='/'>Jobs</Link>
          </Grid>
          <Grid item xs={3} sm={1}>
            <Link to='/'>API</Link>
          </Grid>
          <Grid item xs={3} sm={1}>
            <Link to='/hashtags'>Hashtags</Link>
          </Grid>
          <Grid item xs={3} sm={1}>
            <Link to='/'>Locations</Link>
          </Grid>
          <Grid item xs={3} sm={1}>
            <Link to='/accounts'>Accounts</Link>
          </Grid>
          <Grid item xs={12}>
            <Link onClick={this.handlePolicyModal}>©Copyright 2021 - Present</Link>
          </Grid>
          <Grid item xs={12}>
            <Link onClick={this.handlePolicyModal}>All Rights Reserved.</Link>
          </Grid>
          <Grid item xs={12}>
            <Link to='/'>Sharp AI Anti Cheat</Link>
          </Grid>
        </Grid>

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
          aria-describedby="alert-dialog-description" onClose={this.handlePolicyModal} open={this.state.openPolicy}>
          <DialogContent>
            <div className='paper'>
              <h2 id="transition-modal-title">Sharp AI Privacy Policy</h2>

              <span dangerouslySetInnerHTML={template} />
            </div>
          </DialogContent>
        </Dialog>
      </Grid>
    )
  }

}

export default withRouter(Footer);