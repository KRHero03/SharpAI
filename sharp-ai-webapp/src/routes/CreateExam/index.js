import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import firebase from "firebase";
import { Skeleton } from "@material-ui/lab";
import {
  Send,
  Close,
} from "@material-ui/icons";

import MetaTags from "react-meta-tags";
import {
  IconButton,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Container,
  Grid,
  Paper,
  TextField,
  Box,
  Fab,
  Tooltip,
  Zoom,
  Typography,
  CircularProgress,
  Snackbar,
} from "@material-ui/core";

import emailjs from 'emailjs-com'

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
      btnClicked: false,
      snackbarText: '',
      openSnackbar: false,
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
    if(e.target.value.length>6) return
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

  getTime = (time) => {
    const date = new Date(time);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };
  sendReminder = async (studentList) => {
    try {

      await Promise.all(studentList.map(async (student) => {
        await emailjs.send("service_nf20pac", "template_4fv3qoc", {
          to_name: student.studentDisplayName,
          start_time: this.getTime(this.state.startTime),
          end_time: this.getTime(this.state.endTime),
          access_code: this.state.examName,
          to_email: student.studentEmail.replace('(dot)','.'),
        });

      }))
    } catch (e) {
      console.log(e)
      return
    }
  }

  createExam = async () => {

    if (this.state.examName.length !== 6) {
      this.showMessage("Code should be of 6 characters!");
      return;
    } else if (!this.state.examName.match(/^[0-9A-Z ]+$/)) {
      this.showMessage("Code should be AlphaNumeric!");
      return;
    }
    this.setState({
      btnClicked: true
    })
    const db = firebase.firestore();

    // Exam code is not repeated
    let flag = false;
    await db.collection("exams")
      .doc(this.state.examName)
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          this.showMessage("Code Already Exists!!");
          flag = true;
        }
      });
    if (flag) {
      this.setState({
        btnClicked: false
      })
      return;
    }

    // Validating Time
    if (this.state.startTime < new Date().getTime()) {
      this.showMessage("Please Select Valid Time");
      this.setState({
        btnClicked: false
      })
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
      this.setState({
        btnClicked: false
      })
      return;
    } else if (this.state.startTime >= this.state.endTime) {
      this.showMessage("Please Select Valid Time");
      this.setState({
        btnClicked: false
      })
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

    const Attendance = {};
    console.log(studentList.length);
    for (var i = 0; i < studentList.length; i++) {
      Attendance[studentList[i].studentEmail] = false;
    }
    const Flags = {};
    for (var i = 0; i < studentList.length; i++) {
      Flags[studentList[i].studentEmail] = "";
    }
    const temp = this.state.examName;
    console.log(temp);
    await db.collection("exams").doc(this.state.examName).set({
      Attendance,
      Flags,
      EndTime: this.state.endTime,
      StartTime: this.state.startTime,
    });


    await this.sendReminder(studentList)
    
    this.setState({
      ...this.state,
      examName: "",
      btnClicked: false,
    });

    this.props.history.push(`/exams/${temp}`);
  };

  dateHandler = (e) => {
    const dte = new Date(e.target.value);
    const mss = dte.getTime();
    this.setState({
      ...this.state,
      [e.target.name]: mss,
    });
  };

  getCurrentTime = () => {
    const date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    month  = month<10?'0'+month:month
    let day = date.getDate()
    day  = day<10?'0'+day:day
    let hour = date.getHours()
    hour  = hour<10?'0'+hour:hour
    let min = date.getMinutes()
    min  = min<10?'0'+min:min
    return ''+year+'-'+month+'-'+day+'T'+hour+':'+min
  }

  render() {
    if(this.state.isUserDataLoading) 
    return (
      <Grid className='mainContainer'>
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
        <Skeleton type='rect' className='rectangleSkeleton'/>
      </Grid>
    );
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
                <Typography variant='caption' color='textSecondary'>Exam Code should be a 6 character Alphanumeric Code</Typography>

                <div className="" style={{ marginTop: "2rem" }}>
                  <FormControl component="fieldset">
                    <Typography color='textSecondary' >Choose Classes</Typography>
                <Typography variant='caption' color='textSecondary'>Choose classes for which you want to conduct the Proctoring session</Typography>
                    <FormGroup>
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
                color='secondary'
                className='createPostTextField'
                defaultValue={this.getCurrentTime()}
                style={{ marginTop: "2rem" }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                onChange={this.dateHandler}
                id="datetime-local"
                name="endTime"
                label="End Time"
                type="datetime-local"
                color='secondary'
                className='createPostTextField'
                defaultValue={this.getCurrentTime()} 
                style={{ marginTop: "2rem" }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <Grid item xs={12}>
                {this.state.btnClicked ? (
                  <Box
                    display="flex"
                    flexDirection="row-reverse"
                  >
                    <CircularProgress color="secondary" style={{marginTop: 10,marginBottom: 10}}/>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="row-reverse">
                    <Tooltip
                      TransitionComponent={Zoom}
                      title="Create Exam"
                      aria-label="Create Exam"
                      arrow
                    >
                      <Fab
                        color="secondary"
                        className="createPostFAB"
                        size="small"
                        onClick={this.createExam}
                      >
                        <Send />
                      </Fab>
                    </Tooltip>
                  </Box>
                )}
              </Grid>
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
      </Grid>
    );
  }
}

export default withRouter(CreateExam);
