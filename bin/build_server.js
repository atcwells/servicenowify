#!/usr/bin/env node
var fixBlockScoping = require('../lib/fixBlockScoping.js')('./dist/deploy.js');

var files = fs.readFile('./app', function(files) {
    console.log(files);
})

// Build
/*
var tsapi = require("typescript.api");
tsapi.compile([''], function(compiled) {
    for(var n in compiled) {
        console.log(compiled[n].content);
    }
});
*/

// Package
/*
var browserify = require('browserify')();
browserify.add('./src/lib/main.js');
browserify.bundle().pipe(function (error, code) {
    console.log(code);
});
*/

// Uglify
/*
var UglifyJS = require("uglify-js");
var result = UglifyJS.minify("var b = function () {};", {fromString: true});
*/

// Fix Block Scoping - ServiceNow has a poor implementation of JavaScript, causing a single error in the Uglified code. We have to fix this by scoping a variable.

// Clean
/*
var rimraf = require('rimraf');
rimraf('./src/lib/*.js', function (err) {
    if (err) {

    } else {
        rimraf('./dist/deployTemp.js', function (err) {
            if (err) {

            } else {

            }
        });
    }
});
*/

/*
 "build": "npm run compile -s && npm run package -s && npm run uglify -s  && npm run clean -s",
 "compile": "tsc src/lib/*.ts --module commonjs",
 "package": "browserify --s Ops_DBScan src/lib/main.js > dist/deployTemp.js",
 "uglify": "uglifyjs dist/deployTemp.js > dist/deploy.js",
 "fix_block_scoping": "node ./fixBlockScoping.js",
 "clean": "rm -r src/lib/*.js && rm dist/deployTemp.js"
 */