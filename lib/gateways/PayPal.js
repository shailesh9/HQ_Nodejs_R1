/*
 *
 */

var paypal = require('paypal-rest-sdk')
module.exports = function (formData,callback) {
  console.log('====INSIDE PAYPAL LIB')
  paypal.configure({
        'mode': 'sandbox', //sandbox or live
        'client_id': 'AasPU8QsQVu1NAYr-C4a6EGQ3EXOiT-cklbnQugsMOBoWe41v4m1QcI2eht4iwGGvqgwbG5guM67P_zc',
        'client_secret': 'EOi9ZtKfC9b_BX8geRrrqaJ-kxktk6k7oXTUG79A0IELzQIEQVqaUH1Hu9WXXOrYz5m-dEFEjXxebyyX'
    });
var first_name,
    last_name, 
    expire_month = formData.creditCardExpiration.split('/')[0],
    expire_year =  formData.creditCardExpiration.split('/')[1]
if(formData.custName.indexOf(' ') > -1){
   first_name = formData.custName.split(' ')[0];
   last_name = formData.custName.split(' ')[1];
}else{
   first_name = formData.custName;
   last_name = ""
}
          var payment_details = {
            "intent": "sale",
            "payer": {
              "payment_method": "credit_card",
              "funding_instruments": [{
                "credit_card": {
                  "type": formData.type,
                  "number": formData.creditCardNumber,
                  "expire_month": expire_month,
                  "expire_year": expire_year,
                  "cvv2": formData.creditCardVerification,
                  "first_name": first_name,
                  "last_name": last_name,
                  "billing_address": {
                    "line1": "52 N Main ST",
                    "city": "Johnstown",
                    "state": "OH",
                    "postal_code": "43210",
                    "country_code": "US" }}}]},
            "transactions": [{
              "amount": {
                "total": formData.totalAmount,
                "currency": formData.currency
                },
              "description": "This is the payment transaction description." }]
            };

          paypal.payment.create(payment_details, function (error, res) {
              if (error) {
                  if (callback && (typeof callback === 'function')) {
                    callback(error.response, null);
                  }
                  return;
              }
              if (callback && (typeof callback === 'function')) {
                callback(null, {
                  transactionId: res.id,
                  createdAt: res.create_time,
                  updatedAt: res.update_time,
                  intent: res.intent,
                  status: res.state
                });
              }
          })
}
