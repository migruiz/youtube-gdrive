var fs = require('fs');
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;


exports.getPlaylistinfoAsync =async function(playlistId){
    var oauth2Client= await getoauthClientAsync()
    var result= await getPlaylistinfoAsync(oauth2Client,playlistId);
    return simplifyPlaylist(result.items);
}

function simplifyPlaylist(youtubePlaylist){

    var items=[];
    youtubePlaylist.forEach(item => {
      var newItem={
        id:item.snippet.resourceId.videoId,
        position:item.snippet.position,
        title:item.snippet.title
      }
      items.push(newItem);
    });
  return items;
  }


async function getoauthClientAsync() {
    var clientCredentialsFile=await readFileAsync('/googleCredentials/youtube/client_secret.json');
    var credentials=JSON.parse(clientCredentialsFile);
    var tokenFile=await readFileAsync('/googleCredentials/youtube/youtube_credentials.json');
    var token=JSON.parse(tokenFile);

    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
    oauth2Client.credentials = token;
    return oauth2Client;
}

async function readFileAsync(file){
    return new Promise(function (resolve, reject) {
        fs.readFile(file, function (err, response) {
            if (err !== null) return reject(err);
            resolve(response);
        });
    });
}


async function getPlaylistinfoAsync(oauth2Client,playlistId){
    return new Promise(function (resolve, reject) {
        var service = google.youtube('v3');
        service.playlistItems.list({
            auth: oauth2Client,
            part: 'snippet',
            playlistId: playlistId,
            maxResults:50
        }, function (err, response) {
            if (err !== null) return reject(err);
            resolve(response.data);
        });
    });
}


