FROM node:8.11.3-alpine
ENV EDGE_REPOSITORY=http://dl-cdn.alpinelinux.org/alpine/edge/main
RUN apk update --repository $EDGE_REPOSITORY \
	&& apk add py-pip ca-certificates nano\
	&& apk add ffmpeg --repository $EDGE_REPOSITORY \
	&& rm -rf /var/cache/apk/*
RUN pip install 'youtube-dl==2018.9.10'


RUN mkdir /App/
COPY App/package.json  /App/package.json

RUN cd /App \
&& npm  install 

COPY App /App

VOLUME /googleCredentials
VOLUME /root/.aws

ENTRYPOINT ["node","/App/app.js"]