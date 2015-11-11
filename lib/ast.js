var types = {
  'Program': ['declarations'],

  // Top level declarations.
  'Include': ['path'],
  //'FunctionPrototype': ['isStatic', 'returnType', 'arguments'],
  //'FunctionDeclaration': ['isStatic', 'returnType', 'arguments', 'body'],
  'StructDefinition': ['isStatic', 'name', 'fields'],


  // Expressions.
  'StringLiteral': ['value'],
  'Identifier': ['name'],
  'FunctionCall': ['callee', 'arguments'],
  'BinaryOperation': ['operator', 'left', 'right'],

  // Statements.
  'ExpressionStatement': ['expression'],
  'IfStatement': ['test', 'consequent', 'alternate'],

  // Types
  'VoidType': []
}

Object.keys(types).forEach(function(type) {
  module.exports[type] = function() {
    var node = { type: type };
    for (var i = 0; i < arguments.length; ++i) {
      node[types[type][i]] = arguments[i];
    }
    return node;
  }
});
