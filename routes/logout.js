var express = require('express');
var router = express.Router();
var User = require('../models').User;
var sequelize = require('../models').sequelize;
const NetValues = require('../lib/NetValues');

/* GET users listing. */
router.get('/', async (req, res, next) => {
    console.log('session logout');

  let data = {};
//   console.log('req.session.userid:', req.session.user.id);
    if(req.session.user){
        req.session.destroy(function(){
            req.session;
            data.res = NetValues.REQ_OK;
            res.send(data);
        });
        // res.send(data);
    } else {
        data.res = NetValues.REQ_OK;
        res.send(data);
    }
});

module.exports = router;
