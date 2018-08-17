var spawn = require('child_process').spawn;

const outputFileNamePrefix="[ffmpeg] Destination: ";

function execyoutubedlAsync(videourl,proxyurl){
    console.log(videourl);
    return new Promise(function (resolve, reject) {
        var params=[
            '--extract-audio',
            '--audio-format',
            'mp3',
            '--audio-quality',
            '192K',
            '-o',
            '/downloadedmp3s/'+process.env.PLAYLISTID+'__%(title)s__%(id)s.%(ext)s',
            '--restrict-filenames'
        ]
        if (proxyurl){
            params.push('--proxy');
            params.push(proxyurl);
        }
        params.push(videourl);
    const youtubedlProcess = spawn('youtube-dl',params);

        var outputFileName;
        youtubedlProcess.stdout.on('data', (data) => {
            var line=data.toString();
            
            console.log(line);
            if (line.startsWith(outputFileNamePrefix)){
                outputFileName=line.replace(outputFileNamePrefix,'');
                outputFileName=outputFileName.replace(/(\r\n\t|\n|\r\t)/gm,"");
            }
        });
        var error;
        youtubedlProcess.stderr.on('data', (data) => {
            console.error(`child stderr:\n${data}`);
            error += data.toString();
            
        });
        youtubedlProcess.on('exit', function (code, signal) {
            if (error){
                if (error.includes('The uploader has not made this video available in your country')){
                    return reject({msg:error,countryRestriction:true});
                }
                return reject({msg:error});    
            }
            else{
                resolve(outputFileName);
            }
        });
    });
}


exports.downloadVideoAsync=async function(videoId){
    var videourl='https://www.youtube.com/watch?v='+videoId;
    var downloadedMp3File=await execyoutubedlAsync(videourl);
    return downloadedMp3File;
}