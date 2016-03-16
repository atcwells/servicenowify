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
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');

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

        servicenowify.browserifyAll(mainFile, function (err, code) {
            if (err) {
                console.log('Unable to browserify source directory: ' + err)
            } else {
                servicenowify.uglifyAll(code.toString(), function (err, uglifiedCode) {
                    if (err) {
                        console.error('Unable to Uglify Source: ' + err)
                    } else {
                        mkdirp(distDirectory + '/', function (err) {
                            if (err) {
                                console.error('Unable to Create dist file: ' + err)
                            } else {
                                fs.writeFileSync(distDirectory + '/' + distFile, uglifiedCode, 'UTF8')
                            }
                        })
                    }
                })
            }
        })
    })
    .walk()

// Build
