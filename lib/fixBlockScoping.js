module.exports = test = function (outputFile) {
    var fs = require('fs');
    var file = fs.readFileSync(outputFile, "utf8");
    console.log(file);
}