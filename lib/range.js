// Range manipulation utilities.

function createLocation(line, column) {
  return {
    line: line,
    column: column
  }
}
module.exports.createLocation = createLocation;

function createRange(start, end) {
  return {
    start: start,
    end: end
  }
}
module.exports.createRange = createRange;

function fromJison(loc) {
  return createRange(createLocation(loc.first_line, loc.first_column),
    createLocation(loc.last_line, loc.last_column));
}
module.exports.fromJison = fromJison;
