require('chai').should();

var parser = require('../lib/index.js');
var fs = require('fs');
var path = require('path');
var walk = require('fs-walk');

var sources_dir = path.join(__dirname, 'galaxy/');
var asts_dir = path.join(__dirname, 'asts/');

describe('Galaxy Parser', function() {
  walk.walkSync(sources_dir, function (basedir, filename, stat) {
    var rel_dir = path.relative(sources_dir, basedir);
    if (filename.endsWith('.galaxy')) {
      it(path.join(rel_dir, filename), function() {
        var code = fs.readFileSync(path.join(basedir, filename), 'utf-8');
        var ast = parser(code);

        var expectedFile = path.join(asts_dir, rel_dir, filename) + '.json';
        if (fs.existsSync(expectedFile)) {
          var expected = JSON.parse(fs.readFileSync(expectedFile, 'utf-8'));
          ast.should.deep.equal(expected);
        }
      });
    }
  });
});
