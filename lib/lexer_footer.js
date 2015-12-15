var range = require('./range');

lexer.parseError = function(str, hash) {
  var error = new Error(str);
  throw error;
};

module.exports = function(code) {
  lexer.setInput(code);

  var tokens = [];
  while(true) {
    try {
      var token_type = lexer.lex();
    } catch (error) {
      error.location = range.fromJison(lexer.yylloc).start;
      throw error;
    }
    var token = {
      type: token_type,
      text: lexer.yytext,
      range: range.fromJison(lexer.yylloc)
    };
    tokens.push(token);
    if (token_type == 'EOF') break;
  }

  return tokens;
};
