'use strict';

const request = require('request-promise');

class B2 {
    /*
        インスタンス生成時にアカウント認証を済ませる
    */
    constructor(accountID, applicationKey) {
        this.b2_authorize_account(accountID, applicationKey);
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
        
        有効な認証トークンがあるか確認したい場合、時刻が有効期限を過ぎていないか
        チェックすればよい。
        
        https://www.backblaze.com/b2/docs/b2_authorize_account.html
    */
    b2_authorize_account(accountID, applicationKey) {
        const options = {
            'uri': 'https://api.backblaze.com/b2api/v1/b2_authorize_account',
            'auth': {
                'user': accountID,
                'pass': applicationKey,
            },
            'json': true
        };

        request(options).then((response) => {
            this.authorizationToken = response.authorizationToken;
            this.apiUrl = response.apiUrl;
            this.downloadUrl = response.downloadUrl;
            
            // 認証トークンの有効期間は24時間
            const now = new Date();
            this.authorizationTokenExpireDate = now.setHours(now.getHours() + 24);

            console.log(response);
            console.log('authorizationTokenExpireDate: ' + (new Date(this.authorizationTokenExpireDate)).toString());
        }).catch((error) => {
            this.authorizationTokenExpireDate = new Date();
            console.log(error);
        });
    }
}

module.exports = B2;
