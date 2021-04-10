import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import firebase from "firebase";
import MetaTags from "react-meta-tags";
import Logo from "../../logo.png";
import EnhancedTable from "../../components/StudentTable";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import SaveIcon from "@material-ui/icons/Save";
import Button from "@material-ui/core/Button";
import { Skeleton } from '@material-ui/lab'
import {
  Card,
  Container,
  Grid,
  Paper,
  TextField,
  Fab,
  Tooltip,
  Zoom,
  Typography,
  Snackbar,
  IconButton,
  CircularProgress,
  Box,
} from "@material-ui/core";
import { Publish } from "@material-ui/icons";
import { Close } from "@material-ui/icons";
const Papa = require("papaparse");

class MyClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isAuthenticated: false,
      isUserDataLoading: true,
      hasMore: true,
      classId: this.props.match.params.id,
      students: [],
      addName: "",
      addRollNo: "",
      addEmail: "",
      isSaveButtonClicked: false,
      isUploadButtonClicked: false,
      isDeleteButtonClicked: false,
      openSnackbar: false,
      snackbarText: "",
    };
  }

  async componentDidMount() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const db = firebase.firestore();
        const ref = db.collection("teachers").doc(user.uid);
        const result = await ref.get();

        const studentref = await db
          .collection("teachers")
          .doc(user.uid)
          .collection("classes")
          .doc(this.state.classId)
          .collection("students")
          .get();
        var students = [];
        studentref.forEach((student) => {
          students.push(student.data());
        });

        if (!result.exists) {
          await ref.set({
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email,
          });
        }
        this.setState({
          user: user,
          isUserDataLoading: false,
          isAuthenticated: true,
          students,
        });
      } else {
        this.props.history.push("/");
      }
      return;
    });
  }

  handleDelete = async (selected) => {
    this.setState({
      isDeleteButtonClicked: true
    })
    const db = firebase.firestore();
    selected.forEach(async (rollNo) => {
      const student = await db
        .collection("teachers")
        .doc(this.state.user.uid)
        .collection("classes")
        .doc(this.state.classId)
        .collection("students")
        .doc(rollNo)
        .delete();
    });
    const students = this.state.students.filter(
      (student) => !selected.includes(student.studentRollNo)
    );
    this.setState({ students: students });
    this.setState({
      isDeleteButtonClicked: false
    })
  };

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

  handleChanges = (e) => {
    const input = e.target;
    const name = input.name;
    const value = input.type === "checkbox" ? input.checked : input.value;
    this.setState({ [name]: value });
  };

  addStudent = async (obj) => {
    function validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    if (obj.studentDisplayName.length <= 0 || obj.studentDisplayName.length > 25 || obj.studentEmail.length <= 0 || obj.studentEmail.length > 25 || obj.studentRollNo.length <= 0 || obj.studentRollNo.length >= 25) {
      this.showMessage('Please enter Valid Details! Make sure the Details are within 25 Character Limit!')
      this.setState({
        isSaveButtonClicked: false
      })
      return
    }


    if (!validateEmail(obj.studentEmail)) {
      this.showMessage("Please enter Valid Email Address");
      return;
    }

    obj.studentEmail = obj.studentEmail.replace(/\./g, "(dot)");

    const db = firebase.firestore();
    const studentRef = db
      .collection("teachers")
      .doc(this.state.user.uid)
      .collection("classes")
      .doc(this.state.classId)
      .collection("students");

    const st = await studentRef.doc(obj.studentRollNo).get();
    const em = await studentRef
      .where("studentEmail", "==", obj.studentEmail)
      .get();

    //snackbar here
    if (st.data()) {
      this.showMessage("Roll No already exists!");
      return;
    }
    if (!em.empty) {
      this.showMessage("Email ID already exists!");
      return;
    }

    const classRef = db
      .collection("teachers")
      .doc(this.state.user.uid)
      .collection("classes")
      .doc(this.state.classId)
      .collection("students")
      .doc(obj.studentRollNo);
    await classRef.set(obj);

    this.setState({
      students: [...this.state.students, obj],
    });
  };

  handleSubmit = async (event) => {
    const obj = {
      studentDisplayName: this.state.addName,
      studentEmail: this.state.addEmail,
      studentRollNo: this.state.addRollNo,
    };
    this.setState({
      isSaveButtonClicked: true
    })

    await this.addStudent(obj);
    this.setState({
      isSaveButtonClicked: false
    })
  };

  onFileUpload = (e) => {
    let file = e.target.files[0];
    Papa.parse(file, {
      complete: async (res) => {
        console.log(res)
        if (res.data.length === 0) {
          this.showMessage('Please upload a valid CSV that has header fields studentRollNo, studentDisplayName and studentEmail!')
          return
        }
        var p = 0
        this.setState({
          isUploadButtonClicked: true
        })
        await Promise.all(res.data.map(async (student) => {
          if (student.studentRollNo === undefined || student.studentDisplayName === undefined || student.studentEmail === undefined) {
            p = 1
            return
          }
          await this.addStudent(student);
        }));
        if (p) {
          this.showMessage('Some or all Entries in CSV failed to load! Please make sure that every Entry has a valid "studentRollNo", "studentDisplayName" and "studentEmail" field!')
        } else {
          this.showMessage('CSV File has been loaded successfully!')
        }

        this.setState({
          isUploadButtonClicked: false
        })
      },
      header: true,
    });
  };

  handleUpload = async () => {
    const fileSelector = document.getElementById("fileUpload");
    fileSelector.click();
  };

  render() {
    const { classId, students } = this.state;

    if (this.state.isUserDataLoading)
      return (
        <Grid className='mainContainer'>
          <Skeleton className='rectangleSkeleton' type='rect' style={{ marginTop: 10, marginBottom: 10 }} />

          <Skeleton className='rectangleSkeleton' type='rect' style={{ marginTop: 10, marginBottom: 10 }} />
        </Grid>
      )
    return (
      <Container className="home">
        <input
          hidden
          type="file"
          id="fileUpload"
          accept=".csv"
          onChange={this.onFileUpload}
        />
        <MetaTags>
          <title>My Class | Sharp AI</title>
          <meta
            id="meta-description"
            name="description"
            content="Modify your Class at Sharp AI Anti Cheat"
          />
          <meta id="og-title" property="og:title" content="Sharp AI" />
          <meta id="og-image" property="og:image" content={Logo} />
        </MetaTags>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <h1>{classId}</h1>
          </Grid>
        </Grid>
        <EnhancedTable
          students={students}
          onDelete={this.handleDelete}
        ></EnhancedTable>

        <Card variant="outlined" style={{ padding: 10, marginTop: 10 }}>
          <Typography
            className={{
              flex: "1 1 100%",
            }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Add Student
          </Typography>
          <TextField
            color="secondary"
            id="standard-basic"
            label="Name"
            style={{ width: "40ch", marginRight: "1rem" }}
            name="addName"
            onChange={this.handleChanges}
          />
          <TextField
            color="secondary"
            id="standard-basic"
            label="Roll No"
            style={{ width: "40ch", marginRight: "1rem" }}
            name="addRollNo"
            onChange={this.handleChanges}
          />
          <TextField
            color="secondary"
            id="standard-basic"
            label="Email"
            style={{ width: "40ch", marginRight: "1rem" }}
            name="addEmail"
            onChange={this.handleChanges}
          />
          {
            this.state.isSaveButtonClicked
              ?
              <CircularProgress color='secondary' style={{ marginBottom: 10, marginTop: 10 }} />
              :
              <Tooltip
                TransitionComponent={Zoom}
                title="Add Student Data"
                aria-label="Add Student Data"
                arrow
              >
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SaveIcon />}
                  style={{ margin: "1rem" }}
                  onClick={this.handleSubmit}
                >
                  Save
                </Button>
              </Tooltip>

          }
          <Box display='flex' justifyContent='space-between'>

            <Typography
              className={{
                flex: "1 1 100%",
              }}
              variant="h6"
              id="tableTitle"
              component="div"
              style={{ marginTop: 10 }}
            >
              Or Add a CSV File
            </Typography>
            {
              this.state.isUploadButtonClicked
                ?
                <CircularProgress color='secondary' style={{ marginTop: 10, marginBottom: 10 }} />
                :
                <Tooltip
                  TransitionComponent={Zoom}
                  title="Upload CSV file"
                  aria-label="Upload CSV file"
                  arrow
                >
                  <Fab
                    color="secondary"
                    className="createPostFAB"
                    size="small"
                    onClick={this.handleUpload}
                  >
                    <Publish />
                  </Fab>
                </Tooltip>
            }

          </Box>
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
      </Container>
    );
  }
}

export default withRouter(MyClass);
