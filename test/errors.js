require('chai').should();

var parser = require('../lib/index.js');
var fs = require('fs');
var path = require('path');
var walk = require('fs-walk');

var tests_dir = path.join(__dirname, 'errors/');

describe('Parse Error Reporting', () => {
  walk.walkSync(tests_dir, (basedir, filename, stat) => {
    var rel_dir = path.relative(tests_dir, basedir);
    if (filename.endsWith('.galaxy')) {
      it(path.join(rel_dir, filename), function() {
        var code = fs.readFileSync(path.join(basedir, filename), 'utf-8');
        try {
          parser(code);
          throw new Error('Parser was supposed to error.');
        } catch (e) {
          var error = {
            message: e.message,
            location: e.location
          };

          var expectedFile = path.join(tests_dir, rel_dir, filename) + '.json';
          if (fs.existsSync(expectedFile)) {
            var expected = JSON.parse(fs.readFileSync(expectedFile, 'utf-8'));
            error.should.deep.equal(expected);
          } else {
            throw new Error(expectedFile + " does not exist.");
          }
        }

        /*;

          var expected = JSON.parse(fs.readFileSync(expectedFile, 'utf-8'));
          ast.should.deep.equal(expected);
        }*/
        //console.log(rel_dir)
      });
    }
  });
});
