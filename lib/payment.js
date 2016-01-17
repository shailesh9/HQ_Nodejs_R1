var config = require('../config.json')
var Paypal = require('./gateways/PayPal.js')
var Braintree = require('./gateways/Braintree.js')
function Payment(formData, callback){
  //Funtion to verify credit card number using valid luhn Algorithm
  var is_valid_luhn = function(number) {
    var digit, n, sum, _j, _len1, _ref1;
        sum = 0;
        _ref1 = number.split('').reverse();
        for (n = _j = 0, _len1 = _ref1.length; _j < _len1; n = ++_j) {
            digit = _ref1[n];
            digit = +digit;
            if (n % 2) {
                digit *= 2;
                if (digit < 10) {
                    sum += digit;
                } else {
                    sum += digit - 9;
                }
            } else {
                sum += digit;
            }
        }
        return sum % 10 === 0;
    };
    //Get the type of credit card
    // If type is undefined it means card number did not pass test for
  // any card issuer. In that case, we must now pass an error in function in which it is called.
  var get_card_type = function (number) {
    var type = '';
   Object.keys(config.cards.types).forEach(function (v, i, a) {
    var regex = new RegExp(config.cards.types[v]);
    if (regex.test(number)) {
      type = v;
    }
  });
   return type;
};
  //validate credit card number
  var validate_number = function (number) {
    var luhn_valid;
    var card_type = get_card_type(number);
    luhn_valid = false;
    length_valid = false;
    if(card_type !== ''){
      luhn_valid = is_valid_luhn(number)
    }else{
      err = new Error('Credit card issuer could not be determined.');
      err.code = 'CARD_UNKNOWN';
      return err;
    }

  return {
    card_type: card_type,
    valid: luhn_valid,
    lunh_valid: luhn_valid
  }
};

  this.validate = function (cardNo, cb) {
    return cb(validate_number(cardNo));
}

  //Start from here fire this to process credit card
  this.processCreditCard(formData, function(err, res){
      if(err){
        return callback(err,null)
      }
      return callback(null, res)  
  })
}

Payment.prototype.getPaymentGateway = function(t,c){
  var rules = config.rules,
      currencies = config.currencies;
var r_type = {};
  Object.keys(config.cards.types).forEach(function(v, i, a) {
    r_type[v] = {};
    
    rules.forEach(function (rule) {
      if (rule.type && (rule.type === v)) {
          if (rule.currency) r_type[v].currency = rule.currency;
          if (rule.gateway) r_type[v].gateway = rule.gateway;
      }
    });
  });

  var r_curr = {};
  currencies.forEach(function (v, i, a) {
    r_curr[v] = {};

    rules.forEach(function (rule) {
      if (rule.currency && (new RegExp('^' + rule.currency + '$').test(v))) {
        if (rule.gateway){
          r_curr[v].gateway = rule.gateway;
        }
      }
    });
  });

  // If a card is specified to be only used with a specific
  // currency, and this isn't that currency ...

  if (r_type[t].currency &&!(new RegExp('^'+r_type[t].currency+'$')).test(c)) {
    
    err = new Error (
      'Card type ' + t +
      ' can only be used with currency '
      + r_type[t].currency
    ); err.code = 'RULE_MISMATCH Card type ' + t +
      ' can only be used with currency '
      + r_type[t].currency;
    return err;
  }
  
    // If a card type is specified to use a gateway, return that
  if (r_type[t].gateway) {
    return r_type[t].gateway;
  }

  // If we're here, we're supposed to choose gateway based on
  // currency only.
  // Make sure that a gateway is specified with our currency.
  if (!r_curr[c].gateway) {
    err = new Error (
      'Could not determine gateway. Check rule config.'
    ); err.code = 'RULE_NOT_FOUND';
    return err;
  }
  
  return r_curr[c].gateway
}

// This function processes the credit card details 
// if all components of the card (card number, holder's name, expiration,
// verification code) are valid.
// It does not determine whether or not the card is actually valid. That
// can only be determined by actually contacting the gateway.
Payment.prototype.processCreditCard = function(c, cb){
  var self = this;
  
  //Customer Name Validation  
  var custName_match = c.custName.match(/\d+/g);
  var c_holder_match = c.creditCardHolderName.match(/\d+/g);

  //Customer Name Validation
  if(custName_match || c_holder_match){
    var err = new Error('Invalid Name')
              err.code = 'Credit card holder\'s or Customer name is invalid.' 
              return cb(err, null)
  }
    //Credit card Number validation
    this.validate(c.creditCardNumber, function(res){
        if(res.valid){
              c.type = res.card_type
              var gateway = self.getPaymentGateway(c.type, c.currency)
              
              if (Object.prototype.toString.call(gateway) === '[object Error]') {
                      if (cb && typeof cb === 'function') {
                        cb.call(this, gateway);
                      }
                      return;
              }
              self.logProcessing(gateway)
              if(gateway == 'PayPal'){
                 Paypal(c, function(error, data){
                   if(error){
                    err = new Error(error.name);
                    err.code = error.name
                    return cb(err, null)
                   }
                   if(data){
                     data.gateway = 'Paypal';
                     data.cardType = c.type; 
                   }
                   return cb(null, data) 
                 });
              }else if(gateway == 'Braintree'){
                Braintree(c, function(error, data){
                  if(error){
                    return cb(error, null)
                   }
                   if(data){
                    data.gateway = 'Braintree';
                    data.cardType = c.type; 
                   }
                   return cb(null, data) 
                })
              }
        }else{
              err = new Error('Invalid creditCardNumber')
              err.code = 'Invalid Credit Card' 
              cb(err, null)
        }
    })
}

Payment.prototype.logProcessing = function(p) {
  console.log(
    '[' + (new Date()).toUTCString() + '] ' +
    '\033[36mProcessing transaction.'
  );
  console.log('Gateway:   ' + p + '\033[0m');
}

module.exports = Payment;