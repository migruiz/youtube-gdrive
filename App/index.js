const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const youtube=require('./youtube.js');
const dynamo=require('./dynamo.js');


function simplifyPlaylist(youtubePlaylist){
  var playListSimplied=youtubePlaylist.map(item =>{ 
    return {
      id:item.snippet.resourceId.videoId,
      position:item.snippet.position
    };
 });
 return playListSimplied;
}
function getItemsToDelete(savedItems,currentItems){
  var currentItemsIds = currentItems.map(a => a.id);
  var itemsToDelete=[];
  savedItems.forEach(savedItem => {
    if (!currentItemsIds.includes(savedItem.id)){
        itemsToDelete.push(savedItem.id);
    }
  });
  return itemsToDelete;
}
function getItemsToDownload(savedItems,currentItems){
  var savedItemsIds = savedItems.map(a => a.id);
  var itemsToDownload=[];
  currentItems.forEach(curretItem => {
    if (!savedItemsIds.includes(curretItem.id)){
      itemsToDownload.push(curretItem.id);
    }
  });
  return itemsToDownload;
}

(async ()=>{
  var playlistId='PLJLM5RvmYjvxaMig-iCqA9ZrB8_gg6a9g';


  var savedPlayList=await dynamo.getPlaylistAsync(playlistId);
  var savedPlayListSimp=simplifyPlaylist(savedPlayList);


  var currentPlayList=await youtube.getPlaylistinfoAsync(playlistId);
  var currentPlayListSimp=simplifyPlaylist(currentPlayList.items);

  var itemsToDelete=getItemsToDelete(savedPlayListSimp,currentPlayListSimp);
  var itemsToDownload=getItemsToDownload(savedPlayListSimp,currentPlayListSimp);

  await dynamo.updatePlaylistAsync(playlistId,currentPlayList.items);
  console.log(JSON.stringify(currentPlayListSimp));
})();
return;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'security/token.json';

// Load client secrets from a local file.
fs.readFile('security/credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}


/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {

    const drive = google.drive({version: 'v3', auth});
    var folderId='1C4s4Tk2q8ftTODsG4gEn83OmHFtMWTWl';
    var fileMetadata = {
        'name': 'vaca.mp3',
        parents: [folderId]
      };
      var media = {
        mimeType: 'audio/mpeg',
        body: fs.createReadStream('files/vaca.mp3')
      };
      
      drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      }, function (err, file) {
        if (err) {
          // Handle error
          console.error(err);
        } else {
          console.log('File Id: ', file.data.id);
          drive.permissions.create({
            fileId: file.data.id,
            resource:{
                role:"reader",
                type:"anyone"
            }}, function(err,result){
              if(err) console.log(err) 
              else console.log("file is public now")
          });
        }
      });







  
}