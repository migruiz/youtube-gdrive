var spawn = require('child_process').spawn;


function execyoutubedlAsync(videourl,outputfile){
    return new Promise(function (resolve, reject) {
    const youtubedlProcess = spawn(ffmpegFolder+'youtube-dl'
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
        ffprobe.stdout.on('data', (data) => {
            result += data.toString();
        });
        ffprobe.stderr.on('data', (data) => {
            return reject(err);
        });
        ffprobe.on('exit', function (code, signal) {
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