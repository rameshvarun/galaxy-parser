// Range manipulation utilities.

// Create a location object.
var createLoc = module.exports.createLoc = function(line, column) {
  return {
    line: line,
    column: column
  };
}

// Compare two location objects.
var compareLoc = module.exports.compareLoc = function (a, b) {
  if (a.line == b.line) return a.column - b.column;
  else return a.line - b.line;
}

// Create a range object from a start and end location.
var createRange = module.exports.createRange = function (start, end) {
  return {
    start: start,
    end: end
  };
}

var covers = module.exports.covers = function (objs) {
  var start = createLoc(Infinity, Infinity);
  var end = createLoc(-Infinity, -Infinity);
  objs.forEach(function(obj) {
    if (obj && 'range' in obj) {
      if (compareLoc(obj.range.start, start) < 0) start = obj.range.start;
      if (compareLoc(obj.range.end, end) > 0) end = obj.range.end;
    }
  });
  return createRange(start, end);
}

function fromJison(yylloc) {
  return createRange(createLoc(yylloc.first_line, yylloc.first_column),
    createLoc(yylloc.last_line, yylloc.last_column));
}
module.exports.fromJison = fromJison;
