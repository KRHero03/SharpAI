import { Component } from "react"
import { Container, Button, Typography,Grid,Box } from '@material-ui/core'
import Logo from '../../logo.png'
import GoogleLogo from '../../assets/google_logo.png'
import firebase from 'firebase'
import Skeleton from '@material-ui/lab/Skeleton'
import { withRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'
import MetaTags from 'react-meta-tags'
class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isAuthenticated: false,
      user: false,
      isLoading: true,
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          isAuthenticated: true,
          user: user,
          isLoading: false
        })
      } else {
        this.setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        })
      }
    })
  }


  signInMethod = async () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope("profile")
    try {
      await firebase.auth().signInWithPopup(provider);
      const user = await firebase.auth().currentUser;
      if (!user) return;
      this.setState({
        isAuthenticated: true,
        user: user,
        isLoading: false
      })

    } catch (err) {
      console.log(err);

    }

  }


  render() {

    if (this.state.isAuthenticated) return (<Dashboard />)
    if (this.state.isLoading)
      return (
        <Grid className='home'>
        </Grid>
      )
    return (
      <Grid className='home'>
        <MetaTags>
            <title>Home | Sharp AI</title>
            <meta id="meta-description" name="description" content="Sharp AI Anti Cheat Exam Proctoring Tool" />
            <meta id="og-title" property="og:title" content="Sharp AI" />
            <meta id="og-image" property="og:image" content={Logo} />
        </MetaTags>
        <Grid item xs={12}>
          <Box display='flex' alignItems='center' justifyContent='center' style={{marginTop:10,marginBottom: 10}}>
          <img src={Logo} alt="Logo" className='homeLogo' />
          </Box>
        </Grid>
        <Grid item xs={12} className='gridItem'>
          <Box display='flex' alignItems='center' justifyContent='center' >
          <Typography variant='h3'>
            Sharp AI
          </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} className='gridItem'>
          <Box display='flex' alignItems='center' justifyContent='center' >
          <Typography variant='h5'>
            Anti Cheat
          </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} className='gridItem'>
          <Box display='flex' alignItems='center' justifyContent='center' >
          <Typography variant='caption'>
            Exam Proctoring Tool v1.0.0
          </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} className='gridItem'>
          <Box display='flex' alignItems='center' justifyContent='center'>
          <Button onClick={this.signInMethod} className='signInButton' variant="contained" color="primary">
            <img src={GoogleLogo} alt="GoogleLogo" className='homeGoogleLogo' />
            SIGN IN WITH GOOGLE
          </Button>
          </Box>
        </Grid>
      </Grid>
    )
  }

}

export default withRouter(Home);