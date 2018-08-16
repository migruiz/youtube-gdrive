const dropboxV2Api = require('dropbox-v2-api');
// create session ref:
const dropbox = dropboxV2Api.authenticate({
});




async function checkJobStatusAsync(async_job_id){
    return new Promise(function (resolve, reject) {


        dropbox({
            resource: 'files/save_url/check_job_status',
            parameters: {
                "async_job_id": async_job_id
            }
        }, (err, result, response) => {

            if (err !== null) return reject(JSON.stringify(err));
            resolve(result);
    
        });
    });
}



async function deleteAsync(path){
    return new Promise(function (resolve, reject) {



        dropbox({
            resource: 'files/delete',
            parameters: {
                "path": path
            }
        }, (err, result, response) => {


            if (err !== null) return reject(JSON.stringify(err));
            var asyncJobId=result.async_job_id;
            resolve(asyncJobId);
        });



    });
}




async function saveUrlAsync(path,url){
    return new Promise(function (resolve, reject) {



        dropbox({
            resource: 'files/save_url',
            parameters: {
                "path": path,
                 "url": url
            }
        }, (err, result, response) => {


            if (err !== null) return reject(JSON.stringify(err));
            var asyncJobId=result.async_job_id;
            resolve(asyncJobId);
        });



    });
}


async function createShareLinkAsync(path){
    return new Promise(function (resolve, reject) {



        dropbox({
            resource: 'sharing/create_shared_link_with_settings',
            parameters: {
                "path": path
            }
        }, (err, result, response) => {


            if (err !== null) return reject(JSON.stringify(err));
            resolve(result);
        });



    });
}



async function waitForResultAsync(jobId){
    var result=await checkJobStatusAsync(jobId);
    var tag=result[".tag"];
    if (tag==="in_progress"){
        return await waitForResultAsync(jobId);
    }else if (tag==="failed"){
       throw new Error(result.failed[".tag"]);
    }
    else if (tag==="complete"){
        return result.id;
    }
}

exports.uploadToDropbox=async function(fileName,url){

    var path='/'+fileName;
    await deleteAsync(path);
var jobId=await saveUrlAsync(path,url);
var fileId=await waitForResultAsync(jobId);
var sharedLink=await createShareLinkAsync(path);
var dropboxUrl=sharedLink.url;
var directDownloadLink=dropboxUrl.replace('dl=0','dl=1');
return directDownloadLink;
}