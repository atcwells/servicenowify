#!/usr/bin/env node
var pkg = require('../../../package.json');

if (!pkg.servicenowify) {
    console.log('ServiceNowify options not present, all defaults will be in place');
    var sourceDirectory = './src';
    var distDirectory = './dist';
    var distFile = 'deploy.js';
    var apiName = pkg.name;
} else {
    var sourceDirectory = '.' + pkg.servicenowify.sourcedir
    var distDirectory = '.' + pkg.servicenowify.distdir
    var distFile = pkg.servicenowify.distfile
    var apiName = pkg.servicenowify.name
}

servicenowify = require('../lib/jobs')(apiName);

var filewalker = require('filewalker');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');

var typescriptFiles = [];

console.log('Taking source files from: ' + sourceDirectory);
console.log('Targeting dist file at: ' + distDirectory + '/' + distFile);
var mainFile = '.' + pkg.main;

filewalker(sourceDirectory)
    .on('file', function (filePath, s) {
        if (path.extname(filePath) === '.ts') {
            typescriptFiles.push(filePath)
        }
    })
    .on('done', function () {

        servicenowify.compileAll(sourceDirectory, typescriptFiles, function (err, compiledFiles) {
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
                                                            console.log('Build completed successfully');
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
