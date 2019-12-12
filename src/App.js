import React, { Component } from "react";
import Firebase from "firebase";
import firestore from "firebase/firestore";

import config from "./config";

import Table from "./components/table/Table";

class App extends Component {
  constructor(props) {
    super(props);

    if (!Firebase.apps.length) {
      // This conditional is a workaround to a codesandbox problem
      // Init Firestore
      Firebase.initializeApp(config);
    }

    // Set volunteerReference
    this.volunteerReference = Firebase.firestore().collection("volunteers");

    // Set rollReference
    this.rollReference = Firebase.firestore().collection("roles");
  }

  state = {
    volunteers: [],
    roles: []
  };

  componentDidMount() {
    this.volunteerReference.onSnapshot(this.volunteerStoreUpdate);
    this.rollReference.onSnapshot(this.rollStoreUpdate);
  }

  volunteerStoreUpdate = querySnapshot => {
    const volunteers = [];

    querySnapshot.forEach(doc => {
      const { firstName, lastName, uid } = doc.data();
      const fullName = firstName + " " + lastName;

      volunteers.push({
        key: doc.id,
        ...doc.data(),
        fullName
      });
    });

    // Set state from object created from store data
    this.setState({
      volunteers
    });
  };

  rollStoreUpdate = querySnapshot => {
    const roles = [];

    querySnapshot.forEach(doc => {
      roles.push({ id: doc.id, ...doc.data() });
    });

    // Set state from object created from store data
    this.setState({
      roles
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    let username = this.refs.username.value;
    let firstName = this.refs.firstname.value;
    let lastName = this.refs.lastname.value;
    let uid = this.refs.uid.value;
    let key = this.refs.key.value;

    if (uid && firstName && lastName) {
      // Existing volunteer
      const volunteers = this.state.volunteers;
      const devIndex = volunteers.findIndex(data => {
        return data.uid === uid;
      });

      // Setup new state values
      volunteers[devIndex].username = username;
      volunteers[devIndex].firstName = firstName;
      volunteers[devIndex].lastName = lastName;

      this.setState({ volunteers });
      this.updateStore(key, { uid, firstName, lastName, username });
    } // New volunteer
    else if (firstName && lastName) {
      const uid = new Date().getTime().toString();
      const { volunteers } = this.state;
      volunteers.push({ uid, firstName, lastName, username });
      this.setState({ volunteers });
      this.addNewToStore({ uid, firstName, lastName, username });
    }

    this.clearVolunteerForm();
  };

  removeVolunteer = volunteer => {
    const { volunteers } = this.state;
    this.deleteFromStore(volunteer.key);
    const newState = volunteers.filter(data => {
      return data.uid !== volunteer.uid;
    });
    this.setState({ volunteers: newState });
  };

  editVolunteer = volunteer => {
    console.log("edit", volunteer);
    this.refs.uid.value = volunteer.uid;
    this.refs.key.value = volunteer.key;
    this.refs.username.value = volunteer.username;
    this.refs.firstname.value = volunteer.firstName;
    this.refs.lastname.value = volunteer.lastName;
    this.refs.username.disabled = true;
  };

  deleteFromStore = id => {
    Firebase.firestore()
      .collection("volunteers")
      .doc(id)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch(error => {
        console.error("Error removing document: ", error);
      });
  };

  addNewToStore = volunteer => {
    this.volunteerReference
      .doc()
      .set({
        username: volunteer.username,
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        uid: volunteer.uid
      })
      .then(() => {
        console.log("Document successfully added!");
      })
      .catch(error => {
        console.error("Error adding document: ", error);
      });
  };

  updateStore = (key, volunteer) => {
    console.log("update");
    Firebase.firestore()
      .collection("volunteers")
      .doc(key)
      .update({
        // username: volunteer.username,
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        uid: volunteer.uid
      })
      .then(() => {
        console.log("Document successfully updated!");
      })
      .catch(error => {
        console.error("Error updating document: ", error);
      });
  };

  clearVolunteerForm = () => {
    this.refs.username.value = "";
    this.refs.firstname.value = "";
    this.refs.lastname.value = "";
    this.refs.uid.value = "";
    this.refs.key.value = "";
    this.refs.username.disabled = false;
  };

  render() {
    const volunteers = this.state.volunteers;
    const roles = this.state.roles;
    console.log("ROLES: ", roles);
    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <h1>Volunteer Team</h1>
            </div>
          </div>
          {
            <Table
              volunteerReference={tbl => {
                this.volunteerTable = tbl;
              }}
              volunteers={volunteers}
              editHandler={this.editVolunteer}
              removeHandler={this.removeVolunteer}
            />
          }
          <div className="row">
            <div>
              <h1>Add Volunteer</h1>
              {/* { <AddVolunteerForm submitHandler={this.handleSubmit} /> } */}
              <form onSubmit={this.handleSubmit}>
                <div className="form-row">
                  <input type="hidden" ref="uid" />
                  <input type="hidden" ref="key" />
                  <div className="form-group col-md-6">
                    <label>First Name</label>
                    <input
                      type="text"
                      ref="firstname"
                      className="form-control"
                      placeholder="First Name"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Last Name</label>
                    <input
                      type="text"
                      ref="lastname"
                      className="form-control"
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Username</label>
                    <input
                      type="text"
                      ref="username"
                      className="form-control"
                      placeholder="Username"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  onClick={this.clearVolunteerForm}
                  className="btn btn-primary"
                >
                  Clear
                </button>
              </form>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
