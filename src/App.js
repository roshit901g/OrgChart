import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import OrgChart from "./Components/OrgChart/OrgChart"
import withAuthProvider from './Components/Authentication/AuthProvider';
import LoginPage from './Components/Authentication/LoginPage';
import { UserProvider } from './Components/Authentication/UserContext';
import Testing from "./Components/testing/Testing "

class App extends Component {
  constructor(props) {
    super();
  }
  render() {

    const userContext = this.props;
    return (
      <div className="App">
        {this.props.isAuthenticated === true ? (
          <UserProvider value={userContext}>
            <OrgChart></OrgChart>
            {/* <Testing></Testing> */}

          </UserProvider>
        ) : (
            <LoginPage signIn={this.props.login}></LoginPage>
          )}
      </div>
    );
  }
}

export default withAuthProvider(App);