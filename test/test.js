'use strict';

const co = require('co');

const config = require('./config.json');
const B2 = require('../B2');
const b2app = new B2();

co(function* () {
    let res = '';

    res = yield b2app.authorizeAccount(config.AccountID, config.ApplicationKey);
    console.log(res);

    // res = yield b2app.createBucket('mister-coffee', true);
    // console.log(res);

    res = yield b2app.deleteBucket('3272c8a226e8e8de55230b1d');
    console.log(res);

}).catch((error) => {
   console.log(error); 
});
