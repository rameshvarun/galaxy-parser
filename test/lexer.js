require('chai').should();

var lexer = require('../lib/lexer.js');
var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var walk = require('fs-walk');

var sources_dir = path.join(__dirname, 'galaxy/');
var tokens_dir = path.join(__dirname, 'tokens/');

describe('Galaxy Lexer', function() {
  walk.walkSync(sources_dir, function (basedir, filename, stat) {
    var rel_dir = path.relative(sources_dir, basedir);
    if (filename.endsWith('.galaxy')) {
      it(path.join(rel_dir, filename), function() {
        var code = fs.readFileSync(path.join(basedir, filename), 'utf-8');
        var tokens = lexer(code);

        var expectedFile = path.join(tokens_dir, rel_dir, filename) + '.json';
        if (fs.existsSync(expectedFile)) {
          var expected = JSON.parse(fs.readFileSync(expectedFile, 'utf-8'));
          tokens.should.deep.equal(expected);
        }
      });
    }
  });
});
