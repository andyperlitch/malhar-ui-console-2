#!/bin/bash

##
# Script to build and deploy this repo
##

# print commands as they are executed
#set -v

# commands that fail will cause the shell script to exit immediately
set -e


if [ "$#" == "0" ]; then
  echo "Usage: $0 host1 host2 ..."
  exit 1
fi

# build
npm install
bower install
gulp
DATA_SERVER_HOST="http://127.0.0.1:3015" gulp prodenv

# node_modules for production
PROD_MODULES=./node_modules.production
mkdir -p $PROD_MODULES
cp package.json $PROD_MODULES
npm install --production --prefix $PROD_MODULES

PROJECT_NAME=malhar-ui-console
ARTIFACT_BASE=${PROJECT_NAME}-$(date +%Y.%m.%d_%H.%M)
ARTIFACT_FNAME=${ARTIFACT_BASE}.tar.gz

# file that contains the deployed revision
REVISION_FILE=REVISION
git log --oneline HEAD^..HEAD > $REVISION_FILE
DIFF=$(git diff)
if [ ! -z "$DIFF" ]; then
  echo "Repo dirty. Diff is below:" >> $REVISION_FILE
  echo "$DIFF" >> $REVISION_FILE
fi

# artifact
mv node_modules node_modules.orig
ln -s $PROD_MODULES/node_modules .
tar -czhf $ARTIFACT_FNAME dist kafka kafkaserver.js config.js dist_start.sh package.json node_modules $REVISION_FILE
rm node_modules
mv node_modules.orig node_modules
rm $REVISION_FILE

while (( "$#" )); do
  DEST_HOST=$1

  # deploy
  scp $ARTIFACT_FNAME hadoop@$DEST_HOST:
  # extract artifact into deploy dir and move project symlink to point to the new release
  ssh -l hadoop $DEST_HOST "cd /usr/local/deploy && mkdir $ARTIFACT_BASE && cd $ARTIFACT_BASE && tar -xzf ~/$ARTIFACT_FNAME && cd .. && rm -f $PROJECT_NAME && ln -s $ARTIFACT_BASE $PROJECT_NAME && rm ~/$ARTIFACT_FNAME"
  ssh -l hadoop -t $DEST_HOST "/home/hadoop/repos/core/gateway/src/main/scripts/dtgateway restart"

  shift
done

rm $ARTIFACT_FNAME
