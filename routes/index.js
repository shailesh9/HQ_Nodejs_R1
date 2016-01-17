var save_db = require('../lib/save.js');
var payment_lib = require('../lib/payment.js')

exports.order = function (req,res) {
  res.sendFile('Order.html',{ root: './views' });
};

exports.checkout = function (req,res) {
	var formData = req.body,
	 sha1sum = require('crypto').createHash('sha1'),
	 id = sha1sum.update(process.hrtime().toString()).digest('hex');

	 logRequest(formData, id);

var pay = new payment_lib(formData, function(err, response){
	if(err){
		logError(err, id)
		res.statusCode = 400
		res.send(err)
		return;
	}else{
		logSuccess(response, id);
	var saveDb = new save_db({
    '_id':id,
    'cardNumber': formData.creditCardNumber,
    'cardHolder': formData.creditCardHolderName,
    'cardExpiry': formData.creditCardExpiration,
    'cardCCV': formData.creditCardVerification,
    'cardType': response.cardType,
    'transactionAmount': formData.totalAmount,
    'transactionCurrency': formData.currency,
    'buyer': formData.custName,
    'gateway': response.gateway,
    'gatewayResponseId': response.transactionId,
    'gatewayResponseCreateTime': Date(response.createdAt),
    'gatewayResponseUpdateTime': Date(response.updatedAt),
    'gatewayResponseIntent': response.intent,
    'gatewayResponseStatus': response.status
  }, function (err, saved) {
    if (err) {
      // res.send(err);
      res.statusCode = 400
      res.send('DB_ERROR')
      return;
    }
    res.send(response)
    return;
  })
}
})
}


function logRequest(p, id) {
  console.log(
    '[' + (new Date()).toUTCString() + '] ' +
    '\033[36mRequest for payment received.'
  );
  console.log('ID: ' + '\033[1;36m' + id + '\033[1;30m');
  console.log('Card Data:\033[30m');
  console.log('  Number:   ' + '************' + (p.creditCardNumber.slice(-4)));
  console.log('  Holder:   ' + p.creditCardHolderName);
  console.log('  Expiry:   ' + p.creditCardExpiration);
  console.log('  CCV:      ' + p.creditCardVerification + '\033[1;30m');
  console.log('Payment:\033[30m');
  console.log('  Amount:   ' + p.totalAmount);
  console.log('  Currency: ' + p.currency + '\033[0m');
}



function logError(r, id) {
  console.log(
    '[' + (new Date()).toUTCString() + '] ' +
    '\033[31mError encountered while processing transaction.\033[36m'
  );
  console.log('ID: ' + '\033[1;36m' + id + '\033[1;30m');
  console.log('Error:\033[30m');
  console.log(r);
  console.log('\033[0m');
}

function logSuccess(r, id) {
  console.log(
    '[' + (new Date()).toUTCString() + '] ' +
    '\033[32mTransaction completed successfully.\033[36m'
  );
  console.log('ID: ' + '\033[1;36m' + id + '\033[1;30m');
  console.log('Response:\033[30m');
  console.log(r);
  console.log('\033[0m');
}
