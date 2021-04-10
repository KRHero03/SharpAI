import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import firebase from "firebase";
import { Skeleton } from "@material-ui/lab";
import {
  Send,
  Publish,
  MoreVert,
  Favorite,
  Cancel,
  Close,
} from "@material-ui/icons";

import MetaTags from "react-meta-tags";
import {
  IconButton,
  FormControl,
  FormLabel,
  FormGroup,
  FormHelperText,
  CardHeader,
  Card,
  CardActions,
  FormControlLabel,
  Checkbox,
  CardContent,
  Container,
  Grid,
  Paper,
  TextField,
  Box,
  Fab,
  Tooltip,
  Zoom,
  Divider,
  Avatar,
  Typography,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  ThemeProvider,
} from "@material-ui/core";

class CreateExam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isAuthenticated: false,
      isUserDataLoading: true,
      classes: [],
      checked: [],
      examName: "",
      startTime: "1495602000000",
      endTime: "1495602000000",
      Attendance: [],
    };
  }
  async componentDidMount() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const db = firebase.firestore();
        const ref = db.collection("teachers").doc(user.uid);
        const result = await ref.get();

        const classes = await db
          .collection("teachers")
          .doc(user.uid)
          .collection("classes")
          .get();

        var tarr = [];
        var checked = [];

        classes.forEach((classs) => {
          tarr.push(classs.id);
        });
        for (var i = 0; i < classes.size; i++) {
          checked.push(false);
        }

        this.setState({
          user: user,
          isUserDataLoading: false,
          isAuthenticated: true,
          classes: tarr,
          checked,
        });
      } else {
        this.props.history.push("/");
      }
      return;
    });
  }
  handleSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({
      openSnackbar: !this.state.openSnackbar,
    });
  };

  showMessage = (msg) => {
    this.setState({
      snackbarText: msg,
      openSnackbar: true,
    });
  };

  handleTextFieldChange = (e) => {
    this.setState({
      ...this.state,
      examName: e.target.value.toUpperCase(),
    });
  };

  handleChange = (event) => {
    const newChecked = this.state.checked;
    newChecked[parseInt(event.target.name)] = event.target.checked;
    this.setState({ ...this.state, checked: newChecked });
  };

  CreateExam = async () => {
    // Exam is 6 digit alphanumeric

    if (this.state.examName.length !== 6) {
      this.showMessage("Code should be of 6 digits");
      return;
    } else if (!this.state.examName.match(/^[0-9A-Z ]+$/)) {
      this.showMessage("Code should be aphaNumeric");
      return;
    }
    const db = firebase.firestore();

    // Exam code is not repeated
    let flag = false;
    db.collection("exams")
      .doc(this.state.examName)
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          this.showMessage("Code Already Exists!!");
          flag = true;
        }
      });
    if (flag) {
      return;
    }

    // Validating Time
    if (this.state.startTime < new Date().getTime()) {
      this.showMessage("Please Select Valid Time");
      return;
    }

    // No Class selected
    const checkedClass = [];
    for (var i = 0; i < this.state.checked.length; i++) {
      if (this.state.checked[i]) {
        checkedClass.push(this.state.classes[i]);
      }
    }
    if (checkedClass.length === 0) {
      this.showMessage("Please Select Some Classes first");
      return;
    } else if (this.state.startTime >= this.state.endTime) {
      this.showMessage("Please Select Valid Time");
      return;
    }

    const ref = db.collection("teachers").doc(this.state.user.uid);
    const result = await ref.get();

    const data = result.data();
    const newExam = result.data().exams;
    newExam.push(this.state.examName);
    // Pushing exam in teacher's db
    await ref.set({ ...data, exams: newExam });

    // / Adding students to exam
    const studentList = [];
    console.log(checkedClass);

    await Promise.all(
      checkedClass.map(async (classId) => {
        const studentData = await ref
          .collection("classes")
          .doc(classId)
          .collection("students")
          .get();
        // console.log(studentData)
        await Promise.all(
          studentData.docs.map(async (std) => {
            // console.log(std.data())
            studentList.push(std.data());
            await db
              .collection("exams")
              .doc(this.state.examName)
              .collection("students")
              .doc(std.data().studentRollNo)
              .set(std.data());
          })
        );
      })
    );

    // Adding attendance and flags for exams
    const Attendance = {};
    console.log(studentList.length);
    for (var i = 0; i < studentList.length; i++) {
      Attendance[studentList[i].studentEmail] = false;
    }
    const Flags = {};
    for (var i = 0; i < studentList.length; i++) {
      Flags[studentList[i].studentEmail] = "";
    }

    await db.collection("exams").doc(this.state.examName).set({
      Attendance,
      Flags,
      EndTime: this.state.endTime,
      StartTime: this.state.startTime,
    });
    this.setState({
      ...this.state,
      examName: "",
    });
  };

  dateHandler = (e) => {
    const dte = new Date(e.target.value);
    const mss = dte.getTime();
    this.setState({
      ...this.state,
      [e.target.name]: mss,
    });
  };

  render() {
    return (
      <Grid className="mainContainer">
        <MetaTags>
          <title>Create Exam | Sharp AI</title>
          <meta
            id="meta-description"
            name="description"
            content="Create Exam at Sharp AI"
          />
          <meta
            id="og-title"
            property="og:title"
            content="Sharp AI Anti Cheat"
          />
        </MetaTags>
        <Container className="home" style={{ width: "60%" }}>
          <Paper elevation={0}>
            <Grid className="createPost">
              <Grid item xs={12}>
                <TextField
                  className="createPostTextField"
                  label="Create Exam Code"
                  id="outlined-size-normal"
                  variant="outlined"
                  color="secondary"
                  multiline
                  onChange={this.handleTextFieldChange}
                  value={this.state.examName}
                  rowsMax="3"
                />

                <div className="" style={{ marginTop: "2rem" }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Choose Classes</FormLabel>
                    <FormGroup>
                      {/* <FormControlLabel
                        control={<Checkbox checked={true} onChange={this.handleChange} name="gilad" />}
                        label="Gilad Gray"
                      />
                      <FormControlLabel
                        control={<Checkbox checked={false} onChange={this.handleChange} name="jason" />}
                        label="Jason Killian"
                      />
                      <FormControlLabel
                        control={<Checkbox checked={true} onChange={this.handleChange} name="antoine" />}
                        label="Antoine Llorca"
                      /> */}
                      {this.state.classes.map((classid, indx) => {
                        return (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={this.state.checked[indx]}
                                onChange={this.handleChange}
                                name={indx}
                              />
                            }
                            label={classid}
                          />
                        );
                      })}
                    </FormGroup>
                  </FormControl>
                </div>
              </Grid>
              <TextField
                onChange={this.dateHandler}
                id="datetime-local"
                label="Starting Time"
                name="startTime"
                type="datetime-local"
                defaultValue="2017-05-24T10:30"
                style={{ marginTop: "2rem" }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                onChange={this.dateHandler}
                id="datetime-local"
                name="endTime"
                label="EndingTime"
                type="datetime-local"
                defaultValue="2017-05-24T10:30"
                style={{ marginTop: "2rem", display: "block" }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <Grid item xs={12}>
                <Box display="flex" flexDirection="row-reverse">
                  <Tooltip
                    TransitionComponent={Zoom}
                    title="Create Post"
                    aria-label="Create Post"
                    arrow
                  >
                    <Fab
                      color="secondary"
                      className="createPostFAB"
                      size="small"
                      onClick={this.CreateExam}
                    >
                      <Send />
                    </Fab>
                  </Tooltip>
                </Box>
              </Grid>
              <Divider />
            </Grid>

            <Snackbar
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              open={this.state.openSnackbar}
              autoHideDuration={6000}
              onClose={this.handleSnackbar}
              message={this.state.snackbarText}
              action={
                <React.Fragment>
                  <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={this.handleSnackbar}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
            />
          </Paper>
        </Container>
      </Grid>
    );
  }
}

export default withRouter(CreateExam);
