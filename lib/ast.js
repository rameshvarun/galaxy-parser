var types = {
  'Program': ['declarations'],

  // Include statements.
  'Include': ['path'],

  'FunctionDeclaration': ['isStatic', 'returnType', 'id', 'arguments'],
  'Formal': ['typeSpecifier', 'id'],
  'FunctionDefinition': ['declaration', 'body'],

  'GlobalDeclaration': ['isStatic', 'declaration'],
  'VariableDeclaration': ['isConst', 'typeSpecifier', 'id', 'initializer'],

  'StructDefinition': ['isStatic', 'id', 'fields'],
  'StructField': ['typeSpecifier', 'id'],

  'TypeDef': ['typeSpecifier', 'alias'],

  // Expressions.
  'StringLiteral': ['value'],
  'IntegerLiteral': ['value'],
  'BooleanLiteral': ['value'],
  'FixedLiteral': ['value'],

  'Identifier': ['name'],
  'FunctionCall': ['callee', 'arguments'],
  'BinaryOperation': ['operator', 'left', 'right'],
  'UnaryOperation': ['operator', 'operand'],
  'PropertyAccess': ['object', 'property'],
  'ArrayAccess': ['array', 'position'],

  // Statements.
  'ExpressionStatement': ['expression'],
  'AssignmentStatment': ['operator', 'left', 'right'],
  'IfStatement': ['test', 'consequent', 'alternate'],
  'WhileStatment': ['condition', 'body'],
  'BreakStatment': [],
  'ContinueStatement': [],
  'ReturnStatment': ['expression'],

  // Type Specifiers.
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
