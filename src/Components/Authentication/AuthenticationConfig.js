let redirectUri;
if (process.env.NODE_ENV === 'production') {
    redirectUri = 'https://resembleae.sharepoint.com/sites/mst/Pages/OrgChart.aspx';
} else if (process.env.NODE_ENV === 'development') {
    redirectUri = 'http://localhost:3000';
}


export const msalConfig = {
    auth: {
        clientId: '4c7e3af5-a8e5-4daf-98d8-8c8bb23f37b6',
        authority: 'https://login.microsoftonline.com/320d71c1-7b81-48ba-8117-cc2c3c1bb518',
        redirectUri: redirectUri,
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
    },
};

export const authScope = {
    scopes: ['openid', 'profile', 'User.Read'],
    state: window.location.href,
};

export const userScope = {
    scopes: ['User.Read'],
    state: window.location.href,
};