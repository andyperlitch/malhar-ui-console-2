#!/bin/bash

##
# Script to build and deploy this repo
##

# print commands as they are executed
#set -v

# commands that fail will cause the shell script to exit immediately
set -e

if [ -z $1 ]; then
  echo "Usage: $0 {destination_hostname}"
  exit 1
fi

DEST_HOST=$1

# build
PROD_MODULES=./node_modules.production
mkdir -p $PROD_MODULES
cp package.json $PROD_MODULES
npm install --production --prefix $PROD_MODULES
PHANTOMJS_BIN=node_modules/.bin/phantomjs gulp
DATA_SERVER_HOST="http://${DEST_HOST}:3015" gulp prodenv

PROJECT_NAME=malhar-ui-console
ARTIFACT_BASE=${PROJECT_NAME}-$(date +%Y.%m.%d_%H.%M)
ARTIFACT_FNAME=${ARTIFACT_BASE}.tar.gz

# artifact
mv node_modules node_modules.orig
ln -s $PROD_MODULES/node_modules .
tar -czhf $ARTIFACT_FNAME dist kafka kafkaserver.js config.js dist_start.sh package.json node_modules
rm node_modules
mv node_modules.orig node_modules

# deploy
ssh -t $DEST_HOST "sudo mkdir -p /usr/local/deploy/; sudo chmod 777 /usr/local/deploy;"
scp $ARTIFACT_FNAME $DEST_HOST:
rm $ARTIFACT_FNAME
# extract artifact into deploy dir and move project symlink to point to the new release
ssh $DEST_HOST "cd /usr/local/deploy && mkdir $ARTIFACT_BASE && cd $ARTIFACT_BASE && tar -xzf ~/$ARTIFACT_FNAME && cd .. && rm -f $PROJECT_NAME && ln -s $ARTIFACT_BASE $PROJECT_NAME && rm ~/$ARTIFACT_FNAME"
ssh -t $DEST_HOST "sudo -u hadoop /home/hadoop/repos/core/gateway/src/main/scripts/dtgateway restart"
