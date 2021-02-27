const graph = require("@microsoft/microsoft-graph-client");

function GetAuthenticatedGraphClient(accessToken) {
    const client = graph.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });
    return client;
}

export async function searchUser(accessToken, search) {

    if (search) {
        // let url = 'https://graph.microsoft.com/v1.0/users?$count=true&$search="displayName:' + search + '"'
        //console.log(url);
        const client = GetAuthenticatedGraphClient(accessToken);
        const searchuser = await client.api(`/users`).search(`"displayName:${search}"`).get();
        console.log("Search users", searchuser);
        return searchuser;
    }
}