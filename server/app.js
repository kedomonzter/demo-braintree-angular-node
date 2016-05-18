'use strict';

var util = require('util');
var express = require('express');
var braintree = require('braintree');
var bodyParser = require('body-parser');
var cors = require('cors');

/**
 * Instantiate your server and a JSON parser to parse all incoming requests
 */
var app = express();
var jsonParser = bodyParser.json();
var env = 'localhost';

/**
 * Instantiate your gateway (update here with your Braintree API Keys)
 */
var gateway = braintree.connect({
  environment:  braintree.Environment.Sandbox,
  merchantId:   'h3k4sf2j9rbnd5rg',
  publicKey:    'sgdwk5jchmnvbbkd',
  privateKey:   '2f98fed0e793007ac22dcfbc693651a9'
});

/**
 * Enable CORS (http://enable-cors.org/server_expressjs.html)
 * to allow different clients to request data from your server
 */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/**
 * Route that returns a token to be used on the client side to tokenize payment details
 */
app.options('/api/v1/token', cors());  //enable pre-flight request
app.post('/api/v1/token',cors(), function (request, response) {
  gateway.clientToken.generate({}, function (err, res) {
    if (err) throw err;
    response.json({
      "client_token": res.clientToken,
      "environment" : env
    });
  });
});

/**
 * Route to process a sale transaction
 */
app.options('/api/v1/process', cors());  //enable pre-flight request
app.post('/api/v1/process',cors(),jsonParser, function(req, res) {
  var plan = '2kh6';
  var transaction = req.body;
  console.log('transaction,',transaction);
  var nonce = transaction.payment_method_nonce;

  gateway.customer.create({
    paymentMethodNonce: nonce
  }, function (err, result) {
    if (result.success) {

      var token = result.customer.paymentMethods[0].token;

      gateway.subscription.create({
        paymentMethodToken: token,
        planId: plan
      }, function (err, result) {
        res.json(result);
      });
    }
  });
});

app.listen(3000, function () {
  console.log('Listening on port 3000');
});