const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const youtube=require('./youtube.js');
const youtubedl=require('./youtube-dl.js')
const dynamo=require('./dynamo.js');
const firebase=require('./firebase.js')


function simplifyPlaylist(youtubePlaylist){

  var obj={};
  youtubePlaylist.forEach(item => {
    obj[item.snippet.resourceId.videoId]={
      position:item.snippet.position
    };
  });
return obj;
}
function getItemsToDelete(savedItems,currentItems){
  var currentItemsIds = Object.keys(currentItems);
  var savedItemsIds = Object.keys(savedItems)
  var itemsToDelete=[];

  for (let index = 0; index < savedItemsIds.length; index++) {
    const savedItemId = savedItemsIds[index];
    if (!currentItemsIds.includes(savedItemId)){
      itemsToDelete.push(savedItems[savedItemId]);
    }
  }
  return itemsToDelete;
}

(async ()=>{
  var playlistId='PLJLM5RvmYjvxaMig-iCqA9ZrB8_gg6a9g';
  var savedItems=await dynamo.getyoutubePlaylistAsync(playlistId);


  var currentPlayList=await youtube.getPlaylistinfoAsync(playlistId);
  var currentItems=simplifyPlaylist(currentPlayList.items);

  var itemsToDelete=getItemsToDelete(savedItems,currentItems);
  for (let index = 0; index < itemsToDelete.length; index++) {
    const itemToDelete = itemsToDelete[index];
    await firebase.deleteFileAsync(itemToDelete.bucketFileName);
  }

  var currentItemsIds = Object.keys(currentItems);
  for (let index = 0; index < currentItemsIds.length; index++) {
    const currentItemId=currentItemsIds[index];
    const currentItem = currentItems[currentItemId];
    var savedItem=savedItems[currentItemId];
    if (savedItem){
      currentItem.url=savedItem.url;
      currentItem.bucketFileName=savedItem.bucketFileName;
    }
    else{
      //var localFile=await youtubedl.downloadVideoAsync(currentItemId);
      var localFile='./App/vaca.mp3';
      var result= await firebase.uploadFileAsync(localFile);
      currentItem.url=result.downloadurl;
      currentItem.bucketFileName=result.fileName;
    }
  }


  await dynamo.updateyoutubePlaylistAsync(playlistId,currentItems);
  console.log(JSON.stringify(currentItems));
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