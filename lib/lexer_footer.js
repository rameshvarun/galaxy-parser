var range = require('./range');

module.exports = function(code) {
  lexer.setInput(code);

  var tokens = [];
  while(true) {
    var token_type = lexer.lex();
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
