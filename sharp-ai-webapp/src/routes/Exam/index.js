import React, { Component } from "react";
import {
  Button,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Link,
  IconButton,
  Tooltip,
  Snackbar,
  Zoom
} from "@material-ui/core";
import { GetApp, Send, Close } from "@material-ui/icons";
import Logo from "../../logo.png";
import firebase from "firebase";
import { Skeleton } from "@material-ui/lab";
import { withRouter } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { CSVLink } from "react-csv";
import emailjs from 'emailjs-com';

class StudentAnalytic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      user: null,
      isLoading: true,
      examCode: this.props.match.params.examCode,
      studentData: [],
      startTime: 0,
      endTime: 0,
      timeLeft: '',
      isSendButtonClicked: false,
      snackbarText: '',
      openSnackbar: false,
    };
  }

  async componentDidMount() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.setState({
          isAuthenticated: true,
          user: user,
        });

        const dbRef = firebase.firestore();
        const teacherRef = dbRef
          .collection("teachers")
          .doc(this.state.user.uid);
        const teacherResult = await teacherRef.get();
        if (!teacherResult.exists) {
          this.props.history.push("/");
          return;
        }
        const teacherData = teacherResult.data();

        const exams = teacherData.exams;

        if (!exams.includes(this.state.examCode)) {
          this.props.history.push("/");
          return;
        }
        const examRef = dbRef.collection("exams").doc(this.state.examCode);
        const examResult = await examRef.get();
        if (!examResult.exists) {
          this.props.history.push("/");
          return;
        }
        const examData = examResult.data();
        console.log(examData);
        let studentData = [];
        const startTime = parseFloat(examData.StartTime);
        const endTime = parseFloat(examData.EndTime);

        const studentRef = examRef.collection("students");
        const studentResult = await studentRef.get();

        studentResult.docs.forEach((doc) => {
          let obj = {
            studentEmail: doc.data().studentEmail.replaceAll('(dot)', '.'),
            studentDisplayName: doc.data().studentDisplayName,
            studentRollNo: doc.data().studentRollNo,
          };
          obj["Attendance"] = examData.Attendance[obj.studentEmail.replaceAll('.', '(dot)')];
          obj["Flags"] =
            examData.Flags[obj.studentEmail.replaceAll('.', '(dot)')].length === 0
              ? []
              : JSON.parse(examData.Flags[obj.studentEmail.replaceAll('.', '(dot)')]);
          studentData.push(obj);
        });

        studentData.sort((a, b) => {
          return a["Flags"].length > b["Flags"].length ? -1 : 1;
        });

        this.setState({
          studentData: studentData,
          startTime: startTime,
          endTime: endTime,
        });

        this.getTimeLeft();

        let csv = [
          ["RollNo", "Name", "Email", "Attendance", "#Flags", "Credit Score"],
        ];

        studentData.forEach((student) => {
          let creditScore = 100;
          student.Flags.forEach((f) => (creditScore -= f.Type));
          creditScore = creditScore < 0 ? 0 : creditScore;

          if (!student.Attendance) creditScore = 0;
          csv.push([
            student.studentRollNo,
            student.studentDisplayName,
            student.studentEmail,
            student.Attendance,
            student.Flags.length,
            creditScore,
          ]);
        });

        this.setState({
          csvList: csv,
          isLoading: false,
        });
      } else {
        this.props.history.push("/");
        return;
      }
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
  getTimeLeft = () => {

    var curTime = new Date().getTime()
    if (curTime > this.state.endTime) {
      this.setState({
        timeLeft: 'Exam Ended'
      })
      return
    }
    var interval = setInterval(() => {
      curTime = new Date().getTime()
      if (curTime < this.state.startTime) {
        var diff = this.state.startTime - curTime
        diff = Math.floor(diff / 1000)
        var days = Math.floor(diff / 86400)
        diff -= days * 86400
        var hours = Math.floor(diff / 3600) % 24
        diff -= hours * 3600
        hours = hours < 10 ? '0' + hours : hours
        var minutes = Math.floor(diff / 60) % 60
        diff -= minutes * 60
        minutes = minutes < 10 ? '0' + minutes : minutes
        var seconds = diff % 60
        seconds = seconds < 10 ? '0' + seconds : seconds
        this.setState({
          timeLeft: 'To Start: ' + ((days === 0) ? hours + ':' + minutes + ':' + seconds : '' + days + ' days ' + hours + ':' + minutes + ':' + seconds)
        })
      } else if (curTime < this.state.endTime) {
        diff = this.state.endTime - curTime
        diff = Math.floor(diff / 1000)
        days = Math.floor(diff / 86400)
        diff -= days * 86400
        hours = Math.floor(diff / 3600) % 24
        diff -= hours * 3600
        hours = hours < 10 ? '0' + hours : hours
        minutes = Math.floor(diff / 60) % 60
        diff -= minutes * 60
        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = diff % 60
        seconds = seconds < 10 ? '0' + seconds : seconds
        this.setState({
          timeLeft: 'To End: ' + hours + ':' + minutes + ':' + seconds
        })

      } else {
        this.setState({
          timeLeft: 'Exam Ended'
        })
        clearInterval(interval)
      }
    }, 1000)
  }
  getTime = (time) => {
    const date = new Date(time);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  getTimeFromStart = (time) => {
    var diff = time - this.state.startTime;
    diff = Math.floor(diff / 1000);
    var days = Math.floor(diff / 86400);
    diff -= days * 86400;
    var hours = Math.floor(diff / 3600) % 24;
    diff -= hours * 3600;
    hours = hours < 10 ? "0" + hours : hours;
    var minutes = Math.floor(diff / 60) % 60;
    diff -= minutes * 60;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var seconds = diff % 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  };

  sendReminder = async () => {
    this.setState({
      isSendButtonClicked: true
    })
    try {

      await Promise.all(this.state.studentData.map(async (student) => {
        await emailjs.send("service_nf20pac", "template_4fv3qoc", {
          to_name: student.studentDisplayName,
          start_time: this.getTime(this.state.startTime),
          end_time: this.getTime(this.state.endTime),
          access_code: this.state.examCode,
          to_email: student.studentEmail,
        });

      }))
    } catch (e) {

      this.showMessage('Something went Wrong! Please try again later.')
      this.setState({
        isSendButtonClicked: false
      })
      return
    }
    this.showMessage('Sent Email Reminders to Students!')
    this.setState({
      isSendButtonClicked: false
    })
  }
  render() {
    if (this.state.isLoading)
      return (
        <Grid className="mainContainer">
          <MetaTags>
            <title>Exam Analytics | Sharp AI</title>
            <meta
              id="meta-description"
              name="description"
              content="Exam Analytics at Sharp AI Anti Cheat Tool"
            />
            <meta
              id="og-title"
              property="og:title"
              content="Exam Analytics at Sharp AI Anti Cheat Tool"
            />
            <meta id="og-image" property="og:image" content={Logo} />
          </MetaTags>

          <Skeleton type="rect" className="rectangleSkeleton" />
        </Grid>
      );
    return (
      <Grid className="mainContainer">
        <MetaTags>
          <title>Exam Analytics | Sharp AI</title>
          <meta
            id="meta-description"
            name="description"
            content="Exam Analytics at Sharp AI Anti Cheat Tool"
          />
          <meta
            id="og-title"
            property="og:title"
            content="Exam Analytics at Sharp AI Anti Cheat Tool"
          />
          <meta id="og-image" property="og:image" content={Logo} />
        </MetaTags>
        <Card variant="outlined">
          <CardHeader
            avatar={<img src={Logo} className="mainLogo" alt="logo" />}
            title={this.state.examCode}
            subheader="Exam Analytics"
          />
          <CardContent>
            <Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h5">Exam Start Time </Typography>
                  <Typography variant="h5">
                    {this.getTime(this.state.startTime)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h5">Exam End Time </Typography>
                  <Typography variant="h5">
                    {this.getTime(this.state.endTime)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between" >
                  <Typography variant="h5">
                    Total Students: {this.state.studentData.length}
                  </Typography>
                  <Typography variant="h5">
                    {this.state.timeLeft}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between" >
                  {
                    this.state.isSendButtonClicked
                      ?
                      <CircularProgress color='secondary' />
                      :
                      <Tooltip
                        TransitionComponent={Zoom}
                        title="Send Email Reminders to Students"
                        aria-label="Send Email Reminders to Students"
                        arrow
                      >
                        <Button variant="contained" color="secondary" onClick={this.sendReminder}>
                          <Send /> Send Email Reminder
                        </Button>
                      </Tooltip>
                  }

                  <CSVLink
                    data={this.state.csvList}
                    filename={this.state.examCode + ".csv"}
                  >
                    <Tooltip
                      TransitionComponent={Zoom}
                      title="Download CSV Analysis Report"
                      aria-label="Download CSV Analysis Report"
                      arrow
                    >
                      <Button variant="contained" color="secondary">
                        <GetApp /> Get Analysis Report
                      </Button>
                    </Tooltip>
                  </CSVLink>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    This is a Realtime Analytic Report of the Examination
                    conducted by you.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Please note that it is not the final report if the
                    Examination has not yet ended.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem">
                <Typography variant="caption" color="textSecondary">
                  Students who have not attended the Examination yet appear as
                  Red in the below list:
                </Typography>
              </Grid>
              <Grid item xs={12} className="gridItem flagScroll">
                {this.state.studentData.map((student) => {
                  return (
                    <Link
                      href={
                        "/analytics/" +
                        this.state.examCode +
                        "/student/" +
                        student.studentEmail.replaceAll('.','(dot)')
                      }
                      className="cardLink"
                    >
                      <Card
                        variant="outlined"
                        className={
                          student.Attendance === false
                            ? "flagCard type1"
                            : "flagCard"
                        }
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="body1">
                              {student.studentRollNo} &nbsp;{" "}
                              {student.studentDisplayName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {student.Flags.length + " Flags"}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
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
      </Grid>
    );
  }
}

export default withRouter(StudentAnalytic);
