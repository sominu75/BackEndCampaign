var express = require('express');
var path = require('path');
var router = express.Router();
var sequelize = require('../models').sequelize;
const NetValues = require('../lib/NetValues');
var moment = require('moment');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
router.get('/', async (req, res, next) => {
  // try{
  //   const user = await User.findAll({
  //     attributes: [[sequelize.fn('COUNT', sequelize.col('*')), 'users']]
  //   });
  //   let user_count = user[0].dataValues;
  //   console.log('user:', user[0].dataValues);
  //   if(user_count == 0){
  //     User.create({
  //       name: 'root',
  //       password: 'root',
  //       level: 1,
  //       time: moment().valueOf()
  //     }).then(function(result) {
  //
  //     }).cahtch(function(err) {
  //
  //     });
  //   }
  // } catch(e){
  //   console.log('e):', e);
  // }
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


module.exports = router;
