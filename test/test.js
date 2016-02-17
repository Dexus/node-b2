'use strict';

const config = require('./config.json');

const B2 = require('../B2');
const b2app = new B2(config.AccountID, config.ApplicationKey);

