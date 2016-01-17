/*
 *
 */

var mongoose = require('mongoose'),
    Payment = require('./db.js');

module.exports = function (data, callback) {
  mongoose.connect('mongodb://127.0.0.1/hq', function (err) {
    if (err) {
      callback(err, null)
    }
    return;
  });

  var db = mongoose.connection;

  db.once('open', function () {
      console.log(' Database opened ======================>')
    var thisPayment = new Payment(data);

    thisPayment.save(function (err, p) {
      if(err){
        callback(err, null)
      }else{
        callback(null, p)
      }
      db.close();
    });
  });
}
