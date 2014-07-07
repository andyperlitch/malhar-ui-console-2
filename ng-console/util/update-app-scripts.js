'use strict';

var fs = require('fs');
var walk = require('walk');
var walker;
var basedir = process.cwd() + '/app';
var options;
var skipDirectories = ['bower_components', 'scripts'];
var scriptsrcs = [];
var ignorePatterns = [
  /_test\.js$/
];
var indexfile = basedir + '/index.html';
var opentag = 'appscripts';
var closetag = 'endappscripts';
var fillTagsRE = new RegExp('(\\s*)<!-- ' + opentag + ' -->[.\\n\\s\\w<>="\\/-]*<!-- ' + closetag + ' -->');

options = {
  followLinks: false,
  filters: skipDirectories
};

function shouldNotIgnore(file) {
  for (var i = ignorePatterns.length - 1; i >= 0; i--) {
    var pattern = ignorePatterns[i];
    if (pattern.test(file)) {
      return false;
    }
  }
  return true;
}

function fillTags(scripts) {
  var markup = fs.readFileSync(indexfile, 'utf8');
  var scripttags = scripts.map(function(script) {
    return '$1<script src="' + script + '"></script>';
  }).join('');
  var newMarkup = markup.replace(fillTagsRE, '$1<!-- ' + opentag + ' -->' + scripttags + '$1<!-- ' + closetag + ' -->');
  fs.writeFileSync(indexfile, newMarkup);
}

function updateAppScripts(done) {
  walker = walk.walk(basedir, options);

  walker.on('file', function(root, filestats, next) {
    var fullpath = root + '/' + filestats.name;
    var scriptsrc = fullpath.replace(basedir + '/', '');
    if (/\.js$/.test(scriptsrc) && shouldNotIgnore(scriptsrc)) {
      scriptsrcs.push(scriptsrc);
    }
    next();
  });

  walker.on('end', function() {
    scriptsrcs.sort(function(a,b){
      if (a === 'app.js') {
        return -1;
      }
      if (b === 'app.js') {
        return 1;
      }
      return 0;
    }); 
    fillTags(scriptsrcs);
    done();
  });
}

exports = module.exports = updateAppScripts;