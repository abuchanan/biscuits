// TODO need the extra layer of QuadTree?
var QuadTree = require('../../src/QuadTree').QuadTree;

/*
  Testing that QuadTree exists and can be called without error.
*/
test('basic create', function() {
  QuadTree(0, 0, 10, 10)
});


/*
  QuadTree.add(x, y, w, h, value)

  QuadTree maps simple values (e.g. string/int) to a rectangle.
*/
test('basic add()', function() {
  var tree = QuadTree(0, 0, 10, 10);
  tree.add(1, 1, 1, 1, 'foo');
  tree.add(1, 1, 5, 5, 'bar');
});


/*
  QuadTree.add will fail when the given rectangle is outside the bounds
  of the tree.
*/
test('out of bounds', function() {
  var tree = QuadTree(0, 0, 10, 10);
  var func = tree.add.bind(tree, 0, 11, 5, 5, 'fail');

  assert.throw(func, 'Error: out of bounds');
});


/*
  QuadTree.add will NOT fail when the given rectange overlaps the edge
  of the bounds of tree.
*/
test('edge overlap', function() {
  var tree = QuadTree(0, 0, 10, 10);
  tree.add(9, 9, 5, 5, 'foo');
});


/*
  QuadTree.query(x, y, w, h)

  QuadTree.query retrieves the IDs mapped to a given query rectangle.
*/
test('basic query', function() {
  var tree = QuadTree(0, 0, 10, 10);
  tree.add(1, 1, 1, 1, 'foo');
  tree.add(5, 5, 2, 2, 'bar');

  /*
  expect(tree.query(0, 0, 2, 2)).toEqual(['foo']);
  expect(tree.query(1, 1, 1, 1)).toEqual(['foo']);
  expect(tree.query(0, 0, 10, 10)).toEqual(['foo', 'bar']);
  expect(tree.query(6, 5, 1, 1)).toEqual(['bar']);
  expect(tree.query(7, 5, 1, 1)).toEqual([]);
  expect(tree.query(0, 0, 1, 1)).toEqual([]);
  expect(tree.query(8, 8, 1, 1)).toEqual([]);
  */
});


/*
  Checking that query handles its bounds correctly.
*/
test('query bounds', function() {
  var tree = QuadTree(0, 0, 10, 10);
  tree.add(0, 0, 1, 1, 'foo');
  tree.add(1, 1, 1, 1, 'bar');
  tree.add(4, 0, 1, 1, 'baz');
  tree.add(5, 0, 1, 1, 'bat');
  /*
  expect(tree.query(0, 0, 1, 1)).toEqual(['foo']);
  expect(tree.query(4, 0, 1, 1)).toEqual(['baz']);
  expect(tree.query(5, 0, 1, 1)).toEqual(['bat']);
  */
});
