Node.jsからB2 Cloud Storageを使う

Usage
----

    const B2 = require('../B2');
    const b2app = new B2(<AccountID>, <ApplicationKey>);

    /*
        All functions returns Promise
    */
    
    b2app.authorizeAccount();

    b2app.createBucket(bucketName, isPrivateBucket);

    b2app.deleteBucket(bucketID);

    b2app.deleteFileVersion(fileName, fileID);

    // rangeStart and rangeEnd is optional. 
    b2app.downloadFileByID(fileID, rangeStart, rangeEnd);
    b2app.downloadFileByName(bucketName, fileName, rangeStart, rangeEnd);

    b2app.getFileInfo(fileID);

    b2app.getUploadUrl(bucketID);

    b2app.hideFile(bucketID, fileName);

    b2app.listBucket();

    b2app.listFileNames(bucketID, startFileName, maxFileCount);

    b2app.listFileVersions(bucketID, startFileName, startFileId, maxFileCount);

    b2app.updateBucket(bucketID, isPrivateBucket);

    b2app.uploadFile(bucketID, uploadFilePath);


License
----

(c) 2016 nibral
    
Released under MIT License.

[http://opensource.org/licenses/mit-license.php](http://opensource.org/licenses/mit-license.php)