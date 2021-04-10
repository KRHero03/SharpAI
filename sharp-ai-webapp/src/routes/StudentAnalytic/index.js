import { Component } from "react";
import {
  Container,
  Button,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
} from "@material-ui/core";
import { GetApp } from "@material-ui/icons";
import Logo from "../../logo.png";
import firebase from "firebase";
import { Skeleton } from "@material-ui/lab";
import { withRouter } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { CSVLink } from "react-csv";
class StudentAnalytic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      user: null,
      isLoading: true,
      examCode: this.props.match.params.examCode,
      studentEmail: this.props.match.params.email,
      flags: [],
      student: null,
      startTime: 0,
      endTime: 0,
      studentAttended: false,
    };
  }

  async componentDidMount() {
    await firebase.auth().onAuthStateChanged(async (user) => {
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
        console.log(examData.Attendance[this.state.studentEmail])
        if (examData.Attendance[this.state.studentEmail] === undefined) {
          this.props.history.push("/");
          return;
        }
        const studentAttended = examData.Attendance[this.state.studentEmail];

        const studentFlags =
          examData.Flags[this.state.studentEmail].length === 0
            ? []
            : JSON.parse(examData.Flags[this.state.studentEmail]);
        let creditScore = 100;

        studentFlags.sort((a, b) => {
          return parseFloat(a.Timestamp) < parseFloat(b.Timestamp) ? -1 : 1;
        });
        studentFlags.forEach((flag) => (creditScore -= flag.Type));
        creditScore = creditScore < 0 ? 0 : creditScore;
        if (!studentAttended) creditScore = 0;

        this.setState({
          startTime: parseFloat(examData.StartTime),
          endTime: parseFloat(examData.EndTime),
          flags: studentFlags,
          studentAttended: studentAttended,
          creditScore: creditScore,
        });
        let csv = [
          ["Email", this.state.studentEmail.replaceAll('(dot)','.')],
          ["Exam Code", this.state.examCode],
          [
            "Attended Proctoring Session",
            this.state.studentAttended ? "Yes" : "No",
          ],
          ["Credit Score", this.state.creditScore],
        ];
        csv.push([]);
        csv.push(["Time(From Start of Exam)", "Type", "Remark"]);
        this.state.flags.forEach((flag) => {
          csv.push([
            this.getTimeFromStart(flag.Timestamp),
            flag.Type,
            flag.Remarks,
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

  render() {
    if (this.state.isLoading)
      return (
        <Grid className="mainContainer">
          <Skeleton type="rect" className="rectangleSkeleton" />
        </Grid>
      );
    return (
      <Grid className="mainContainer">
        <Card variant="outlined">
          <CardHeader
            avatar={<img src={Logo} className="mainLogo" alt="logo" />}
            title={this.state.studentEmail}
            subheader="Analysis Report"
          />
          <CardContent>
            <Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h4">
                    Attended Exam : {this.state.studentAttended ? "Yes" : "No"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h5">
                    Credit Score: {this.state.creditScore}
                  </Typography>
                  <CSVLink
                    data={this.state.csvList}
                    filename={
                      this.state.examCode +
                      "-" +
                      this.state.studentEmail +
                      ".csv"
                    }
                  >
                    <Button variant="contained" color="secondary">
                      <GetApp /> Get Report
                    </Button>
                  </CSVLink>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Credit Scores are on a scale of 100, 100 being the most
                    sincere student.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    A Credit Score of 60 or below means serious violations.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem">
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    The violations done by the Student will appear below (if
                    any)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} className="gridItem flagScroll">
                {this.state.flags.map((flag) => {
                  return (
                    <Card
                      variant="outlined"
                      className={
                        flag.Type === 1
                          ? "flagCard type1"
                          : flag.Type === 2
                          ? "flagCard type2"
                          : "flagCard type3"
                      }
                    >
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body1">
                            {flag.Remarks}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {this.getTimeFromStart(flag.Timestamp)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  }
}

export default withRouter(StudentAnalytic);
