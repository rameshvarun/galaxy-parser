var types = {
  'Program': ['declarations'],

  // Include statements.
  'Include': ['path'],

  'FunctionDeclaration': ['isStatic', 'returnType', 'name', 'arguments'],
  'Formal': ['type', 'name'],
  'FunctionDefinition': ['declaration', 'body'],

  'GlobalDeclaration': ['isStatic', 'isConst', 'declaration'],
  'VariableDeclaration': ['type', 'name', 'initializer'],

  'StructDefinition': ['isStatic', 'name', 'fields'],
  'StructField': ['type', 'name'],

  // Expressions.
  'StringLiteral': ['value'],
  'IntegerLiteral': ['value'],
  'BooleanLiteral': ['value'],
  'FixedLiteral': ['value'],

  'Identifier': ['name'],
  'FunctionCall': ['callee', 'arguments'],
  'BinaryOperation': ['operator', 'left', 'right'],
  'UnaryOperation': ['operator', 'operand'],

  // Statements.
  'ExpressionStatement': ['expression'],
  'AssignmentStatment': ['operator', 'name', 'value'],
  'IfStatement': ['test', 'consequent', 'alternate'],
  'WhileStatment': ['condition', 'body'],
  'BreakStatment': [],
  'ContinueStatement': [],
  'ReturnStatment': ['expression'],
  'PropertyAccess': ['object', 'property'],
  'ArrayAccess': ['array', 'position'],

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
