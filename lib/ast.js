var types = {
  'Program': ['declarations'],

  // Include statements.
  'Include': ['path'],

  'FunctionDeclaration': ['isStatic', 'returnType', 'id', 'arguments'],
  'Formal': ['type', 'id'],
  'FunctionDefinition': ['declaration', 'body'],

  'GlobalDeclaration': ['isStatic', 'declaration'],
  'VariableDeclaration': ['isConst', 'type', 'id', 'initializer'],

  'StructDefinition': ['isStatic', 'id', 'fields'],
  'StructField': ['type', 'id'],

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
  'AssignmentStatment': ['operator', 'left', 'right'],
  'IfStatement': ['test', 'consequent', 'alternate'],
  'WhileStatment': ['condition', 'body'],
  'BreakStatment': [],
  'ContinueStatement': [],
  'ReturnStatment': ['expression'],
  'PropertyAccess': ['object', 'property'],
  'ArrayAccess': ['array', 'position'],

  // Types Specifiers.
  'RefType': ['id', 'valueType'],
  'ArrayType': ['elementType', 'size'],
  'TypeName': ['id']
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
