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

# build prereqs
npm install
bower install

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



# build per dest host because client.settings.js needs to be different per host (for now)
while (( "$#" )); do
  DEST_HOST=$1

  # build and set up client.settings.js for the host we are deploying to
  gulp
  DATA_SERVER_HOST="http://${DEST_HOST}:3015" gulp prodenv

  # move original node_modules, link production node_modules around
  mv node_modules node_modules.orig
  ln -s $PROD_MODULES/node_modules .

  # build tarball
  tar -czhf $ARTIFACT_FNAME dist kafka kafkaserver.js config.js dist_start.sh package.json node_modules $REVISION_FILE

  # put original node_modules back
  rm node_modules
  mv node_modules.orig node_modules

  # deploy
  scp $ARTIFACT_FNAME hadoop@$DEST_HOST:
  # extract tarball into deploy dir and move project symlink to point to the new release
  ssh -l hadoop $DEST_HOST "cd /usr/local/deploy && mkdir $ARTIFACT_BASE && cd $ARTIFACT_BASE && tar -xzf ~/$ARTIFACT_FNAME && cd .. && rm -f $PROJECT_NAME && ln -s $ARTIFACT_BASE $PROJECT_NAME && rm ~/$ARTIFACT_FNAME"
  # restart gateway
  ssh -l hadoop -t $DEST_HOST "/home/hadoop/repos/core/gateway/src/main/scripts/dtgateway restart"

  # next host
  shift
done

# clean up and put things back how they were
rm $REVISION_FILE
rm $ARTIFACT_FNAME
rm -rf $PROD_MODULES
