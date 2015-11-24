var P = require('./parsimmon');
var token = P.token;
var ast = require('./ast');
var range = require('./range');

var empty = P.succeed();
var semicolon = P.token(';');
var eof = P.token('EOF');
var comma = P.token(',');
var lparen = P.token('('), rparen = P.token(')');
var lbrace = P.token('{'), rbrace = P.token('}');

var optional_semicolon = P.alt(semicolon, empty);

/** Literals **/
var string_literal = P.token('STRINGLITERAL').map(function(token) {
  return ast.StringLiteral(token.range, token.text);
});
var integer_literal = P.token('INTEGERLITERAL');
var fixed_literal = P.token('FIXEDLITERAL');
var boolean_literal = P.token('TRUE').or(P.token('FALSE'));

var include = P.seq(P.token('INCLUDE'), string_literal, optional_semicolon).map(function(parts) {
  return ast.Include(range.covers(parts), parts[1]);
}).desc('include directive');

var identifier = P.token('ID').map(function(token) {
  return ast.Identifier(token.range, token.text);
});

/** Type Specifiers */
var type_name = identifier.map(function(id) {
  return ast.TypeName(id.range, id);
});
var ref_type = P.seq(identifier, token('<'), type_name, token('>'));
var base_type = P.alt(ref_type, type_name);

var array_type = P.lazy(function() {
  return P.seq(base_type, P.seq(token('['), expression, token(']')).many());
});
var type_specifier = array_type.desc("type specifier");

var static_modifier = P.alt(P.token('STATIC').result(true), empty.result(false));
var const_modifier = P.alt(P.token('CONST').result(true), empty.result(false));

/** Struct Declarations */
var struct_field = P.seq(type_specifier, identifier, semicolon).map(function(parts) {
  return ast.StructField(range.covers(parts), parts[0], parts[1]);
});
var struct_definition = P.seq(static_modifier, P.token('STRUCT'), identifier, P.token('{'),
  struct_field.many(), P.token('}'), semicolon).map(function(parts) {
  return ast.StructDefinition(range.covers(parts), parts[0], parts[2], parts[4]);
});

var actuals = P.lazy(function() {
  return P.sepBy(expression, comma);
})

var primary_expression = P.lazy(function() {
  return P.alt(
    identifier,
    string_literal,
    integer_literal,
    fixed_literal,
    boolean_literal,
    P.token('(').then(expression).skip(P.token(')'))
  );
});

var function_call = P.seq(identifier, P.token('('), actuals, P.token(')'));
var postfix_expression = P.lazy(function() {
  return P.alt(
    function_call,
    P.seq(primary_expression, P.alt(
      P.seq(token('.'), identifier),
      P.seq(token('['), expression, token(']'))
    ).many())
  );
});

var unary_op = P.alt(P.token('+'), P.token('-'), P.token('~'), P.token('!'));
var unary_expression = P.lazy(function() {
  return P.alt(
    P.seq(unary_op, unary_expression),
    postfix_expression
  );
});

// Creates a left-associative, binary expression, precedence layer.
var binary_expression = function (operators, next) {
  // This function can be partially applied.
  if (arguments.length < 2) return binary_expression.bind(null, operators);

  var ops = operators.map(function(op) { return P.token(op) });
  var opsParser = P.alt.apply(null, ops);
  return P.seq(next, P.seq(opsParser, next).many());
}

var multiplicative_expression = binary_expression(['*', '/', '%'], unary_expression);
var additive_expression = binary_expression(['+', '-'], multiplicative_expression);

var shift_expression = binary_expression(['<<', '>>'], additive_expression);
var binand_expression = binary_expression(['&'], shift_expression);
var binxor_expression = binary_expression(['^'], binand_expression);
var binor_expression = binary_expression(['|'], binxor_expression);

var relative_expression = binary_expression(['<', '<=', '>=', '>'], binor_expression);
var equals_expression = binary_expression(['==', '!='], relative_expression);

var and_expression = binary_expression(['&&'], equals_expression);
var or_expression = binary_expression(['||'], and_expression);

var assigment_expression = binary_expression(['=', '+=', '-=', '*=', '/=', '%=', '&=',
  '|=', '^=', '<<=', '>>='], or_expression);

var expression = P.alt(
  assigment_expression
);

var initializer = P.token('=').then(expression);
var variable_declaration = P.seq(const_modifier, type_specifier, identifier, initializer.or(empty));

/** Global Declarations */
var global_declaration = P.seq(static_modifier, variable_declaration, semicolon);

/** Function Declaration */
var formal = P.seq(type_specifier, identifier);
var formals = P.sepBy(formal, comma);
var function_declaration = P.seq(static_modifier, type_specifier, identifier, lparen,
  formals, rparen);

var if_statement = P.lazy(function() {
  return P.seq(P.token('IF'), lparen,  expression, rparen, lbrace, statements, rbrace,
    P.alt(
      P.seq(token('ELSE'), lbrace, statements, rbrace),
      P.seq(token('ELSE'), if_statement),
      empty
    )
  );
});

var while_statement = P.lazy(function() {
  return P.seq(token('WHILE'), lparen, expression, rparen, lbrace, statements, rbrace);
});
var for_statement = P.lazy(function() {
  return P.seq(token('FOR'), lparen, expression.or(empty), semicolon, expression.or(empty),
    semicolon, expression.or(empty), rparen, lbrace, statements, rbrace);
});
var expression_statement = expression;

var statement = P.alt(
  expression_statement.skip(semicolon),
  variable_declaration.skip(semicolon),
  token('BREAK').skip(semicolon),
  token('CONTINUE').skip(semicolon),
  token('RETURN').then(expression.or(empty)).skip(semicolon),
  if_statement,
  while_statement,
  for_statement
);
var statements = statement.many();

/** Function Definition */
var function_definition = P.seq(function_declaration, P.token('{'), statements, P.token('}'));

var typedef = P.seq(token('TYPEDEF'), type_specifier, type_name, semicolon);

/** Final Program Parser */
var toplevel_declaration = P.alt(include, struct_definition, global_declaration,
  function_declaration.skip(semicolon), function_definition, typedef);
var program = P.seq(toplevel_declaration.many(), eof).map(function(parts) {
  return ast.Program(range.createRange(range.createLoc(0, 0), parts[1].range.end), parts[0]);
});

module.exports = function(tokens) {
  var result = program.parse(tokens);
  if (result.status) {
    return result.value;
  } else {
    var e = new Error(P.formatError(tokens, result));
    throw e;
  }
}
