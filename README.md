###To run the example:

    npm install


You also need [MongoDB](https://www.mongodb.org/) installed on your system. Details are saved in a database named `hq`, in a collection called `payments`.

###About the library

The payment library is fully functional as per the rules described in the [Assignment](https://github.com/HQInterview/Nodejs-Round1) repo's README. The library follows a mixture of object-oriented and async-callback approaches. A `Payment` object can be constructed by passing the `Payment` function an object containing credit card and transaction information. The `Payment` class has methods for validating the credentials which are called one by one.

Rules for allowed card types, currencies, etc. are defined in the root at `config.json`. However, the rules are mutable and extendable. New rules can be added and the default ones be changed by passing options object as the second argument to the constructor.

But in this scenario, we have so many different types of errors that throwing each seems impractical. Instead, the error is passed on to the callback. Hence, if validation fails, the `Payment` object is left unconfigured and callback is called. At this point, the object is useless.

If validation completes successfully, the object has card credentials and transaction details as properties, as well as some a couple of other values that weren't passed to the constructor: the card type (which the method `processCreditCard` figures out through the config object) and the payment gateway (which is figured out by the `getPaymentGateway` method, which iterates over the rules provided in the config to figure out what payment gateway is suitable for a set of payment details).

The transaction would be done inside processCreditCard function after all validation from our end, which could serve as a custom implementation of the gateway, which takes priority over the gateway implementations included in the library. 

###About test credit card numbers
I have tested using some valid different types of credit card numbers and it was successfull in terms of valid credentials
For some test numbers, Braintree also responds with "not an accepted test number". However, it behaves much better than PayPal in this regard. Also, Braintree allows only one currency with one merchant account.