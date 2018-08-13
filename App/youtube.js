var fs = require('fs');


async function getoauthClientAsync() {
    var clientCredentialsFile=await fs.readFile('client_secret.json');
    var credentials=JSON.parse(content);
    var tokenFile=await fs.readFile(TOKEN_PATH);
    var token=JSON.parse(tokenFile);

    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
    oauth2Client.credentials = token;
    return oauth2Client;
}

async function getPlaylistinfoAsync(oauth2Client){
    return new Promise(function (resolve, reject) {
        var service = google.youtube('v3');
        service.playlistItems.list({
            auth: auth,
            part: 'snippet',
            playlistId: playlistId
        }, function (err, response) {
            if (err !== null) return reject(err);
            resolve(response.data);
        });
    });
}

var oauth2Client= await getoauthClientAsync()
var result= await getPlaylistinfoAsync();

