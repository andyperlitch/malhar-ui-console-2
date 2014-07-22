// Generated on 2014-02-06 using generator-angular 0.7.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

// Get config file
var config = require('./config');

// Update app scripts file
var updateAppScripts = require('./util/update-app-scripts');

// App code, used for jshint and watch
var appCodeFiles = [
  '<%= yeoman.app %>/components/**/!(*_test)+(.js)',
  '<%= yeoman.app %>/pages/**/!(*_test)+(.js)',
  '<%= yeoman.app %>/app.js',
  '<%= yeoman.app %>/app-controller.js'
];

var testCodeFiles = [
  '<%= yeoman.app %>/components/**/*_test.js',
  '<%= yeoman.app %>/pages/**/*_test.js'
];

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-connect-proxy');

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Check for theme option
  var theme = grunt.option('theme') || 'default';

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    
    // Automatically inject Bower components into the app
    'bower-install': {
      app: {
        html: '<%= yeoman.app %>/index.html',
        ignorePath: '<%= yeoman.app %>/',
        // Exclude css files when included with less
        exclude: ['bower_components/bootstrap/dist/css/bootstrap.css']
      },
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    concat: {
      less: {
        src: ['<%= yeoman.app %>/styles/main.less', '<%= yeoman.app %>/styles/themes/<%= less.theme %>.less', '<%= yeoman.app %>/styles/theme-overrides.less'],
        dest: '.tmp/styles/main.less'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        // 'less:dev'
      ],
      test: [
        // 'compass'
      ],
      dist: [
        // 'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: config.web.port,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: config.web.host,
        livereload: 35729
      },
      livereload: {
        options: {
          // open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ],
          middleware: function (connect, options) {
            if (!Array.isArray(options.base)) {
              options.base = [options.base];
            }

            // Setup the proxy
            var middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest];

            // Serve static files
            options.base.forEach(function(base) {
              middlewares.push(connect.static(base));
            });

            // Make directory browse-able
            var directory = options.directory || options.base[options.base.length - 1];
            middlewares.push(connect.directory(directory));

            return middlewares;
          },
          proxies: [
            {
              context: '/ws/v1',
              host: config.gateway.host,
              port: config.gateway.port
            }
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'bower_components/**/*',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= yeoman.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },

    html2js: {
      options: {
        base: 'app'
      },
      dev: {
        options: {
          module: 'templates-main'
        },
        src: [
          '<%= yeoman.app %>/components/{,*/}*.html',
          '<%= yeoman.app %>/pages/{,*/}*.html'
        ],
        dest: '.tmp/templates.js'
      },
      dist: {
        options: {
          module: 'templates-main'
        },
        src: [
          '<%= yeoman.app %>/components/{,*/}*.html',
          '<%= yeoman.app %>/pages/{,*/}*.html'
        ],
        dest: '.tmp/templates.js'
      },
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: appCodeFiles.concat('Gruntfile.js'),
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: testCodeFiles
      }
    },

    // Test settings
    karma: {
      phantomjs: {
        configFile: './test/karma-unit.conf.js',
        autoWatch: false,
        singleRun: true,
        browsers: ['PhantomJS']
      },
      unit: {
        configFile: './test/karma-unit.conf.js',
        autoWatch: false,
        singleRun: true,
        browsers: ['PhantomJS', 'Firefox', 'Safari', 'Chrome']
      },
      coverage: {
        configFile: './test/karma-coverage.conf.js',
        autoWatch: false,
        singleRun: true
      },
      coverage_auto: {
        configFile: './test/karma-coverage.conf.js'
      },
      unit_auto: {
        configFile: './test/karma-unit.conf.js'
      },
      midway: {
        configFile: './test/karma-midway.conf.js',
        autoWatch: false,
        singleRun: true
      },
      midway_auto: {
        configFile: './test/karma-midway.conf.js'
      },
      e2e: {
        configFile: './test/karma-e2e.conf.js',
        autoWatch: false,
        singleRun: true
      },
      e2e_auto: {
        configFile: './test/karma-e2e.conf.js'
      }
    },

    
    // Compile less commands
    less: {
      theme: theme,
      local: {
        options: {
          paths: ['<%= yeoman.app %>/styles', '<%= yeoman.app %>/bower_components'],
          sourceMap: true
        },
        files: {
          '<%= yeoman.app %>/styles/main.css': ['.tmp/styles/main.less']
        }
      },
      dev: {
        options: {
          paths: ['<%= yeoman.app %>/styles'],
          sourceMap: true
        },
        files: {
          '.tmp/styles/main.css': ['.tmp/styles/main.less']
        }
      },
      dist: {
        options: {
          paths: ['<%= yeoman.app %>/styles']
        },
        files: {
          '.tmp/styles/main.css': ['.tmp/styles/main.less']
        }
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: appCodeFiles,
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      // jsTest: {
      //   files: ['test/spec/{,*/}*.js'],
      //   tasks: ['karma']
      // },
      less: {
        files: [
          '<%= yeoman.app %>/styles/*.less',
          '<%= yeoman.app %>/styles/themes/*.less',
          '<%= yeoman.app %>/components/**/*.less',
          '<%= yeoman.app %>/pages/**/*.less'
        ],
        tasks: ['concat:less','less:dev']
      },
      html2js: {
        files: [
          '<%= yeoman.app %>/components/**/*.html',
          '<%= yeoman.app %>/pages/**/*.html'
        ],
        tasks: ['html2js:dev']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/main.css',
          '.tmp/templates.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    }

  });

  
  // Development Server
  grunt.registerTask('serve', function (target) {

    // build and serve
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      // clears out .tmp folder
      'clean:server',

      // concatenates main and theme less files, outputs to .tmp/styles/main.less
      'concat:less',

      // compiles .tmp/styles/main.less, with debug enabled
      'less:dev',

      // converts template files to .tmp/scripts/templates.js, angular.module('templates-main')
      'html2js:dev',

      // COMMENTED OUT UNTIL PROXY CONFIG CAN BE WORKED OUT
      // --------------------------------------------------
      // configures the proxy to ws/v1 calls
      // 'configureProxies:livereload',

      // starts a server on config.web.port, serves proxy, .tmp, and <%= yeoman.app %>
      // 'connect:livereload',
      // --------------------------------------------------
      

      // watches files and performs tasks on changes
      'watch'
    ]);

  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('appscripts', 'Updates index.html with application scripts', function() {
    var done = this.async();
    updateAppScripts(done);
  });

  grunt.registerTask('test', [
    'karma:unit'
  ]);

  grunt.registerTask('travis', [
    'karma:phantomjs'
  ]);

  grunt.registerTask('build', [
    // Remove everything from .tmp folder and dist folder
    'clean:dist',

    // concatenates main and theme less files, outputs to .tmp/styles/main.less
    'concat:less',

    // compiles .tmp/styles/main.less into .tmp/styles/main.css, with debug enabled
    'less:dist',

    // Add vendor prefixes to css properties (.css files in .tmp/styles/)
    'autoprefixer',

    // converts template files to .tmp/scripts/templates.js, angular.module('templates-main')
    'html2js:dist',

    // Prepares usemin blocks
    'useminPrepare',
    'usemin',

    // Compresses images/svg
    'concurrent:dist'

    // 'ngmin',
    // 'copy:dist',
    // 'cdnify',
    // 'cssmin',
    // 'uglify',
    // 'rev',
    
    // 'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
