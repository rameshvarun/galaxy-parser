var types = {
  'Program': ['declarations'],

  // Top level declarations.
  'Include': ['path'],

  // Expressions.
  'StringLiteral': ['value'],

  // Statements.
  'IfStatement': ['test', 'consequent', 'alternate']
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
