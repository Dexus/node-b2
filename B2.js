'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const request = require('request-promise');

class B2 {
    /*
        インスタンス生成時に認証情報を記録する
    */
    constructor(accountID, applicationKey) {
        this.accountID = accountID;
        this.applicationKey = applicationKey;
    }

    /*
        有効な認証トークンがあるか確認する
    */
    hasValidAuthorizationToken() {
        if (!this.authorizationTokenExpireDate) {
            return false;
        }

        const now = new Date();
        if (now.getTime() < this.authorizationTokenExpireDate) {
            return true;
        } else {
            return false;
        }
    }

    /*
        指定されたファイルのSHA-1ハッシュ値を計算する
    */
    calculateSHA1Hash(filePath) {
        return new Promise((resolve, reject) => {
            const sha1hash = crypto.createHash('sha1');
            const fileStream = fs.createReadStream(filePath);

            fileStream.on('error', (error) => {
                reject(error);
            });
            fileStream.on('data', (data) => {
                sha1hash.update(data);
            });
            fileStream.on('end', () => {
                resolve({ hex: sha1hash.digest('hex') });
            });
        });
    }

    /*
        アカウントを認証する
        
        認証に成功した場合、
            1. 認証トークン(authorizationToken)
            2. 認証トークンの有効期限(authorizationTokenExpired)
            3. APIの起点となるURL(apiUrl)
            4. ファイルダウンロードの起点となるURL(downloadUrl)
        を記録する。
        認証に失敗した場合、authorizationTokenExpiredに現時刻をセットする。
        
        https://www.backblaze.com/b2/docs/b2_authorize_account.html
    */
    authorizeAccount() {
        return new Promise((resolve, reject) => {
            const options = {
                uri: 'https://api.backblaze.com/b2api/v1/b2_authorize_account',
                auth: {
                    user: this.accountID,
                    pass: this.applicationKey,
                },
                json: true
            };

            request(options).then((response) => {
                this.authorizationToken = response.authorizationToken;
                this.apiUrl = response.apiUrl;
                this.downloadUrl = response.downloadUrl;
            
                // 認証トークンの有効期間は24時間
                const now = new Date();
                this.authorizationTokenExpireDate = now.setHours(now.getHours() + 24);

                response['authorizationTokenExpireDate'] = (new Date(this.authorizationTokenExpireDate)).toString();
                resolve(response);
            }).catch((error) => {
                this.authorizationTokenExpireDate = new Date();
                reject(error);
            });
        });
    }
        
    /*
        指定した名前でバケットを作成する
        
        bucketNameの制約
            6文字以上50文字以下の一意なものでなければならない
            利用できる文字は英数字とハイフンのみ
            「b2-」で始まる名前は利用できない

        bucketTypeは以下のいずれか
            allPublic: 誰でもファイルをダウンロードできる
            allPrivate: 認証トークンを持つユーザのみファイルをダウンロードできる

        https://www.backblaze.com/b2/docs/b2_create_bucket.html 
    */
    createBucket(bucketName, isPrivateBucket) {
        return new Promise((resolve, reject) => {
            // TODO: bucketNameのValidation

            const options = {
                method: 'POST',
                uri: this.apiUrl + '/b2api/v1/b2_create_bucket',
                headers: {
                    Authorization: this.authorizationToken
                },
                body: {
                    accountId: this.accountID,
                    bucketName: bucketName,
                    bucketType: isPrivateBucket ? 'allPrivate' : 'allPublic'
                },
                json: true
            };

            request(options).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    
    /*
        指定したIDのバケットを削除する
        
        https://www.backblaze.com/b2/docs/b2_delete_bucket.html
    */
    deleteBucket(bucketID) {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                uri: this.apiUrl + '/b2api/v1/b2_delete_bucket',
                headers: {
                    Authorization: this.authorizationToken
                },
                body: {
                    accountId: this.accountID,
                    bucketId: bucketID
                },
                json: true
            };

            request(options).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    
    /*
        指定したIDのバケットにファイルをアップロードするためのURLを取得する
        
        https://www.backblaze.com/b2/docs/b2_get_upload_url.html
    */
    getUploadUrl(bucketID) {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                uri: this.apiUrl + '/b2api/v1/b2_get_upload_url',
                headers: {
                    Authorization: this.authorizationToken
                },
                body: {
                    bucketId: bucketID,
                },
                json: true
            };

            request(options).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    
    /*
        バケットの一覧を取得する
        
        https://www.backblaze.com/b2/docs/b2_list_buckets.html
    */
    listBucket() {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                uri: this.apiUrl + '/b2api/v1/b2_list_buckets',
                headers: {
                    Authorization: this.authorizationToken
                },
                body: {
                    accountId: this.accountID,
                },
                json: true
            };

            request(options).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    
    /*
        指定したIDのバケットの設定を更新する
        
        できること
        ・bucketType(allPublic|allPrivate)の切り替え
        
        https://www.backblaze.com/b2/docs/b2_update_bucket.html
    */
    updateBucket(bucketID, isPrivateBucket) {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                uri: this.apiUrl + '/b2api/v1/b2_update_bucket',
                headers: {
                    Authorization: this.authorizationToken
                },
                body: {
                    accountId: this.accountID,
                    bucketId: bucketID,
                    bucketType: isPrivateBucket ? 'allPrivate' : 'allPublic'
                },
                json: true
            };

            request(options).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    
    /*
        指定したIDのバケットにファイルをアップロードする
    
        https://www.backblaze.com/b2/docs/b2_upload_file.html
    */
    uploadFile(bucketID, uploadFilePath) {
        return new Promise((resolve, reject) => {
            // TODO: coで包んで、各処理をyieldで待つようにする。catch句を1つにする。
            this.calculateSHA1Hash(uploadFilePath).then((hash) => {
                this.getUploadUrl(bucketID).then((response) => {
                    const uploadFilename = path.basename(uploadFilePath);
                    const uploadFilestat = fs.statSync(uploadFilePath);

                    // 注意: uriと認証トークンはb2_get_upload_urlで取得したものを使う
                    const options = {
                        method: 'POST',
                        uri: response.uploadUrl,
                        headers: {
                            Authorization: response.authorizationToken,
                            'X-Bz-File-Name': encodeURIComponent(uploadFilename),
                            'Content-Type': 'b2/x-auto',
                            'Content-Length': uploadFilestat.size,
                            'X-Bz-Content-Sha1': hash.hex
                        },
                        json: true
                    };
                    console.log(options);

                    // ファイルの中身をrequestに流し込む
                    fs.createReadStream(uploadFilePath).pipe(request(options)).then((response) => {
                        resolve(response);
                    }).catch((error) => {
                        reject(error);
                    });
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }
}

module.exports = B2;
