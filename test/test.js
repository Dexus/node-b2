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
            const newBucketName = process.argv[3];
            const isNewBucketPrivate = (process.argv[4] && process.argv[4] === 'private') ? true : false;

            b2app.createBucket(newBucketName, isNewBucketPrivate).then((result) => {
                console.log(result);
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

            b2app.deleteBucket(bucketID).then((result) => {
                console.log(result);
            }).catch((error) => {
                console.log(error);
            });
            break;

        case 'b2_list_buckets':
            b2app.listBucket().then((result) => {
                result.buckets.forEach((bucket) => {
                    console.log(bucket);
                });
            }).catch((error) => {
                console.log(error);
            });
            break;

        case 'b2_update_bucket':
            if (process.argv.length < 5) {
                console.log('usage: node test.js b2_update_bucket bucketID public|private');
                process.exit(1);
            }
            const updateBucketID = process.argv[3];
            let isUpdateBucketPrivate = true;
            switch (process.argv[4]) {
                case 'public':
                    isUpdateBucketPrivate = false;
                    break;
                case 'private':
                    isUpdateBucketPrivate = true;
                    break;
                default:
                    console.log('Unknown bucketType "%s". Use either "public" or "private".', process.argv[4]);
                    process.exit(1);
            }

            b2app.updateBucket(updateBucketID, isUpdateBucketPrivate).then((result) => {
                console.log(result);
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
