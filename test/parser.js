var parser = require('../lib/index.js');
var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var walk = require('fs-walk');

var sources_dir = path.join(__dirname, 'galaxy/');
var asts_dir = path.join(__dirname, 'asts/');

// String.prototype.endsWith polyfill.
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

describe('galaxy-parser', function() {
  walk.walkSync(sources_dir, function (basedir, filename, stat) {
    var rel_dir = path.relative(sources_dir, basedir);
    if (filename.endsWith('.galaxy')) {
      it(rel_dir, function() {
        var code = fs.readFileSync(path.join(basedir, filename), 'utf-8');
        var ast = parser.parse(code);

        var expected = JSON.parse(fs.readFileSync(
          path.join(asts_dir, rel_dir, filename) + '.json', 'utf-8'));
        assert.deepEqual(ast, expected);
      });
    }
  });
});
