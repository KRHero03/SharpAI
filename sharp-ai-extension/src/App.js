import React, { useState } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import './App.scss';
import { StylesProvider } from '@material-ui/core/styles';
import {Grid} from '@material-ui/core'
import MainWidget from './components/MainWidget'
import Logo from './logo.png'
import firebase from 'firebase'
import firebaseConfig from './config/firebaseConfig'

firebase.initializeApp(firebaseConfig)

const askPermission =  function () { 
  navigator.permissions.query({name: 'camera'})
  .then((permissionObj) => {
   if(permissionObj.state!=='granted') askPermission()
  })
  .catch((error) => {
   console.log('Got error :', error);
  })
}

function App() {
  askPermission()
  const darkTheme = createMuiTheme({
    palette: {
      type: 'dark'
    },
  })
  const [isAuthenticated, setAuthenticated] = useState(false)




  return (
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <StylesProvider injectFirst>
          <Grid item xs={12} className='mainGrid'>
            <MainWidget/>
          </Grid>
        </StylesProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
