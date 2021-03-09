import React from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, authScope, userScope } from "./AuthenticationConfig";
import { getUserDetails, getUserPhoto } from "./GraphService";
// import { Providers, SimpleProvider } from '@microsoft/mgt-react';
import { Providers, SimpleProvider } from "@microsoft/mgt-element";

import axios from "axios";

export default function withAuthProvider(WrappedComponent) {
    return class extends React.Component {
        publicClientApplication;
        accounts;
        loginHint;

        constructor(props) {
            super(props);
            this.state = {
                error: null,
                isAuthenticated: false,
                user: {},
                accounts: {},
                userPhoto: null,
                authChecked: false,
            };
            this.publicClientApplication = new PublicClientApplication(msalConfig);
            this.accounts = this.publicClientApplication.getAllAccounts();
        }

        async componentDidMount() {
            this.loginHint = await this.getCurrentUser();
            // console.log(this.loginHint);
            //console.log('accounts', this.accounts);
            if (this.accounts.length > 0) {
                // console.log("inside if account.Length")
                this.getAccessToken(userScope.scopes).then((result) => {
                    // console.log("result", result);
                    this.getUserProfile(result);
                });
            }
            else if (this.accounts.length === 0) {
                // console.log("inside else account.Length")
                switch (process.env.NODE_ENV) {
                    case "production":
                        let requestPermissionScope = {
                            scopes: authScope.scopes,
                            loginHint: this.loginHint,
                            state: window.location.href,
                        };
                        this.publicClientApplication
                            .ssoSilent(requestPermissionScope)
                            .then(async (result) => {
                                //console.log(result.accessToken);
                                await this.getUserProfile(result.accessToken);
                            })
                            .catch((error) => {
                                console.log(error);
                                console.log(
                                    "silent token acquisition fails. acquiring token using popup"
                                );
                                return this.publicClientApplication
                                    .acquireTokenPopup(requestPermissionScope)
                                    .then(async (tokenResponse) => {
                                        await this.getUserProfile();
                                        return tokenResponse;
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            });
                        break;
                    case "development":
                        this.setState({
                            authChecked: true,
                        });
                        break;
                    default:
                        console.log("default");
                }
            }
        }

        render() {
            const WrappedComponentMarkup =
                this.state.authChecked === true ? (
                    <WrappedComponent
                        error={this.state.error}
                        isAuthenticated={this.state.isAuthenticated}
                        user={this.state.user}
                        login={() => this.login()}
                        logout={() => this.logout()}
                        getAccessToken={(scopes) => this.getAccessToken(scopes)}
                        setError={(message, debug) => this.setErrorMessage(message, debug)}
                        userPhoto={this.state.userPhoto}
                        {...this.props}
                    />
                ) : null;

            return WrappedComponentMarkup;
        }

        async login() {
            try {
                // console.log('authScope', authScope);
                const loginResponse = await this.publicClientApplication.loginPopup(
                    authScope
                );
                await Promise.all([
                    this.getUserProfile(loginResponse.accessToken),
                    this.initializeSimpleProvider(),
                ]);
            } catch (err) {
                this.setState({
                    isAuthenticated: false,
                    user: {},
                    error: this.normalizeError(err),
                });
                this.normalizeError(err);
            }
        }

        logout() {
            this.publicClientApplication.logout();
        }

        async getAccessToken(scopes) {
            let accessRequest = {
                scopes: scopes,
                account: this.accounts[0],
                state: window.location.href,
            };

            try {
                let silentResult;
                if (process.env.NODE_ENV === "production") {
                    // console.log("Inside getAccessToken Prodiction")
                    accessRequest["loginHint"] = this.loginHint;
                    silentResult = await this.publicClientApplication.ssoSilent(
                        accessRequest
                    );
                } else if (process.env.NODE_ENV === "development") {
                    // console.log("Inside getAccessToken Dev")
                    silentResult = await this.publicClientApplication.acquireTokenSilent(
                        accessRequest
                    );
                    // console.log('silentRequest', silentResult);
                }
                return silentResult.accessToken;
            } catch (err) {
                if (this.isInteractionRequired(err)) {
                    var interactiveResult = await this.publicClientApplication.acquireTokenPopup(
                        accessRequest
                    );
                    return interactiveResult.accessToken;
                } else {
                    throw err;
                }
            }
        }
        async getUserProfile(accessToken) {
            try {
                if (accessToken) {
                    await Promise.all([
                        getUserDetails(accessToken),
                        getUserPhoto(accessToken),
                    ]).then((results) => {
                        const user = results[0];
                        const userPhoto = results[1];
                        this.setState(
                            {
                                isAuthenticated: true,
                                authChecked: true,
                                accounts: this.accounts,
                                user: {
                                    userID: user.id,
                                    displayName: user.displayName,
                                    email: user.mail,
                                    userPrincipalName: user.userPrincipalName,
                                    givenName: user.givenName,
                                    jobTitle: user.jobTitle,
                                    mobilePhone: user.mobilePhone,
                                    officeLocation: user.officeLocation,
                                    department: user.department,
                                },
                                userPhoto: userPhoto,
                                error: null,
                            },
                            this.initializeSimpleProvider()
                        );
                    });
                }
            } catch (err) {
                this.setState({
                    isAuthenticated: false,
                    user: {},
                    error: this.normalizeError(err),
                });
            }
        }

        initializeSimpleProvider() {
            let myProvider = new SimpleProvider(async (scopes) => {
                let request = {
                    scopes: scopes,
                    account: this.accounts,
                };
                try {
                    let response = await this.publicClientApplication.acquireTokenSilent(
                        request
                    );
                    return response.accessToken;
                } catch (error) {
                    if (this.isInteractionRequired(error.errorCode)) {
                        this.publicClientApplication.acquireTokenRedirect(request);
                    }
                }
            });

            Providers.globalProvider = myProvider;
        }

        setErrorMessage(message, debug) {
            this.setState({
                error: {
                    message: message,
                    debug: debug,
                },
            });
        }

        normalizeError(error) {
            var normalizedError = {};
            if (typeof error === "string") {
                var errParts = error.split("|");
                normalizedError =
                    errParts.length > 1
                        ? {
                            message: errParts[1],
                            debug: errParts[0],
                        }
                        : {
                            message: error,
                        };
            } else {
                normalizedError = {
                    message: error.message,
                    debug: JSON.stringify(error),
                };
            }
            return normalizedError;
        }

        isInteractionRequired(error) {
            if (!error.message || error.message.length <= 0) {
                return false;
            }

            return (
                error.message.indexOf("consent_required") > -1 ||
                error.message.indexOf("interaction_required") > -1 ||
                error.message.indexOf("login_required") > -1 ||
                error.message.indexOf("no_account_in_silent_request") > -1
            );
        }

        getCurrentUser() {
            let currentUserUrl;
            if (process.env.NODE_ENV === "production") {
                currentUserUrl =
                    "https://resembleae.sharepoint.com/sites/mst/";
            } else if (process.env.NODE_ENV === "development") {
                currentUserUrl = "_api/web/currentUser";
            }
            return new Promise((resolve, reject) => {
                axios.get(`${currentUserUrl}`).then((res) => {
                    //console.log("Usedata", res);
                    resolve(res.data.UserPrincipalName);
                });
            });
            // return 'roshit@resemblesystems.com';
        }
    };
}