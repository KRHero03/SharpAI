import { Component } from "react";
import { withRouter } from "react-router-dom";
import { Grid } from "@material-ui/core";
import firebase from "firebase";
import { Skeleton } from "@material-ui/lab";
import MetaTags from "react-meta-tags";
import { Typography, Card, Fab, CircularProgress, Box, Link } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Logo from "../../logo.png";
import Container from "@material-ui/core/Container";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isAuthenticated: false,
      isUserDataLoading: true,
      hasMore: true,
      classes: [],
      exams: [],
    };
  }
  async componentDidMount() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const db = firebase.firestore();
        const ref = db.collection("teachers").doc(user.uid);
        let result = await ref.get();
        if (!result.exists) {
          await ref.set({
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email,
            exams: [],
          });
        }
        result = await ref.get()
        const { exams } = result.data();
        const classes = await db
          .collection("teachers")
          .doc(user.uid)
          .collection("classes")
          .get();

        var tarr = [];
        classes.forEach((classs) => tarr.push(classs.id));

        this.setState({
          user: user,
          isUserDataLoading: false,
          isAuthenticated: true,
          exams,
          classes: tarr,
        });
      } else {
        this.props.history.push("/");
      }
      return;
    });
  }

  render() {
    const { exams, classes } = this.state;

    return (
      <Container className="home">
        <MetaTags>
          <title>Dashboard | Sharp AI</title>
          <meta
            id="meta-description"
            name="description"
            content="Sharp AI Anti Cheat Tool"
          />
          <meta id="og-title" property="og:title" content="Sharp AI Anti Cheat Tool" />
          <meta id="og-image" property="og:image" content={Logo} />
        </MetaTags>

        <Grid container spacing={2}>
          <Grid item md={6} xs={12}>
            <div style={{ fontSize: 30, textAlign: "center" }}>Classes</div>
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => this.props.history.push("/CreateClass")}
            >
              <AddIcon />
            </Fab>
            {this.state.isUserDataLoading ? (
              <Card variant="outlined" style={{ padding: 0, margin: "20px" }}>
                <Grid container>
                  <Grid item xs={12} className="homeCenter">
                    <CircularProgress color='secondary' />
                  </Grid>
                </Grid>
              </Card>
            ) : classes.length === 0 ?
              <Grid>
                <Box display='flex' justifyContent='center'>
                  <Typography variant='h4'>No Classes Created</Typography>
                </Box>
              </Grid>
              : (
                classes.map((classid, indx) => (
                  <Link href={`/MyClass/${classid}`} className='cardLink'>
                    <Card
                      key={indx}
                      variant="outlined"
                      style={{ padding: 0, margin: "20px" }}
                    >
                      <Grid container>
                        <Grid item xs={12} className="homeCenter">
                          <Typography variant='h4'>{classid}</Typography>
                        </Grid>
                      </Grid>
                    </Card>
                  </Link>
                ))
              )}
          </Grid>
          <Grid item xs={12} md={6}>
            <div style={{ fontSize: 30, textAlign: "center" }}>Exams</div>
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => this.props.history.push("/CreateExam")}
            >
              <AddIcon />
            </Fab>
            {this.state.isUserDataLoading ? (
              <Card variant="outlined" style={{ padding: 0, margin: "20px" }}>
                <Grid container>
                  <Grid item xs={12} className="homeCenter">
                    <CircularProgress color='secondary' />
                  </Grid>
                </Grid>
              </Card>
            ) : exams.length === 0 ?
              <Grid>
                <Box display='flex' justifyContent='center'>
                  <Typography variant='h4'>No Exams Created</Typography>
                </Box>
              </Grid>
              : (
                exams.map((exam, indx) => (
                  <Link to={`/exams/${exam}`} className='cardLink'>
                    <Card
                      key={indx}
                      variant="outlined"
                      style={{ padding: 0, margin: "20px" }}
                    >
                      <Grid container>
                        <Grid item xs={12} className="homeCenter">
                          <h2>{exam}</h2>
                        </Grid>
                      </Grid>
                    </Card>
                  </Link>
                ))
              )}
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default withRouter(Dashboard);
