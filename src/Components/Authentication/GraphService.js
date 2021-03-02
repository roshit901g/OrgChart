const graph = require("@microsoft/microsoft-graph-client");

function GetAuthenticatedGraphClient(accessToken) {
    const client = graph.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });
    return client;
}

export async function getAllUsers(accessToken, newUrl) {
    if (newUrl) {

        try {
            const client = GetAuthenticatedGraphClient(accessToken);
            const users = await client.api(newUrl).version("beta").get();
            console.log("ac", users);
            //return users.value;
            return users;
        } catch (err) {
            return null;
        }
    }
    else {

        try {
            const client = GetAuthenticatedGraphClient(accessToken);
            const users = await client.api("/users").version("beta").filter("userType eq 'Member'").top(10).get();
            return users;
        } catch (err) {
            return null;
        }
    }
}

export async function getOtherUserPhoto(accessToken, upn) {
    try {
        const client = GetAuthenticatedGraphClient(accessToken);
        const photo = await client
            .api(`users/${upn}/photo/$value`)
            .version("beta")
            .get();
        //console.log('photo', photo);
        const url = window.URL || window.webkitURL;
        const blobUrl = await url.createObjectURL(photo);
        return blobUrl;
    } catch (err) {
        return null;
    }
}

export async function getUserDetails(accessToken) {
    const client = GetAuthenticatedGraphClient(accessToken);
    const user = await client
        .api("/me")
        .select(
            "id,displayName,givenName,mail,department,userPrincipalName,jobTitle,mobilePhone,officeLocation"
        )
        .get();
    return user;
}
export async function getOtherUser(accessToken, email) {
    console.log("email", email);
    const client = GetAuthenticatedGraphClient(accessToken);
    const user = await client.api(`/users/${email}`).version("beta").get();
    return user;
}

export async function getUserPhoto(accessToken) {
    try {
        const client = GetAuthenticatedGraphClient(accessToken);
        const photo = await client.api("/me/photo/$value").version("beta").get();
        const url = window.URL || window.webkitURL;
        const blobUrl = await url.createObjectURL(photo);
        return blobUrl;
    } catch (err) {
        return null;
    }
}

export async function searchUser(accessToken, search) {
    console.log(search);
    if (search) {
        // let url = 'https://graph.microsoft.com/v1.0/users?$count=true&$search="displayName:' + search + '"'
        //console.log(url);
        const client = GetAuthenticatedGraphClient(accessToken);
        const searchuser = await client.api(`/users`).search(`"displayName:${search}"`).get();
        console.log("Search users", searchuser);
        return searchuser;
    }
}