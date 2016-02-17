'use strict';

const request = require('request-promise');

class B2 {
    constructor() {
        // nothing to do
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
        accountIDとapplicationKeyでアカウントを認証する
        
        認証に成功した場合、
            1. アカウントID(accountID)
            2. 認証トークン(authorizationToken)
            3. 認証トークンの有効期限(authorizationTokenExpired)
            4. APIの起点となるURL(apiUrl)
            5. ファイルダウンロードの起点となるURL(downloadUrl)
        を記録する。
        認証に失敗した場合、authorizationTokenExpiredに現時刻をセットする。
        
        https://www.backblaze.com/b2/docs/b2_authorize_account.html
    */
    authorizeAccount(accountID, applicationKey) {
        return new Promise((resolve, reject) => {
            const options = {
                uri: 'https://api.backblaze.com/b2api/v1/b2_authorize_account',
                auth: {
                    user: accountID,
                    pass: applicationKey,
                },
                json: true
            };

            request(options).then((response) => {
                this.accountID = accountID;
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
        バケットの設定を更新する
        
        bucketType(allPublic|allPrivate)を切り替える
        
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
}

module.exports = B2;
