var spawn = require('child_process').spawn;


function execyoutubedlAsync(videourl,outputfile){
    return new Promise(function (resolve, reject) {
    const youtubedlProcess = spawn('youtube-dl'
            , [
                '--extract-audio',
                '--audio-format',
                'mp3',
                '--audio-quality',
                '192K',
                '-o',
                '/downloadedmp3s/%(id)s.%(ext)s',
                '--restrict-filenames',
                videourl,
            ]);

        
        youtubedlProcess.stdout.on('data', (data) => {
            console.log(data.toString());
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
                resolve();
            }
        });
    });
}


exports.downloadVideoAsync=async function(videoId){
    var videourl='https://www.youtube.com/watch?v='+videoId;
    await execyoutubedlAsync(videourl);
    var downloadedMp3File='/downloadedmp3s/'+videoId+'.mp3';
    return downloadedMp3File;
}