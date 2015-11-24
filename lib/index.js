var parser = require('./parser');
module.exports.parser = parser;

var lexer = require('./lexer');
module.exports.lexer = lexer;

module.exports = function(code) {
  return parser(lexer(code));
}
