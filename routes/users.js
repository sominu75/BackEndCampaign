var express = require('express');
var router = express.Router();
const NetValues = require('../lib/NetValues');

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log('respond with a resource');

  res.send('respond with a resource');
});

module.exports = router;
