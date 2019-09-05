/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});


/**********************
 * Get method *
 **********************/

// import axios
const axios = require('axios')

app.get('/hotdata1', function(req, res) {
  // define base url
  let apiUrl = `https://www.printf520.com:8080/GetType`
  // check if there are any query string parameters, if so the reset the base url to include those
  if (req.apiGateway && req.apiGateway.event.queryStringParameters) {
    apiUrl = `https://www.printf520.com:8080/GetType`
  }
  // call API and return response
  axios.get(apiUrl, { crossdomain: true })
    .then(response => {
      res.json({ hotdata1: response.data })
    })
    .catch(err => res.json({ error: err }))
})

app.get('/hotdata2', function(req, res) {
  // define base url
  let apiUrl = `https://www.printf520.com:8080/GetTypeInfo?id=2`
  // check if there are any query string parameters, if so the reset the base url to include those
  if (req.apiGateway && req.apiGateway.event.queryStringParameters) {
    const { id = 0 } = req.apiGateway.event.queryStringParameters
    apiUrl = `https://www.printf520.com:8080/GetTypeInfo?id=${id}`
  }
  // call API and return response
  axios.get(apiUrl, { crossdomain: true })
    .then(response => {
      res.json({ hotdata2: response.data })
    })
    .catch(err => res.json({ error: err }))
})

app.get('/pullword', function(req, res) {
  // define base url
  let baseUrl = `http://api.pullword.com/get.php`
  // check if there are any query string parameters, if so the reset the base url to include those
  if (req.apiGateway && req.apiGateway.event.queryStringParameters) {
    var apiUrl = req.url.replace(req.baseUrl, baseUrl)
    apiUrl = apiUrl.replace(req.path, "")
    apiUrl = apiUrl + "&param1=1&param2=0"
    apiUrl = decodeURI(unescape(apiUrl))
  }
  // call API and return response
  axios.get(apiUrl, { crossdomain: true })
    .then(response => {
      res.json({ keywords: response.data })
    })
    .catch(err => res.json({ error: err }))
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
