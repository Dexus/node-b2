'use strict';

const request = require('request-promise');

class B2 {
    constructor(accountID, applicationKey) {
        this.b2_authorize_account(accountID, applicationKey);
    }

    b2_authorize_account(accountID, applicationKey) {
        const uri = 'https://api.backblaze.com/b2api/v1/b2_authorize_account';
        const auth = {
            'user': accountID,
            'pass': applicationKey,
        };
        request({ 'uri': uri, 'auth': auth, 'json': true }).
            then((response) => {
                console.log(response);
            }).catch((error) => {
                console.log(error);
            });
    }
}

module.exports = B2;
