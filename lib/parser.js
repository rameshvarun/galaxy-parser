/* =========== Imports =========== */
var P = require('./parsimmon');
var ast = require('./ast');
var range = require('./range');

/* =========== Shorthands =========== */
var tok = P.token;
var empty = P.succeed().result(null);
var semicolon = tok(';').desc('Semicolon (;)');
var eof = tok('EOF').desc('End of File');
var comma = tok(',');
var lparen = tok('('), rparen = tok(')');
var lbrace = tok('{'), rbrace = tok('}');
var optional_semicolon = P.alt(semicolon, empty);

/* =========== Literals =========== */
var string_literal = tok('STRINGLITERAL').map(token =>
  ast.StringLiteral(token.range, token.text)).desc("String Literal");

var integer_literal = tok('INTEGERLITERAL').map(token =>
  ast.IntegerLiteral(token.range, parseInt(token.text))).desc("Integer Literal");

var fixed_literal = tok('FIXEDLITERAL').map(token =>
  ast.FixedLiteral(token.range, token.text)).desc("Fixed Literal");

var true_literal = tok('TRUE').map(token => ast.BooleanLiteral(token.range, true));
var false_literal = tok('FALSE').map(token => ast.BooleanLiteral(token.range, false));
var boolean_literal = true_literal.or(false_literal).desc("Boolean Literal");

/* =========== Common =========== */

var identifier = tok('ID').map(token => ast.Identifier(token.range, token.text))
  .desc("Identifier");

var static_modifier = P.alt(tok('STATIC').desc("Static Modifier"), empty.result(null));
var const_modifier = P.alt(tok('CONST').desc("Const Modifier"), empty.result(null));

/* =========== Type Specifiers =========== */

var type_name = identifier.map(id => ast.TypeName(id.range, id)).desc('Type Name');
var ref_type = P.seq(identifier, tok('<'), type_name, tok('>')).map(
  parts => ast.RefType(range.covers(parts), parts[0], parts[2])).desc('Reference Type');
var base_type = P.alt(ref_type, type_name).desc('A base (non-array) type');

var array_type = P.lazy(() => P.seq(base_type, P.seq(tok('['), expression, tok(']')).many()).map(parts => {
    if (parts[1].length == 0) return parts[0];
    else {
      var array_type = parts[0];
      for (var expr of parts[1]) {
        var r = range.createRange(array_type.range.start, expr[2].range.end);
        array_type = ast.ArrayType(r, array_type, expr[1]);
      }
      return array_type;
    }
  }));
var type_specifier = array_type.desc("Type Specifier");

/* =========== Expressions =========== */

var primary_expression = P.lazy(() =>
  P.alt(
    identifier,
    string_literal,
    integer_literal,
    fixed_literal,
    boolean_literal,
    tok('(').then(expression).skip(tok(')'))
  ));

var actuals = P.lazy(() => P.sepBy(expression, comma));
var function_call = P.seq(identifier, tok('('), actuals, tok(')')).map(parts =>
  ast.FunctionCall(range.covers(parts), parts[0], parts[2]));

var postfix_expression = P.lazy(() => P.alt(function_call,
    P.seq(primary_expression, P.alt(
      P.seq(tok('.'), identifier),
      P.seq(tok('['), expression, tok(']'))
    ).many()).map(parts => {
      var expr = parts[0];
      for (var operation of parts[1]) {
        if (operation[0].type === '.') {
          expr = ast.PropertyAccess(range.createRange(expr.range.start, operation[1].range.end),
            expr, operation[1]);
        } else if (operation[0].type === '[') {
          expr = ast.PropertyAccess(range.createRange(expr.range.start, operation[1].range.end),
            expr, operation[1]);
        } else {
          throw new Error('Unknown Postfix Expression ' + parts);
        }
      }
      return expr;
    })
  ));

var unary_op = P.alt(tok('+'), tok('-'), tok('~'), tok('!'));
var unary_expression = P.lazy(() => P.alt(
  P.seq(unary_op, unary_expression).map(
    parts => ast.UnaryOperation(range.covers(parts), parts[0].text, parts[1]))
  , postfix_expression));

// Creates a left-associative, binary expression, precedence layer.
var binary_expression = function (operators, next) {
  // This function can be partially applied.
  if (arguments.length < 2) return binary_expression.bind(null, operators);

  // Create a parser that can parse all of the operations in this layer.
  var ops = operators.map(op => tok(op));
  var opsParser = P.alt.apply(null, ops);

  // Match one expression, then any number of operator-expression sequences.
  return P.seq(next, P.seq(opsParser, next).many()).map(parts => {
    var left = parts[0];
    for (var operation of parts[1]) {
      var operator = operation[0], right = operation[1];
      if (!('range' in left)) console.log(left);
      if (!('range' in right)) console.log(right);
      left = ast.BinaryOperation(range.createRange(left.range.start, right.range.end), operator.type, left, right);
    }
    return left;
  });
}

var multiplicative_expression = binary_expression(['*', '/', '%'], unary_expression).desc('Multiplicative Expression');
var additive_expression = binary_expression(['+', '-'], multiplicative_expression).desc('Additive Expression');

