var types = {
  'Program': ['declarations'],

  // Top level declarations.
  'Include': ['path'],
  //'FunctionPrototype': ['isStatic', 'returnType', 'arguments'],
  //'FunctionDeclaration': ['isStatic', 'returnType', 'arguments', 'body'],
  'StructDefinition': ['isStatic', 'name', 'fields'],
  'StructField': ['type', 'name'],

  // Expressions.
  'StringLiteral': ['value'],
  'IntegerLiteral': ['value'],
  'BooleanLiteral': ['value'],
  'Identifier': ['name'],
  'FunctionCall': ['callee', 'arguments'],
  'BinaryOperation': ['operator', 'left', 'right'],

  // Statements.
  'ExpressionStatement': ['expression'],
  'IfStatement': ['test', 'consequent', 'alternate'],
  'BreakStatment': [],
  'ContinueStatement': [],
  'ReturnStatment': ['expression'],

  // Types.
  'RefType': ['name', 'valueType'],
  'ArrayType': ['elementType', 'size'],
  'TypeSpecifier': ['name']
}

Object.keys(types).forEach(function(type) {
  module.exports[type] = function() {
    var node = { type: type };
    node.range = arguments[0];
    for (var i = 1; i < arguments.length; ++i) {
      node[types[type][i - 1]] = arguments[i];
    }
    return node;
  }
});
