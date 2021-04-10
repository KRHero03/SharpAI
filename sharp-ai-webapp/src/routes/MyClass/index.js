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
      addName: null,
      addRollNo: null,
      addEmail: null,
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
    this.setState({ students });
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

    //validate email
    if (!validateEmail(obj.studentEmail)) {
      this.showMessage("incorrect email");
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
      this.showMessage("Roll No already exists");
      return;
    }
    if (!em.empty) {
      this.showMessage("Email already exists");
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

    this.addStudent(obj);
  };

  onFileUpload = (e) => {
    let file = e.target.files[0];
    console.log(file);
    Papa.parse(file, {
      complete: (res) => {
        res.data.forEach((student) => {
          console.log(student);
          this.addStudent(student);
        });
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
          <title>MyClass | Fotorama</title>
          <meta
            id="meta-description"
            name="description"
            content="About us. Our Story here @ Fotorama"
          />
          <meta id="og-title" property="og:title" content="Fotorama" />
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
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SaveIcon />}
            style={{ margin: "1rem" }}
            onClick={this.handleSubmit}
          >
            Save
          </Button>
          <Typography
            className={{
              flex: "1 1 100%",
            }}
            variant="h6"
            id="tableTitle"
            component="div"
            style={{ marginTop: 10 }}
          >
            or add a CSV file
          </Typography>
          <Tooltip
            TransitionComponent={Zoom}
            title="Upload csv file"
            aria-label="Upload csv file"
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
