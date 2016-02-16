#!/usr/bin/env node
var pkg = require('../../../package.json');

if (!pkg.servicenowify) {
    console.log('ServiceNowify options not present, all defaults will be in place');
    var sourceDirectory = './src';
    var distDirectory = './dist';
    var distFile = 'deploy.js';
    var apiName = pkg.name;
} else {
    var sourceDirectory = '.' + pkg.servicenowify.sourcedir;
    var distDirectory = '.' + pkg.servicenowify.distdir;
    var distFile = pkg.servicenowify.distfile;
    var apiName = pkg.servicenowify.name;
}

var filewalker = require('filewalker');
var browserify = require('browserify')({'standalone': apiName});
var rimraf = require('rimraf')
var UglifyJS = require("uglify-js");
var path = require('path');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;
var fs = require('fs');

var typescriptFiles = [];
var compiledFiles = [];

console.log('Taking source files from: ' + sourceDirectory)
console.log('Targeting dist file at: ' + distDirectory + '/' + distFile)
var mainFile = '.' + pkg.main;

filewalker(sourceDirectory)
    .on('file', function (filePath, s) {
        if (path.extname(filePath) === '.ts') {
            typescriptFiles.push(filePath)
        }
    })
    .on('done', function () {



        servicenowify.compileAll(typescriptFiles, function (err) {
            if (err) {
                console.log('Unable to compile source files: ' + err)
            } else {
                servicenowify.browserifyAll(mainFile, function (err, code) {
                    if (err) {
                        console.log('Unable to browserify source directory: ' + err)
                    } else {
                        servicenowify.fixBlockScoping(code, function (err, fixedCode) {
                            if (err) {
                                console.log('Unable to fix block scoping: ' + err)
                            } else {
                                servicenowify.uglifyAll(fixedCode, function (err, uglifiedCode) {
                                    if (err) {
                                        console.error('Unable to Uglify Source: ' + err)
                                    } else {
                                        mkdirp(distDirectory + '/', function (err) {
                                            if (err) {
                                                console.error('Unable to Create dist file: ' + err)
                                            } else {
                                                fs.writeFileSync(distDirectory + '/' + distFile, uglifiedCode, 'UTF8')
                                                for (var key in compiledFiles) {
                                                    var filesToClean = compiledFiles.length
                                                    servicenowify.clean(sourceDirectory + '/' + compiledFiles[key].substring(0, compiledFiles[key].length - 2) + 'js', function (err) {
                                                        filesToClean--
                                                        if (!filesToClean) {
                                                            console.log('Build complete!')
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    })
    .walk()

// Build

servicenowify = {
    /*
     Takes an Array of files and attempts to compile them. Requires tsc compiler to be installed at OS level. Fires callback on completion.
     */
    compileAll: function (files, callback) {
        for (var key in files) {
            var filesToCompile = files.length;
            var compilationError = false;
            var command = "tsc " + sourceDirectory + '/' + files[key] + " --module commonjs";
            (function (filename) {
                exec(command, function (error) {
                    if (error !== null) {
                        console.error('Unable to compile file: ' + filename + ', err: ' + error);
                        compilationError = true;
                    } else {
                        compiledFiles.push(filename);
                    }

                    filesToCompile--;
                    if (!filesToCompile) {
                        callback(compilationError);
                    }
                });
            })(files[key])
        }
    },
    /*
     Takes an file and browserify's it, standard stuff from that package. Produces a single file including all dependencies at the target location.
     */
    browserifyAll: function (file, callback) {
        browserify.add(file);
        browserify.bundle(function (error, code) {
            callback(error, code);
        });
    },
    /*
     Takes an file and uglify's it, standard stuff from that package. Produces a single file at the target location.
     */
    uglifyAll: function (fileContents, callback) {
        var result = UglifyJS.minify(fileContents, {fromString: true});
        callback(null, result.code);
    },
    /*
     Fix Block Scoping - ServiceNow has a poor implementation of JavaScript, causing a single error in the Uglified code. We have to fix this by scoping a variable.
     */
    fixBlockScoping: function (code, callback) {
        var splicedCode = code.toString().replace('return (function e(t,n,r)', 'return (e = function (t,n,r)');
        var fixedCode = '(e = function' + code.toString().substring(11);
        callback(null, splicedCode);
    },
    /*
     Generic cleaning function, uses rimraf to take care of things
     */
    clean: function (file, callback) {
        rimraf(file, callback);
    }
};
