'use strict';

if (process.argv.length < 3) {
    console.log('usage: node test.js target_api_operation');
    process.exit(1);
}
const target = process.argv[2];

const config = require('./config.json');
const B2 = require('../B2');
const b2app = new B2();

b2app.authorizeAccount(config.AccountID, config.ApplicationKey).then((response) => {
    // 認証成功
    switch (target) {
        case 'b2_authorize_account':
            console.log(response);
            break;

        case 'b2_create_bucket':
            if (process.argv.length < 4) {
                console.log('usage: node test.js b2_create_bucket bucketName [private]');
                process.exit(1);
            }
            const bucketName = process.argv[3];
            const isPrivate = (process.argv[4] && process.argv[4] === 'private') ? true : false;

            b2app.createBucket(bucketName, isPrivate).then((response) => {
                console.log(response);
            }).catch((error) => {
                console.log(error);
            });
            break;

        case 'b2_delete_bucket':
            if (process.argv.length < 4) {
                console.log('usage: node test.js b2_delete_bucket bucketID');
                process.exit(1);
            }
            const bucketID = process.argv[3];

            b2app.deleteBucket(bucketID).then((response) => {
                console.log(response);
            }).catch((error) => {
                console.log(error);
            });
            break;

        // 該当APIの実装なし
        default:
            console.log('Operation "%s" is not implemented.', target);
            break;
    }
}).catch((error) => {
    // 認証失敗
    console.log(error);
});
