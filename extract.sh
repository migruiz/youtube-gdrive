youtube-dl --download-archive downloaded.txt --no-overwrites -ic --yes-playlist -o '%(title)s.%(ext)s' --restrict-filenames  --extract-audio --audio
-format mp3 --audio-quality 0 --socket-timeout 5 https://www.youtube.com/playlist?list=PLJLM5RvmYjvxaMig-iCqA9ZrB8_gg6a9g


docker run -it --rm -v "/home/pi/gdrive:/App/security" -v "/home/pi/files:/App/files" migruiz/youtube-gdrive
