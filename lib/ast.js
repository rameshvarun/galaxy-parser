var assert = require('assert');

exports.StringLiteral = function(value) {
  assert.equal(typeof value, "string");
  return {
    type: 'StringLiteral',
    value: value
  };
};

exports.Include = function(path) {
  assert.equal(path.type, 'StringLiteral');
  return {
    type: 'Include',
    path: path.value
  };
};
