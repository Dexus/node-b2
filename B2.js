'use strict';

const request = require('request');

class B2 {
    constructor() {
        // nothing to do
    }

    b2_authorize_account(accountID, applicationKey) {
        return new Promise((resolve, reject) => {
            request.get('https://api.backblaze.com/b2api/v1/b2_authorize_account', {
                'auth': {
                    'user': accountID,
                    'pass': applicationKey,
                }
            }, (error, response, body) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(body);
                }
            });
        });
    }
}

module.exports = B2;
