/*                                    
 *  ===========================
 *     _   _  _   _   _
 *    |_˩ |_ |_˩ | | |_˩ |\ |
 *    | \ |_ |_˥ |_| | \ | \|
 *
 *      -- CREATIVE LAB --
 *
 *  ===========================
 *
 *
 *  Project: Reborn blank
 *  Version: 0.1.1
 *  Last change: 16/03/2014
 *
 */
'use strict';
module.exports = function(grunt) {
  /**
   *
   *   Load nodejs modules
   *
   */
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);
  // Define the configuration for all the tasks
  grunt.initConfig({
    /**
     *
     * Project settings
     *
     */
    globalDir: {
      // DESC: Configurable paths
      dev: 'dev',
      prod: 'prod'
    },
    /**
     *
     *   HTML
     *
     */
    // DESC: minifies html
    htmlmin: {
      dev: {
        options: {
          // collapseBooleanAttributes: true,
          // collapseWhitespace: true,
          // removeAttributeQuotes: true,
          // removeCommentsFromCDATA: true,
          // removeEmptyAttributes: true,
          // removeOptionalTags: true,
          // removeRedundantAttributes: true,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%= globalDir.prod %>',
          src: '{,*/}*.html',
          dest: '<%= globalDir.prod %>'
        }]
      }
    },
    // DESC: includes partials
    htmlbuild: {
      options: {
        sections: {
          header: '<%= globalDir.dev %>/partials/header.html',
          footer: '<%= globalDir.dev %>/partials/footer.html'
        }
      },
      dev: {
        src: '<%= globalDir.dev %>/layouts/*.html',
        dest: '<%= globalDir.dev %>/'
      }
    },
    /**
     *
     *   CSS
     *
     */
    sass: {
      dev: {
        options: {
          sourceComments: 'map'
        },
        files: {
          '<%= globalDir.dev %>/css/main.css': '<%= globalDir.dev %>/sass/main.scss'
        }
      },
      prod: {
        options: {
          sourceComments: 'none',
          outputStyle: 'compressed'
        },
        files: {
          '<%= globalDir.prod %>/css/main.css': '<%= globalDir.dev %>/sass/main.scss'
        }
      }
    },
    /**
     *
     *   Javascript
     *
     */
    // DESC: Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        force: true
      },
      all: ['Gruntfile.js', '<%= globalDir.dev %>/scripts/{,*/}*.js', '!<%= globalDir.dev %>/scripts/vendor/*', 'test/spec/{,*/}*.js']
    },
    /**
     *
     *   Images
     *
     */
    // DESC: The following *-min tasks produce minified files in the dev folder
    imagemin: {
      dev: {
        files: [{
          expand: true,
          cwd: '<%= globalDir.dev %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= globalDir.prod %>/images'
        }]
      }
    },
    svgmin: {
      dev: {
        files: [{
          expand: true,
          cwd: '<%= globalDir.dev %>/images',
          src: '{,*/}*.svg',
          dest: '<%= globalDir.prod %>/images'
        }]
      }
    },
    // DESC: to make sprites run 'grunt sprite'
    sprite: {
      dev: {
        src: '<%= globalDir.dev %>/images/sprites/*.png',
        destImg: '<%= globalDir.dev %>/images/spritesheet.png',
        destCSS: '<%= globalDir.dev %>/sass/ui/_sprites.scss',
        padding: 2,
        'algorithm': 'binary-tree',
        'cssFormat': 'scss',
        'cssVarMap': function(sprite) { //mapuje nazwy zmiennych w .scss
          sprite.name = 'sprite-' + sprite.name;
        },
        'cssTemplate': 'sprites.mustache',
        'cssOpts': {
          'cssClass': function(item) {
            return '.icon-' + item.name;
          }
        }
      }
    },
    /**
     *
     *   Vendor libraries
     *
     */
    // DESC: Automatically inject Bower components into the HTML file
    'bower-install': {
      dev: {
        html: '<%= globalDir.dev %>/index.html',
        ignorePath: '<%= globalDir.dev %>/'
      }
    },
    /**
     *
     *   Other
     *
     */
    // DESC: Reads HTML for usemin blocks to enable smart builds that automatically concat, minify and revision files. Creates configurations in memory so additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%= globalDir.prod %>'
      },
      html: '<%= globalDir.dev %>/index.html'
    },
    // DESC: Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: ['<%= globalDir.prod %>']
      },
      html: ['<%= globalDir.prod %>/{,*/}*.html'],
      css: ['<%= globalDir.prod %>/css/{,*/}*.css']
    },
    // DESC: Renames files for browser caching purposes
    rev: {
      dev: {
        files: {
          src: ['<%= globalDir.prod %>/scripts/{,*/}*.js', '<%= globalDir.prod %>/css/{,*/}*.css', '<%= globalDir.prod %>/images/{,*/}*.{gif,jpeg,jpg,png,webp}', '<%= globalDir.prod %>/sass/fonts/{,*/}*.*']
        }
      }
    },
    // DESC: Copies remaining files to places other tasks can use
    copy: {
      prod: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= globalDir.dev %>',
          dest: '<%= globalDir.prod %>',
          src: ['*.{ico,png,txt}', '.htaccess', 'images/{,*/}*.webp', '*.html', '_fonts/{,*/}*.*']
        }]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%= globalDir.dev %>/sass',
        dest: '.tmp/css/',
        src: '{,*/}*.css'
      }
    },
    replace: {
      html: {
        src: ['<%= globalDir.prod %>/*.html'], // source files array (supports minimatch)
        dest: '<%= globalDir.prod %>/', // destination directory or file
        replacements: [{
          from: '../', // string replacement
          to: ''
        }]
      },
      css: {
        src: ['<%= globalDir.prod %>/css/*.css'], // source files array (supports minimatch)
        dest: '<%= globalDir.prod %>/css/', // destination directory or file
        replacements: [{
          from: '../../', // string replacement
          to: '../'
        }]
      },
      js: {
        src: ['<%= globalDir.prod %>/scripts/*.js'], // source files array (supports minimatch)
        dest: '<%= globalDir.prod %>/scripts/', // destination directory or file
        replacements: [{
          from: '../', // string replacement
          to: ''
        }]
      }
    },
    /**
     *
     *   Production building
     *
     */
    // DESC: Run some tasks in parallel to speed up build process
    concurrent: {
      dev: ['htmlbuild:dev', 'sass:dev'],
      test: ['copy:styles'],
      prod: ['copy:prod', 'sass:prod', 'imagemin', 'svgmin'],
      postProd: ['replace:html', 'replace:css', 'replace:js']
    },
    /**
     *
     *   Local prod
     *
     */
    // DESC: Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= globalDir.dev %>/scripts/{,*/}*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      jstest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['test:watch']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      // FIXME: increase sass compilation performace without setting spawn: false
      sass: {
        files: ['<%= globalDir.dev %>/sass/**/*.scss'],
        tasks: ['sass:dev'],
        options: {
          livereload: true
        }
      },
      html: {
        files: ['<%= globalDir.dev %>/layouts/*.html', '<%= globalDir.dev %>/partials/*.html'],
        tasks: ['htmlbuild:dev'],
        options: {
          livereload: true
        }
      },
      sprites: {
        files: ['<%= globalDir.dev %>/images/sprites/*.png'],
        tasks: ['sprite:dev', 'sass:dev'],
        options: {
          livereload: true
        }
      }
    },
    // DESC: The actual grunt prod settings
    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        // Change this to '0.0.0.0' to access the prod from outside
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          open: 'http://localhost:<%= connect.options.port %>',
          base: ['.tmp', '<%= globalDir.dev %>']
        }
      },
      test: {
        options: {
          port: 9001,
          base: ['.tmp', 'test', '<%= globalDir.dev %>']
        }
      },
      dev: {
        options: {
          open: true,
          base: '<%= globalDir.prod %>',
          livereload: false
        }
      }
    },
    // DESC: Empties folders to start fresh
    clean: {
      prod: {
        files: [{
          dot: true,
          src: ['.tmp', '<%= globalDir.prod %>/*', '!<%= globalDir.prod %>/.git*']
        }]
      },
      dev: '.tmp'
    }
  }); // grunt task end
  /**
   *
   *   Grunt registered tasks
   *
   */
  // DESC: grunt serve
  grunt.registerTask('serve', function(target) {
    if (target === 'dev') {
      return grunt.task.run(['build', 'connect:dev:keepalive']);
    }
    grunt.task.run(['clean:dev', 'concurrent:dev', 'connect:livereload', 'watch']);
  });
  // DESC: grunt test
  grunt.registerTask('test', function(target) {
    if (target !== 'watch') {
      grunt.task.run(['clean:dev', 'concurrent:test', ]);
    }
    grunt.task.run(['connect:test', 'mocha']);
  });
  // DESC: grunt build
  grunt.registerTask('build', ['clean:dev', 'htmlbuild:dev', 'useminPrepare', 'concurrent:prod', 'concat', 'cssmin', 'uglify', 'usemin', 'concurrent:postProd']);
  // DESC: grunt default task
  grunt.registerTask('default', ['newer:jshint', 'test', 'build']);
};