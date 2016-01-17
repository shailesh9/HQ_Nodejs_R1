var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var gatewayResponseSchema = Schema({
  transactionId: String,
  createdAt: Date,
  updatedAt: Date,
  intent: String,
  status: String
});

var paymentSchema = Schema({
  _id: String,
  time: { type: Date, default: Date.now },
  cardNumber: String,
  cardHolder: String,
  cardExpiry: String,
  cardCCV: String,
  cardType: String,
  transactionAmount: String,
  transactionCurrency: String,
  buyer: String,
  gateway: String,
  gatewayResponseId: String,
  gatewayResponseCreateTime: Date,
  gatewayResponseUpdateTime: Date,
  gatewayResponseIntent: String,
  gatewayResponseStatus: String,
}, { _id: false, minimize: false });

module.exports = mongoose.model('Payment', paymentSchema);