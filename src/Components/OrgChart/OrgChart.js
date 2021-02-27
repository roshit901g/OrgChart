import React, { Component } from "react";
import { Providers, ProviderState } from "@microsoft/mgt-element";
import { Person, PersonCard } from "@microsoft/mgt-react";
import UserContext from "../Authentication/UserContext";
import { getAllUsers } from "../Authentication/GraphService";
import { getOtherUserPhoto } from "../Authentication/GraphService";
import { searchUser } from "../Authentication/GraphService";

import icon from "./Group 5902.png"

import {
    FormGroup,
    InputGroup,
    Input,
    InputGroupAddon,
    InputGroupText,
} from "reactstrap";
import _ from "lodash";
import "./OrgChart.scss";
import ContentLoader from "react-content-loader";

const Card = () => {
    return (
        <PersonCard inheritDetails={true}>
            <div template="additional-details">
                {/* <h3>Stuffed Animal Friends:</h3>
        <ul>
          <li>Giraffe</li>
          <li>lion</li>
          <li>Rabbit</li>
        </ul> */}
            </div>
        </PersonCard>
    );
};

const fullWidth = {
    minWidth: "100%",
};
// const usersScopes = {
//     scopes: ["User.Read.All"],
// };

export default class OrgChart extends Component {
    static contextType = UserContext;
    static usersScopes = {
        scopes: ["User.Read.All"],
    };
    constructor(props) {
        super(props);
        this.state = {
            Users: [],
            filteredUsers: [],
            loading: true,
            order: true,
            departments: [],
            nextUrl: "",
            previousUrl: "",
            firstUrl: "",
            accessToken: "",

        };
    }

    async componentDidMount() {
        const usersScopes = {
            scopes: ["User.Read.All"],
        };
        // this.context.getAccessToken(usersScopes.scopes).then((accessToken) => {
        //     console.log("accessToken", accessToken)
        // });
        // console.log("globalProviders", Providers.globalProvider);
        // console.log("SignedIn", ProviderState.SignedIn);
        // console.log("Scopes", this.usersScopes)
        Providers.globalProvider.setState(ProviderState.SignedIn);

        const accessToken = await this.context.getAccessToken(usersScopes.scopes);
        //console.log("AccessToken in OrgChart", accessToken)
        let allUsers = await getAllUsers(accessToken);
        this.setState({ firstUrl: allUsers["@odata.nextLink"] })
        allUsers = await this.getUserCollectionWithPhoto(accessToken, allUsers);
        console.log("all users", allUsers);
        allUsers = _.orderBy(
            allUsers,
            [(user) => user.displayName.toLowerCase()],
            "asc"
        );
        let departments = _.map(allUsers, (x) => x.department);
        departments = _.filter(_.uniq(departments), (d) => d !== null);
        this.setState({
            Users: allUsers,
            loading: false,
            order: true,
            departments: departments,
            filteredUsers: allUsers,
            //newChanges
            accessToken: accessToken,
        });
    }

    getUserCollectionWithPhoto = async (accessToken, userArray) => {

        console.log("userArray", userArray.value)
        let prevUrl = this.state.nextUrl;
        let userArr = userArray.value;

        if (prevUrl === userArray["@odata.nextLink"]) {
            alert("PrevUrl And userArray['@odata.nextLink'] are same ")
        }

        if (this.state.previousUrl === userArray["@odata.nextLink"]) {
            alert("PreviousUrl And userArray['@odata.nextLink'] are same ")
        }

        if (this.state.nextUrl === userArray["@odata.nextLink"]) {
            alert("nextUrl And userArray['@odata.nextLink'] are same ")
        }
        if (this.state.nextUrl === this.state.previousUrl) {
            alert("nextUrl And this.state.previousUrl are same ")
        }

        if (this.state.firstUrl === userArray["@odata.nextLink"]) {
            alert("youve Reached the end");
        }



        this.setState({ nextUrl: userArray["@odata.nextLink"], previousUrl: prevUrl })

        let userArrayWithPhoto = [];
        let requests = userArr.map((user) => {
            return new Promise((resolve) => {
                getOtherUserPhoto(accessToken, user.userPrincipalName).then(
                    (userPhoto) => {
                        const updatedUser = _.assign(user, { personImage: userPhoto });
                        resolve(userArrayWithPhoto.push(updatedUser));
                    }
                );
            });
        });
        return Promise.all(requests).then((w) => userArrayWithPhoto);
    };

    onSortHandler = () => {
        const usersCopy = [...this.state.filteredUsers];
        const orderedUsers = _.orderBy(
            usersCopy,
            [(user) => user.displayName.toLowerCase()],
            this.state.order === true ? "desc" : "asc"
        );
        this.setState({ filteredUsers: orderedUsers, order: !this.state.order });
    };

    departmentFilterHandler = (e) => {
        console.log("daprtment changed", e.target.value);
        const { Users } = this.state;
        let filteredUsers = _.filter(Users, (d) => {
            if (e.target.value !== "All Departments") {
                return d.department === e.target.value;
            } else if (e.target.value === "All Departments") {
                return Users;
            }
        });
        this.setState({ filteredUsers: filteredUsers });
    };

    searchHandler = (e) => {
        console.log("search changed", e.target.value);
        this.filterItems({ displayName: e.target.value }).then((items) => {
            this.setState({ filteredUsers: items });
        });
    };

