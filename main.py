from __future__ import unicode_literals
import youtube_dl
import subprocess
import os

class MyLogger(object):
    def debug(self, msg):
        print(msg)

    def warning(self, msg):
        print(msg)

    def error(self, msg):
        print(msg)


def my_hook(d):
    if d['status'] == 'finished':
        print('Done downloading, now converting ...')



def hello_world(request):
    
    ydl_opts = {
    'format': 'bestaudio/best',
    'logger': MyLogger(),
    'progress_hooks': [my_hook],
    'outtmpl':'/tmp/input.ext',
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download(['https://www.youtube.com/watch?v=Vj29Ot8a0bw'])
    
    print(subprocess.run(['/user_code/ffmpeg','-y','-i','file:/tmp/input.ext','-vn','-acodec','libmp3lame','-q:a','5','file:/tmp/output.mp3'], stdout=subprocess.PIPE).stdout.decode('utf-8'))
    print(subprocess.run(['ls','/tmp','-lh'], stdout=subprocess.PIPE).stdout.decode('utf-8'))
    return '888889'
