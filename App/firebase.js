var admin = require("firebase-admin");
const UUID = require("uuid-v4");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "alexa-468e9.appspot.com"
});

var bucket = admin.storage().bucket();

exports.uploadFileAsync =async function(playlistId){
  let uuid = UUID();
    var filename='./App/vaca.mp3';
    bucket
    .upload(filename, {
        uploadType: "media",
        metadata: {
          contentType: 'audio/mpeg',
          metadata: {
            firebaseStorageDownloadTokens: uuid
          }
        },
      })
      .then(f => {
      var file=f[0];
       console.log("https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid);
        
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
    // [END storage_upload_file]
}