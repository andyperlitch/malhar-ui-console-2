#!/bin/bash
# Known Issues:
#   Error: SELF_SIGNED_CERT_IN_CHAIN  
#   Workaround: npm config set ca ""
#
rm -rf dist 2>/dev/null
npm install . && bower install && gulp
exit $?
