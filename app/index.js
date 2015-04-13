'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var RebornGenerator = yeoman.generators.Base.extend({
  init: function() {
    this.pkg = require('../package.json');
  },
  askFor: function() {
    var done = this.async();

    // have Yeoman greet the user
    this.log(this.yeoman);

    // welcome message
    this.log('Welcome to ' + chalk.underline('REBORN') + ' custom website generator!');

    // settings prompts
    var prompts = [{
      type: 'confirm',
      name: 'includeAngular',
      message: 'Do you want to build Angular app?',
      default: true,
    }, {
      type: 'confirm',
      name: 'includeResponsive',
      message: 'Would you like to build responsive site?'
    }, {
      when: function(props) {
        return props.includeResponsive;
      },
      type: 'list',
      name: 'frameworkType',
      message: 'What framework would you like to install?',
      choices: ['Bootstrap', 'Foundation']
    }, {
      type: 'checkbox',
      name: 'otherIncludes',
      message: 'What other features do you want include?',
      choices: ['styleguide', 'tests']
    }];

    this.prompt(prompts, function(props) {

      // Angular app
      this.includeAngular = props.includeAngular;

      // Responsive framework
      this.includeResponsive = props.includeResponsive;
      this.frameworkType = props.frameworkType;

      // Other included
      this.otherIncludes = props.otherIncludes;

      done();
    }.bind(this));

  },

  installDevDep: function() {
    this.copy('Gruntfile.js', 'Gruntfile.js');
    this.copy('_package.json', 'package.json');
    this.copy('_.bowerrc', '.bowerrc');
    this.copy('_bower.json', 'bower.json');
  },

  copyDefaults: function() {

    // make new dirs
    this.mkdir('dev');
    this.mkdir('dev/images/sprites');
    this.mkdir('dev/sass/components');

    // files
    this.copy('404.html', 'dev/404.html');
    this.copy('favicon.ico', 'dev/favicon.ico');
    this.copy('robots.txt', 'dev/robots.txt');
    this.copy('sprites.mustache', 'sprites.mustache');

    // directories
    this.directory('layouts', 'dev/layouts');
    this.directory('partials', 'dev/partials');
    this.directory('pages', 'dev/pages');
    this.directory('_fonts', 'dev/_fonts');
    this.directory('sass', 'dev/sass');
    this.directory('images', 'dev/images');

    // Include Angular
    if (this.includeAngular) {
      this.directory('app', 'dev/app');
    } else {
      this.directory('scripts', 'dev/scripts');
    }

    // Include unit test
    if (this.otherIncludes.indexOf('tests') !== -1) {
      this.directory('test', 'dev/test');
    }

    // Include styleguide
    if (this.otherIncludes.indexOf('styleguide') !== -1) {
      this.directory('styleguide', 'dev/styleguide');
    }
  },

  projectfiles: function() {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
  },

  install: function() {

    // context
    var _self = this;

    var packages = {
      bootstrap: 'bootstrap-sass',
      foundation: 'foundation'
    };

    var staticGridDeps = ['bourbon'];
    var responsiveGridDeps = [];

    /**
     * Replace Sass dependecies according to responsive
     */
    var replaceSCSSDeps = function() {
      fs.readFile('dev/sass/main.scss', 'utf-8', function(err, data) {

        var newValue;

        if (err) throw err;

        newValue = data.replace('// FRAMEWORK REPLACE', function() {

          if (!_self.includeResponsive) {
            return '@import "../assets/bourbon/app/assets/stylesheets/bourbon";\n@import "base/grid";';
          } else {
            return '// Include ' + _self.frameworkType + '\n@import "vendor/' + _self.frameworkType.toLowerCase() + '";';
          }

        });

        fs.writeFile('dev/sass/main.scss', newValue, 'utf-8', function(err) {
          if (err) throw err;
        });

      });
    };

    /**
     * Replace javascript dependencies according to 'Angular app mode'
     */
    var replaceJSDeps = function() {
      fs.readFile('dev/partials/footer.hbs', 'utf-8', function(err, data) {

        var newValue;

        if (err) throw err;

        newValue = data.replace('<script src="../assets/jquery/jquery.js"></script>', '<script src="../assets/jquery/jquery.js"></script>\n\n<script src="../assets/angular/angular.js"></script>');
        newValue = newValue.replace('<script src="../scripts/main.js"></script>', '<script src="../app/app.js"></script>');

        fs.writeFile('dev/partials/footer.hbs', newValue, 'utf-8', function(err) {
          if (err) throw err;
        });

      });
    };

    var framework;

    // If no responsive included copy default grid
    if (!this.includeResponsive) {

      if (this.includeAngular) {
        staticGridDeps[1] = 'angular';
      }

      // Make empty vendor folder for further includes
      this.mkdir('dev/sass/vendor');
      this.copy('additional_styles/_grid.scss', 'dev/sass/base/_grid.scss');

      // install dependencies
      this.on('end', function() {
        if (!this.options['skip-install']) {
          this.installDependencies({
            skipInstall: this.options['skip-install'],
            callback: function() {

              // Install bourbon and Angular (optionally)
              _self.bowerInstall(staticGridDeps, {
                save: true
              });

            }
          });
        }

        replaceSCSSDeps();

        if (this.includeAngular) {
          replaceJSDeps();
        }
      });

    }

    // if no framework return
    if (!this.frameworkType) {
      return;
    }

    framework = this.frameworkType.toLowerCase();

    responsiveGridDeps[0] = packages[framework];

    if (this.includeAngular) {
      responsiveGridDeps[1] = 'angular';
    }

    // copy sass file with framework import based on user choice
    this.copy('additional_styles/_' + framework + '.scss', 'dev/sass/vendor/_' + framework + '.scss');

    // install bower dependencies on the end of installation
    this.on('end', function() {
      if (!this.options['skip-install']) {
        this.installDependencies({
          skipInstall: this.options['skip-install'],
          callback: function() {

            // install new dependencies
            _self.bowerInstall(responsiveGridDeps, {
              save: true
            });
          }
        });
      }

      replaceSCSSDeps();

      if (this.includeAngular) {
        replaceJSDeps();
      }
    });

  },

  updateTemplate: function() {

    // context
    var _self = this;

    this.on('end', function() {

      var features = {
        angular: _self.includeAngular,
        responsive: _self.includeResponsive,
        others: _self.otherIncludes
      };

      fs.readFile('dev/pages/home.hbs', 'utf-8', function(err, data) {

        var newValue;

        if (err) throw err;

        newValue = data.replace('{{!-- APP FEATURES --}}', function() {
          var changedContent = '<ul>\n\t\t\t<li>Assemble templating</li>\n\t\t\t<li>Sass support</li>\n\t\t\t<li>Imagemin</li>\n';

          for (var prop in features) {
            switch (true) {
              case prop === 'angular' && features.angular === true:
                changedContent += '\t\t\t<li>Angular JS</li>\n';
                break;
              case prop === 'responsive' && features.responsive === true:
                changedContent += '\t\t\t<li>' + _self.frameworkType + ' framework</li>\n';
                break;
              case prop = 'others' && features.others.length > 0:
                for (var i = 0; i < features.others.length; i++) {
                  changedContent += '\t\t\t<li>Includes ' + _self.otherIncludes[i] + '</li>\n';
                }
                break;
            }
          }

          changedContent += '\t\t</ul>';
          return changedContent;

        });

        fs.writeFile('dev/pages/home.hbs', newValue, 'utf-8', function(err) {
          if (err) throw err;
        });

      });

    });

  }
});
module.exports = RebornGenerator;
