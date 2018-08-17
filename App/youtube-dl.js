var spawn = require('child_process').spawn;

const outputFileNamePrefix="[ffmpeg] Destination: ";

function execyoutubedlAsync(videourl){
    console.log(videourl);
    return new Promise(function (resolve, reject) {
    const youtubedlProcess = spawn('youtube-dl'
            , [
                '--extract-audio',
                '--audio-format',
                'mp3',
                '--audio-quality',
                '192K',
                '-o',
                '/downloadedmp3s/'+process.env.PLAYLISTID+'__%(title)s__%(id)s.%(ext)s',
                '--restrict-filenames',
                videourl,
            ]);

        var outputFileName;
        youtubedlProcess.stdout.on('data', (data) => {
            var line=data.toString();
            
            console.log(line);
            if (line.startsWith(outputFileNamePrefix)){
                outputFileName=line.replace(outputFileNamePrefix,'');
                outputFileName=outputFileName.replace(/(\r\n\t|\n|\r\t)/gm,"");
            }
        });
        var error=null;
        youtubedlProcess.stderr.on('data', (data) => {
            console.error(`child stderr:\n${data}`);
            error += data.toString();
            
        });
        youtubedlProcess.on('exit', function (code, signal) {
            if (error){
                return reject(error);    
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