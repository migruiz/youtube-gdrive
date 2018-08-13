var AWS = require("aws-sdk");
process.env.AWS_SDK_LOAD_CONFIG = true;
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var table = "Audio-Player-Multi-Stream";

async function putAsync(params){
    return new Promise(function (resolve, reject) {

        docClient.put(params, function(err, data) {
            if (err !== null) return reject(err);
            resolve(data);
        });
    });

}


exports.updatePlaylistAsync =async function(playlistId,items){
    var id='youtubeplaylists/'+playlistId;
    var params = {
        TableName:table,
        Item:{
            "id":id,
            "items":items
        }
    };
    await putAsync(params);
}

