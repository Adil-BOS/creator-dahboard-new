
const ActiveSession = require('../models/activeSession');
const User = require('../models/user');

module.exports = {
  tokensCleanUp: function() {
    const date = new Date();
    const daysToDelete = 1;
    const deletionDate = new Date(date.setDate(date.getDate() - daysToDelete));
    ActiveSession.deleteMany({date: {$lt: deletionDate}}, function(err, item) {
      return;
    });

    User.deleteMany({email: {$ne: 'test@test.com'}}, function(err, item) {
      return;
    });
  },
};
