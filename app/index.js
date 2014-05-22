'use strict';
var util = require('util');
var path = require('path');
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
    }];
    this.prompt(prompts, function(props) {
      this.includeResponsive = props.includeResponsive;
      this.frameworkType = props.frameworkType;
      done();
    }.bind(this));
  },
  installDevDep: function() {
    this.copy('_.gitignore', '.gitignore');
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
    this.directory('_fonts', 'dev/_fonts');
    this.directory('sass', 'dev/sass');
    this.directory('scripts', 'dev/scripts');
    this.directory('images', 'dev/images');
    this.directory('test', 'dev/test');
    this.directory('styleguide', 'dev/styleguide');
  },
  projectfiles: function() {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
  },
  install: function() {
    // if no responsive included copy default grid
    if (!this.includeResponsive) {
      // make empty vendor folder for further includes
      this.mkdir('dev/sass/vendor');
      this.copy('additional_styles/_grid.scss', 'dev/sass/base/_grid.scss');

      // install dependencies
      this.on('end', function() {
        if (!this.options['skip-install']) {
          this.installDependencies();
        }
      });

    }
    // if no framework return
    if (!this.frameworkType) {
      return;
    }

    var packages = {
      bootstrap: 'bootstrap-sass',
      foundation: 'foundation'
    };
    var framework = this.frameworkType.toLowerCase();
    // copy sass file with framework import based on user choice
    this.copy('additional_styles/_' + framework + '.scss', 'dev/sass/vendor/_' + framework + '.scss');

    // install bower dependencies on the end of installation
    this.on('end', function() {
      if (!this.options['skip-install']) {
        this.installDependencies({
          skipInstall: this.options['skip-install'],
          callback: function() {
            // install new dependencies
            this.bowerInstall(packages[framework], {
              save: true
            });
          }.bind(this)
        });
      }
    });
  }
});
module.exports = RebornGenerator;