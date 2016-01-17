/*
 *
 */

var braintree = require('braintree');

module.exports = function (formData, callback) {
var gateway;
var expire_month = formData.creditCardExpiration.split('/')[0];
var expire_year =  formData.creditCardExpiration.split('/')[1]
        switch (formData.currency) {
          case 'HKD':
            gateway = braintree.connect({
              environment:  braintree.Environment.Sandbox,
              merchantId:   'd6bsdrbnmh88zbpt',
              publicKey:    '94sm6zwm5mnty8p5',
              privateKey:   '214c402cae694eb90c0d43923a84d9eb'
            });
            break;
          case 'SGD':
            gateway = braintree.connect({
              environment:  braintree.Environment.Sandbox,
              merchantId:   'd6bsdrbnmh88zbpt',
              publicKey:    '94sm6zwm5mnty8p5',
              privateKey:   '214c402cae694eb90c0d43923a84d9eb'
            });
            break;
          case 'THB':
            gateway = braintree.connect({
              environment:  braintree.Environment.Sandbox,
              merchantId:   'd6bsdrbnmh88zbpt',
              publicKey:    '94sm6zwm5mnty8p5',
              privateKey:   '214c402cae694eb90c0d43923a84d9eb'
            });
            break;
          default:
            gateway = null;
            err = new Error('No endpoint for currency ' +
              formData.currency);
            callback(err, null);
            return;
            break;
        }

        gateway.transaction.sale({
          amount: formData.totalAmount,
          creditCard: {
            number: formData.creditCardNumber,
            expirationMonth: expire_month,
            expirationYear: expire_year
          }
        }, function (err, res) {
          if (err) {
            if (callback && (typeof callback === 'function')) {
              callback(err, null);
            }
            return;
          }
          
    if (!(res.transaction) || res.transaction.status !== 'authorized') {
      err = (res.message || 'Unknown error');

      if (callback && (typeof callback === 'function')) {
        callback(err, null);
      }
      return;
    }

    if (callback && (typeof callback === 'function')) {
      callback(null, {
        transactionId: res.transaction.id,
        createdAt: res.transaction.createdAt,
        updatedAt: res.transaction.updatedAt,
        intent: res.transaction.type,
        status: res.transaction.status
      });
    }
    return;
        });
}
