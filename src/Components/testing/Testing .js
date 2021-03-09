import React, { Component } from 'react'
import { Input } from "reactstrap";
import { Providers, ProviderState } from "@microsoft/mgt-element";
import { searchUser } from "./Tservices";
import UserContext from "../Authentication/UserContext";
import _ from "lodash";

export default class Testing extends Component {
    static contextType = UserContext;
    constructor(props) {
        super(props)

        this.state = {
            accessToken: ""

        }
    }

    async componentDidMount() {
        const usersScopes = {
            scopes: ["User.Read.All"],
        };
        Providers.globalProvider.setState(ProviderState.SignedIn);
        const accessToken = await this.context.getAccessToken(usersScopes.scopes);
        // console.log(accessToken)
        this.setState({
            accessToken: accessToken,

        });
    }


    searchHandler = (e) => {

        console.log("search changed", e.target.value);
        searchUser(this.state.accessToken, e.target.value);


    };


    render() {
        // console.log(this.state.accessToken)
        return (
            <div>
                <Input
                    placeholder="Search"
                    onChange={_.debounce(this.searchHandler, 500)}
                />
            </div>
        )
    }
}
