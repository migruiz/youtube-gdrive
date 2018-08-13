var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "alexa-468e9.appspot.com"
});

var bucket = admin.storage().bucket();

exports.uploadFileAsync =async function(playlistId){
    var filename='./App/vaca.mp3';
    bucket
    .upload(filename, {
        uploadType: "media",
        metadata: {
          contentType: 'audio/mpeg'
        },
      })
      .then(f => {

        f[0].getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
          }).then(signedUrls => {
            console.log(JSON.stringify(signedUrls));
          });

        
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
    // [END storage_upload_file]
}