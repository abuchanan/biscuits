
var through = require('through');

var t = through(function(data) {
  console.log('first', data);
});

var x = through(function(data) {
  console.log('second', data);
  this.queue(data);
});

var y = through(function(data) {
  console.log('third', data);
  this.queue(data);
});

var z = through(function(data) {
  console.log('four', data);
});

t.pipe(x).pipe(y).pipe(z);


t.push({data: 'data'});
//console.log(t);