var shift_expression = binary_expression(['<<', '>>'], additive_expression).desc('Shift Expression');
var binand_expression = binary_expression(['&'], shift_expression);
var binxor_expression = binary_expression(['^'], binand_expression);
var binor_expression = binary_expression(['|'], binxor_expression);

var relative_expression = binary_expression(['<', '<=', '>=', '>'], binor_expression);
var equals_expression = binary_expression(['==', '!='], relative_expression);

var and_expression = binary_expression(['&&'], equals_expression);
var or_expression = binary_expression(['||'], and_expression);

var assigment_expression = binary_expression(['=', '+=', '-=', '*=', '/=', '%=', '&=',
  '|=', '^=', '<<=', '>>='], or_expression);

var expression = P.alt(assigment_expression).desc('Expression');

var initializer = tok('=').then(expression);
var variable_declaration = P.seq(const_modifier, type_specifier, identifier, initializer.or(empty)).map(parts =>
  ast.VariableDeclaration(range.covers(parts), parts[0] !== null, parts[1], parts[2], parts[3]))
  .desc("Variable Declaration");

/* =========== Statements =========== */

var if_statement = P.lazy(() =>
  P.seq(tok('IF'), lparen,  expression, rparen, lbrace, statements, rbrace,
    P.alt(
      P.seq(tok('ELSE'), lbrace, statements, rbrace).map(parts => parts[2]),
      P.seq(tok('ELSE'), if_statement).map(parts => parts[1]),
      empty)
  )).map(parts => ast.IfStatement(range.covers(parts), parts[2], parts[5], parts[7]));

var while_statement =
  P.lazy(() => P.seq(tok('WHILE'), lparen, expression, rparen, lbrace, statements, rbrace)).map(parts =>
    ast.WhileStatment(range.covers(parts), parts[2], parts[5]));

var for_statement = P.lazy(() => P.seq(tok('FOR'), lparen, expression.or(empty), semicolon, expression.or(empty),
    semicolon, expression.or(empty), rparen, lbrace, statements, rbrace))
    .map(parts => ast.ForStatement(range.covers(parts), parts[2], parts[4], parts[6], parts[9]))
    .desc('For Statement');

var expression_statement = expression.map(expr =>
  ast.ExpressionStatement(expr.range, expr));

var statement = P.alt(
  expression_statement.skip(semicolon),
  variable_declaration.skip(semicolon),
  tok('BREAK').skip(semicolon),
  tok('CONTINUE').skip(semicolon),
  tok('RETURN').then(expression.or(empty)).skip(semicolon),
  if_statement,
  while_statement,
  for_statement
).desc("Statement");
var statements = statement.many();

/* =========== Top-level Declarations =========== */
var include = P.seq(tok('INCLUDE'), string_literal, optional_semicolon).map(parts =>
  ast.Include(range.covers(parts), parts[1])).desc('Include Directive');

/** Struct Declarations */
var struct_field = P.seq(type_specifier, identifier, semicolon).map(parts =>
  ast.StructField(range.covers(parts), parts[0], parts[1]));
var struct_definition = P.seq(static_modifier, tok('STRUCT'), identifier, tok('{'), struct_field.many(), tok('}'), semicolon)
    .map(parts => ast.StructDefinition(range.covers(parts), parts[0] !== null, parts[2], parts[4]))
    .desc("Struct Definition");

/** Global Declarations */
var global_declaration = P.seq(static_modifier, variable_declaration, semicolon).map(parts =>
  ast.GlobalDeclaration(range.covers(parts), parts[0] !== null,  parts[1])).desc("Global Declaration");

/** Function Declaration */
var formal = P.seq(type_specifier, identifier);
var formals = P.sepBy(formal, comma);
var function_declaration = P.seq(static_modifier, type_specifier, identifier, lparen, formals, rparen)
  .map(parts => ast.FunctionDeclaration(range.covers(parts), parts[0] !== null, parts[1], parts[2], parts[4]))
  .desc("Function Declaration");

/** Function Definition */
var function_definition = P.seq(function_declaration, tok('{'), statements, tok('}')).map(parts => {
  return ast.FunctionDefinition(range.covers(parts), parts[0], parts[2]);
}).desc("Function Definition");

var typedef = P.seq(tok('TYPEDEF'), type_specifier, type_name, semicolon).map(parts =>
  ast.TypeDef(range.covers(parts), parts[1], parts[2])).desc("TypeDef");

/* =========== Final Program Parser =========== */
var toplevel_declaration = P.alt(include, struct_definition, global_declaration,
  function_declaration.skip(semicolon), function_definition, typedef);
var program = P.seq(toplevel_declaration.many(), eof).map(parts =>
  ast.Program(range.createRange(range.createLoc(0, 0), parts[1].range.end), parts[0]));

module.exports = function(tokens) {
  var result = program.parse(tokens);
  if (result.status) {
    return result.value;
  } else {
    var e = new Error("Parse Error: " + P.formatError(tokens, result));
    e.location = tokens[result.index].range.start;
    throw e;
  }
}
