
import React, { Component } from 'react';

export default class LoginPage extends Component {
    constructor(props) {
        super();
    }
    render() {
        const containerStyle = {
            minHeight: '100vh',
            minWidth: '100vw',
        };
        return (
            <div className="container-fluid">
                <div className="login-container row" style={containerStyle}>
                    <div className="col  d-flex justify-content-center align-items-center">
                        <div className="btn-group" role="group" aria-label="First group">
                            <button type="button" className="btn btn-success btn-sign-in" onClick={this.props.signIn}>
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}