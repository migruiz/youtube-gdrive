var admin = require("firebase-admin");
const UUID = require("uuid-v4");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "alexa-468e9.appspot.com"
});

var bucket = admin.storage().bucket();

exports.deleteFileAsync=async function(filename){
  await bucket.file(filename).delete();
}

exports.uploadFileAsync =async function(localFile){
  let uuid = UUID();
   var uploadResult=await bucket.upload(localFile, {
       uploadType: "media",
       metadata: {
         contentType: 'audio/mpeg',
         metadata: {
           firebaseStorageDownloadTokens: uuid
         }
       },
     });
    var gFile=uploadResult[0];
    var downloadurl="https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(gFile.name) + "?alt=media&token=" + uuid
    return {downloadurl:downloadurl,fileName:gFile.name};
}