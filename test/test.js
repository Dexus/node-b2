'use strict';

const config = require('./config.json');

const B2 = require('../B2');
const b2app = new B2();

b2app.b2_authorize_account(config.AccountID, config.ApplicationKey).then((body) => {
    console.log(body);
}).catch((error) => {
    console.log(error);
});
