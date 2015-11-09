var P = require('parsimmon');
var ast = require('./ast');

// Represents a newline character.
var Newline = P.string("\n");

// Matches any character that isn't a newline character.
var NotNewline = P.regex(/[^\n]/);

// Matches a single line comment, beginning with //
var Comment = P.string("//").then(NotNewline.many()).skip(Newline.or(P.eof));

var Ignore = P.alt(P.whitespace, Comment).many().desc("whitespace");

function Lexeme(parser) { return parser.skip(Ignore); }

var Empty = P.string("");
var Quote = P.string('"');
var Semicolon = P.string(";").desc("semicolon");
var OptionalSemicolon = Semicolon.or(Empty);

var Char = P.regex(/[^"\n]/);
var StringLiteral = Quote.then(Char.many())
  .skip(Quote).map(function(chars) {
    return ast.StringLiteral(chars.join(""));
  }).desc("string literal");

var Include = Lexeme(P.string("include"))
  .then(Lexeme(StringLiteral))
  .skip(Lexeme(OptionalSemicolon))
  .map(function(literal) {
    return ast.Include(literal);
  }).desc("include statement");

var TopLevelDeclaration = P.alt(Include).desc("top level declaration");
var Program = Ignore.then(TopLevelDeclaration.many());

module.exports.parse = function (code) {
  var result = Program.parse(code);
  if (result.status) return result.value;
  else throw result;
}
