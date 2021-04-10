import React from "react";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Typography, Card } from "@material-ui/core";
import MetaTags from 'react-meta-tags'
import Logo from "../../logo.png";

import { withRouter } from 'react-router-dom'

class AboutUs extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      leftDrawer: false,
    }
  }
  render() {
    return (
      <Container className='home'>
        <MetaTags>
          <title>Our Story | Sharp AI</title>
          <meta id="meta-description" name="description" content="About us. Our Story here @ Sharp AI" />
          <meta id="og-title" property="og:title" content="Sharp AI" />
          <meta id="og-image" property="og:image" content={Logo} />
        </MetaTags>
        <Card variant='outlined' style={{ padding: 10 }}>
          <Grid container >
            <Grid item xs={12} className='homeCenter'>
              <div className=''>
                <img alt="Sharp AI Logo" className='homeLogo' src={Logo} />
                <div style={{ fontSize: 30, textAlign: 'center' }}>Sharp AI Anti Cheat</div>
              </div>
            </Grid>
            <Grid container xs={12} justify="start">
              <Grid item>
                <Typography variant="h6" align="left">What we have in Store for you</Typography>
                <p>
                  Sharp AI Anti Cheat Exam Proctoring Tool, as the name suggests, provides a hassle free solution to conduct fair Examinations and Tests.

                </p>
                <p align="left">
                  Sharp AI disables Examiners from cheating and using unfair means via it's Chrome Extension which monitors all the activities of the Candidate while he/she is attempting the Examination.
                </p>
                <p align="left">
                  The Candidate is flagged upon various violations such as Rejoining the Proctoring session from a different device, switching tabs, opening new tabs, opening new windows, resizing windows, using a Virtual Machine or performing suspicious facial activities while attempting the Examination.
                </p>
                <p align="left">
                  While no solution is perfect, we strive to deliver the best of our tool with rapid updates and fixes for different miscomings and loop holes.
                </p>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" align="left">The Team</Typography>
                <p align="left">
                  Team DevDevils @ Hack36
                </p>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" align="left">Contact</Typography>
                <p align="left">
                  Email: hola(at)sharp-ai(dot)com
                </p>
                <p align="left">
                  Phone: +91 6322 412 322
                </p>
                <p align="left">
                  Fax: +22 675 124 5
                </p>
                <p align="left" color="textSecondary">
                  Sharp AI Anti Cheat<br />
                  NIT Surat, Surat<br />
                  India<br />
                  395007
                </p>
              </Grid>
            </Grid>

          </Grid>
        </Card>
      </Container>
    );
  }
}

export default withRouter(AboutUs);