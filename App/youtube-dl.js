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

        var result = '';
        youtubedlProcess.stdout.on('data', (data) => {
            console.log(data);
            result += data.toString();
        });
        youtubedlProcess.stderr.on('data', (data) => {
            console.log(data);
            return reject(data);
        });
        youtubedlProcess.on('exit', function (code, signal) {
            resolve();
        });
    });
}


exports.downloadVideoAsync=async function(videoId){
    var videourl='https://www.youtube.com/watch?v='+videoId;
    await execyoutubedlAsync(videourl);
    var downloadedMp3File='/downloadedmp3s/'+videoId+'.mp3';
    return downloadedMp3File;
}