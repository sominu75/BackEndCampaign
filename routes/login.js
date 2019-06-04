var express = require('express');
var router = express.Router();
var User = require('../models').User;
var sequelize = require('../models').sequelize;
const NetValues = require('../lib/NetValues');
var moment = require('moment');

/* GET users listing. */
router.post('/', async (req, res, next) => {
  let data = {};
  try {
    const user = await User.findAll({
      attributes: [[sequelize.fn('COUNT', sequelize.col('*')), 'users']]
    });
    let user_count = user[0].dataValues.users;
    console.log('user:', user[0].dataValues.users);
    if (user_count == 0) {
      await User.create({
        name: 'root',
        password: 'root',
        level: 1,
        time: moment().valueOf()
      });
    }
    const user_qey = await User.findAll({
      where: {
        name: req.body.id,
        password: req.body.pw
      }
    });
    if(user_qey.length != 0){
      if(req.session.user){
      } else {
          req.session.user = {id: user_qey[0].name, level: user_qey[0].level};
          console.log('1 req.session.id:', req.session.user.id);
      }
      console.log('2 req.session.user.id:', req.session.user.id);
      data.res = NetValues.REQ_OK;
      data.level = user_qey[0].level;
      res.send(data);

    } else {
      data.res = NetValues.REQ_NO;
      res.send(data);
    }
    // console.log('user:', user);
  } catch (e) {
    console.log('error login:', e);
    data.res = NetValues.REQ_NO;
    res.send(data);
  }

});

module.exports = router;
