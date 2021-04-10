import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import firebase from 'firebase'
import firebaseConfig from './config/firebaseConfig'

require('dotenv')

firebase.initializeApp(firebaseConfig)
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
firebase.firestore().enablePersistence()

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
registerServiceWorker();