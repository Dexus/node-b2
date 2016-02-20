'use strict';

// 引数からテスト対象のAPI名を取り出す
if (process.argv.length < 3) {
    console.log('usage: node test.js target_api_operation');
    process.exit(1);
}
const target = process.argv[2];

// B2インスタンス生成
const config = require('./config.json');
const B2 = require('../B2');
const b2app = new B2(config.AccountID, config.ApplicationKey);

if (target === 'b2_authorize_account') {
    // テスト対象がb2_authorize_accountの場合は認証結果を表示して終了
    b2app.authorizeAccount().then((result) => {
        console.log(result);
    }).catch((error) => {
        console.log(error);
    });
} else {
    // b2_authorize_account以外のAPIは認証が必要
    b2app.authorizeAccount().then((result) => {
        // 認証成功
        // API名を元にテスト実行
        switch (target) {

            case 'b2_create_bucket':
                if (process.argv.length < 4) {
                    throw 'usage: node test.js b2_create_bucket bucketName [private]';
                }
                const newBucketName = process.argv[3];
                const isNewBucketPrivate = (process.argv[4] && process.argv[4] === 'private') ? true : false;

                return b2app.createBucket(newBucketName, isNewBucketPrivate);
                break;

            case 'b2_delete_bucket':
                if (process.argv.length < 4) {
                    throw 'usage: node test.js b2_delete_bucket bucketID';
                }
                const deleteBucketID = process.argv[3];

                return b2app.deleteBucket(deleteBucketID);
                break;

            case 'b2_delete_file_version':
                if (process.argv.length < 5) {
                    throw 'usage: node test.js b2_delete_file_version deleteFileName deleteFileID';
                }
                const deleteFileName = process.argv[3];
                const deleteFileID = process.argv[4];

                return b2app.deleteFileVersion(deleteFileName, deleteFileID);
                break;

            case 'b2_download_file_by_id':
                if (process.argv.length < 4) {
                    throw 'usage: node test.js b2_download_file_by_id fileID';
                }
                const downloadFileID = process.argv[3];

                return b2app.downloadFileByID(downloadFileID);
                break;

            case 'b2_download_file_by_name':
                if (process.argv.length < 5) {
                    throw 'usage: node test.js b2_download_file_by_id bucketName fileName';
                }
                const downloadBucketName = process.argv[3];
                const downloadFileName = process.argv[4];

                return b2app.downloadFileByName(downloadBucketName, downloadFileName);
                break;

            case 'b2_get_file_info':
                if (process.argv.length < 4) {
                    throw 'usage: node test.js b2_get_file_info fileID';
                }
                const targetFileID = process.argv[3];

                return b2app.getFileInfo(targetFileID);
                break;

            case 'b2_get_upload_url':
                if (process.argv.length < 4) {
                    throw 'usage: node test.js b2_get_upload_url bucketID';
                }
                const targetBucketID = process.argv[3];

                return b2app.getUploadUrl(targetBucketID);
                break;

            case 'b2_hide_file':
                if (process.argv.length < 5) {
                    throw 'usage: node test.js b2_hide_file bucketID fileName';
                }
                const containBucketID = process.argv[3];
                const hideFileName = process.argv[4];

                return b2app.hideFile(containBucketID, hideFileName);
                break;

            case 'b2_list_buckets':
                return b2app.listBucket();
                break;

            case 'b2_list_file_names':
                if (process.argv.length < 4) {
                    throw 'usage: node test.js b2_list_file_names bucketID';
                }
                const listFileBucketID = process.argv[3];

                return b2app.listFileNames(listFileBucketID);
                break;

            case 'b2_list_file_versions':
                if (process.argv.length < 4) {
                    throw 'usage: node test.js b2_list_file_versions bucketID';
                }
                const listVersionBucketID = process.argv[3];

                return b2app.listFileVersions(listVersionBucketID);
                break;

            case 'b2_update_bucket':
                if (process.argv.length < 5) {
                    throw 'usage: node test.js b2_update_bucket bucketID public|private';
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
                        throw 'Unknown bucketType "' + process.argv[4] + '". Use either "public" or "private".';
                }

                return b2app.updateBucket(updateBucketID, isUpdateBucketPrivate);
                break;

            case 'b2_upload_file':
                if (process.argv.length < 5) {
                    throw 'usage: node test.js b2_upload_file bucketID file';
                }
                const uploadBucketID = process.argv[3];
                const uploadFilePath = process.argv[4];

                return b2app.uploadFile(uploadBucketID, uploadFilePath);
                break;

            // 該当APIの実装なし
            default:
                throw 'Operation "' + target + '" is not implemented.';
                break;
        }
    }).then((response) => {
        // API呼び出し成功
        console.log(response);
    }).catch((error) => {
        // API呼び出し失敗
        console.log(error);
        process.exit(1);
    });
}
