import { Component } from "react";
import { withRouter } from "react-router-dom";
import { Grid } from "@material-ui/core";
import firebase from "firebase";
import { Skeleton } from "@material-ui/lab";
import MetaTags from "react-meta-tags";
import {
  Typography,
  Card,
  Fab,
  CircularProgress,
  Box,
  Link,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Logo from "../../logo.png";
import Container from "@material-ui/core/Container";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import DeleteMenu from "../../components/DeleteMenu";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isAuthenticated: false,
      isUserDataLoading: true,
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
        result = await ref.get();
        const { exams } = result.data();
        const classes = await db
          .collection("teachers")
          .doc(user.uid)
          .collection("classes")
          .get();

        var tExams = [];
        await Promise.all(
          exams.map(async (id) => {
            const exam = await db.collection("exams").doc(id).get();
            const { StartTime, EndTime } = exam.data();
            const students = await db
              .collection("exams")
              .doc(id)
              .collection("students")
              .get();

            tExams.push({
              exam: id,
              StartTime,
              EndTime,
              totalStudents: students.size,
            });
          })
        );


        var tarr = [];
        await Promise.all(
          classes.docs.map(async (doc) => {
            const students = await db
              .collection("teachers")
              .doc(user.uid)
              .collection("classes")
              .doc(doc.id)
              .collection("students")
              .get();

            tarr.push({
              classid: doc.id,
              totalStudents: students.size,
            });
          })
        );

        this.setState({
          user: user,
          isUserDataLoading: false,
          isAuthenticated: true,
          exams: tExams,
          classes: tarr,
        });
      } else {
        this.props.history.push("/");
      }
      return;
    });
  }

  handleClassDelete = async (classid) => {
    const classes = this.state.classes.filter((cls) => cls.classid != classid);
    this.setState({ classes });
    const db = firebase.firestore();
    await db
      .collection("teachers")
      .doc(this.state.user.uid)
      .collection("classes")
      .doc(classid)
      .delete();
  };

  handleExamDelete = async (examid) => {
    const exams = this.state.exams.filter((exm) => exm.exam !== examid);
    this.setState({ exams });
    const db = firebase.firestore();
    const teacher = await db
      .collection("teachers")
      .doc(this.state.user.uid)
      .get();
    const teacherData = teacher.data();
    let examList = teacherData.exams.filter((exam)=>exam!==examid)

    await db
      .collection("teachers")
      .doc(this.state.user.uid)
      .set({ exams: examList }, { merge: true });
    await db.collection("exams").doc(examid).delete();
  };

  getTime = (time) => {
    const date = new Date(time);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

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
          <meta
            id="og-title"
            property="og:title"
            content="Sharp AI Anti Cheat Tool"
          />
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
                    <CircularProgress color="secondary" />
                  </Grid>
                </Grid>
              </Card>
            ) : classes.length === 0 ? (
              <Grid>
                <Box display="flex" justifyContent="center">
                  <Typography variant="h4">No Classes Created</Typography>
                </Box>
              </Grid>
            ) : (
              classes.map(({ classid, totalStudents }, indx) => (
                <Card
                  key={indx}
                  variant="outlined"
                  style={{ padding: 0, margin: "20px" }}
                >
                  <CardHeader
                    action={
                      <DeleteMenu
                        onDelete={() => this.handleClassDelete(classid)}
                      />
                    }
                    title={
                      <Link
                        href={`/MyClass/${classid}`}
                        color="inherit"
                        className="cardLink"
                      >
                        {classid}
                      </Link>
                    }
                  />
                  <CardContent>
                    <Typography color="textSecondary" style={{ marginTop: 2 }}>
                      Total Students: {totalStudents}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <div style={{ fontSize: 30, textAlign: "center" }}>Exams</div>
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => this.props.history.push("/createexam")}
            >
              <AddIcon />
            </Fab>
            {this.state.isUserDataLoading ? (
              <Card variant="outlined" style={{ padding: 0, margin: "20px" }}>
                <Grid container>
                  <Grid item xs={12} className="homeCenter">
                    <CircularProgress color="secondary" />
                  </Grid>
                </Grid>
              </Card>
            ) : exams.length === 0 ? (
              <Grid>
                <Box display="flex" justifyContent="center">
                  <Typography variant="h4">No Exams Created</Typography>
                </Box>
              </Grid>
            ) : (
              exams.map(({ exam, StartTime, EndTime, totalStudents }, indx) => (
                <Card
                  key={indx}
                  variant="outlined"
                  style={{ padding: 0, margin: "20px" }}
                >
                  <CardHeader
                    action={
                      <DeleteMenu
                        onDelete={() => this.handleExamDelete(exam)}
                      />
                    }
                    title={
                      <Link
                        href={`/exams/${exam}`}
                        color="inherit"
                        className="cardLink"
                      >
                        {exam}
                      </Link>
                    }
                  />
                  <CardContent>
                    <Typography color="textSecondary" style={{ marginTop: 2 }}>
                      Start time: {this.getTime(StartTime)}
                    </Typography>
                    <Typography color="textSecondary" style={{ marginTop: 2 }}>
                      End time: {this.getTime(EndTime)}
                    </Typography>
                    <Typography color="textSecondary" style={{ marginTop: 2 }}>
                      Total Students: {totalStudents}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default withRouter(Dashboard);
