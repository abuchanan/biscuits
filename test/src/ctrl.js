var db = require('./ctrlDep');

module.exports = {
  useDep: function() {
    db.use();
  },
};