    async gotoNext(accessToken, url) {
        let allUsers = await getAllUsers(accessToken, url);
        allUsers = await this.getUserCollectionWithPhoto(accessToken, allUsers);
        console.log("all users", allUsers);
        allUsers = _.orderBy(
            allUsers,
            [(user) => user.displayName.toLowerCase()],
            "asc"
        );
        let departments = _.map(allUsers, (x) => x.department);
        departments = _.filter(_.uniq(departments), (d) => d !== null);
        this.setState({
            Users: allUsers,
            loading: false,
            order: true,
            departments: departments,
            filteredUsers: allUsers,
            //newChanges
            accessToken: accessToken,
            // previousUrl: url
        });
    }

    async gotoPrev(accessToken, url) {
        let allUsers = await getAllUsers(accessToken, url);
        allUsers = await this.getUserCollectionWithPhoto(accessToken, allUsers);
        console.log("all users", allUsers);
        allUsers = _.orderBy(
            allUsers,
            [(user) => user.displayName.toLowerCase()],
            "asc"
        );
        let departments = _.map(allUsers, (x) => x.department);
        departments = _.filter(_.uniq(departments), (d) => d !== null);
        this.setState({
            Users: allUsers,
            loading: false,
            order: true,
            departments: departments,
            filteredUsers: allUsers,
            //newChanges
            accessToken: accessToken,
            //nextUrl: this.state.previousUrl
        });
    }

    async filterItems(requestData) {
        console.log(typeof (requestData));
        console.log(requestData.length);

        if (requestData) {
            console.log("requestData", requestData.displayName);
            let result = [];
            let allUsers = await searchUser(this.state.accessToken, requestData.displayName);
            allUsers = await this.getUserCollectionWithPhoto(this.state.accessToken, allUsers);
            // console.log("searchRes", allUsers);

            for (let item of allUsers) {
                if (
                    item.displayName
                        .toLowerCase()
                        .indexOf(requestData.displayName.toLowerCase()) > -1
                ) {
                    result.push(item);
                }
            }

            // for (let item of this.state.Users) {
            //     if (
            //         item.displayName
            //             .toLowerCase()
            //             .indexOf(requestData.displayName.toLowerCase()) > -1
            //     ) {
            //         result.push(item);
            //     }
            // }
            return Promise.resolve(result);
        }
        else {

            return Promise.resolve(this.state.Users);

        }

    }

    render() {
        const { filteredUsers } = this.state;
        const { departments } = this.state;
        // console.log("nextLink", this.state.nextUrl)
        // console.log("PrevLink", this.state.previousUrl)
        if (this.state.previousUrl === this.state.nextUrl) {
            console.log("same in Render");
        }
        else {
            console.log("Different in Render");
        }

        let userListMarkup = filteredUsers.map((user) => {
            return (
                <div className="user-list-container p-4" key={user.id}>
                    <Person
                        personDetails={user}
                        view={5}
                        line2Property="jobTitle"
                        line3Property="department"
                        avatarSize="large"
                        personImage={user.personImage}
                        personCardInteraction={2}
                    >
                        <Card template="person-card"></Card>
                    </Person>
                </div>
            );
        });
        if (filteredUsers.length === 0) userListMarkup = <p>No results found</p>;
        return (
            <>
                <div className="row p-4 orgchart-title-wrapper m-0 mb-3">
                    <div className="d-flex  align-items-center " style={fullWidth}>
                        {/* <span className="fa fa-newspaper" style={{ color: "#94c42b" }}></span> */}
                        <img src={icon} />
                        <span className="webpart-title-text">Directory</span>
                    </div>
                </div>
                <div className="orgchart-container p-5 ">
                    <div className="d-flex pl-4 pr-auto justify-content-center align-items-center user-list-title-container">
                        <span className="user-list-heading">Users List</span>
                        <span
                            className="fa fa-sort ml-2 mt-1"
                            onClick={this.onSortHandler}
                            style={{ color: "#495866" }}
                        ></span>
                        <div className="ml-auto ">
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                        <span className="fa fa-search"></span>
                                    </InputGroupText>
                                </InputGroupAddon>
                                <Input
                                    placeholder="Search"
                                    onChange={_.debounce(this.searchHandler, 300)}
                                />
                            </InputGroup>
                        </div>
                        <div className="department-filter-container mt-3">
                            <FormGroup>
                                <Input
                                    type="select"
                                    name="select"
                                    id="exampleSelect"
                                    onChange={this.departmentFilterHandler}
                                >
                                    <option>All Departments</option>
                                    {departments.map((department) => {
                                        return <option key={department}>{department}</option>;
                                    })}
                                </Input>
                            </FormGroup>
                        </div>
                    </div>

                    {this.state.loading === false ? userListMarkup : <ContentLoader />}
                    <div className="pagenationDiv">
                        <center>
                            <button className="pagenationBtn" onClick={() => { this.gotoPrev(this.state.accessToken, this.state.previousUrl) }}>&lt;&lt;</button>
                            <button className="pagenationBtn" onClick={() => { this.gotoNext(this.state.accessToken, this.state.nextUrl) }} >&gt;&gt;</button>
                        </center>
                    </div>
                </div>
            </>
        );
    }
}