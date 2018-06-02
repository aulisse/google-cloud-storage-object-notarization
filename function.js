'use strict';

const OpenTimestamps = require('javascript-opentimestamps');
const Storage = require('@google-cloud/storage');
const crypto = require('crypto');
const storage = new Storage();

exports.objectNotarization = (event, callback) => {
  const hasher = crypto.createHash('sha256');
  const f = event.data;
  const stream = storage.bucket(f.bucket).file(f.name).createReadStream();

  stream
    .on('data', function(chunk) {
      console.log(`Received ${chunk.length} bytes of data.`);
      hasher.update(chunk);
    })
    .on('end', function() {
      console.log("end!");
      const hash = hasher.digest();
      const hash_hex = hash.toString('hex');
      console.log(`hash is ${hash_hex}`);
      var hash_array = [hash.length];   //ask Luca
      for (var i = 0; i < hash.length; ++i) {
        hash_array[i] = hash[i];
      }
      const detached = OpenTimestamps.DetachedTimestampFile.fromHash(new OpenTimestamps.Ops.OpSHA256(), hash_array);
      OpenTimestamps.stamp(detached).then(() => {
        console.log(`Notarization completed`);

        const ots_base64 = Buffer.from(detached.serializeToBytes()).toString('base64');

        console.log(`Writing OTS to object metadata...`);
        storage
          .bucket(f.bucket)
          .file(f.name)
          .setMetadata({metadata: {ots: ots_base64, sha256: hash_hex}})
          .then(() => {
            console.log(`OTS written in metadata`);
            callback();
          })
          .catch(err => {
            console.error('ERROR:', err);
          });

      });
    });
};

//This function will be called when a metadata of the object changes
//After 24 hours from upload the object will be set from Regional to Nearline, metadata will change and verification can be done
//This function will be called even when the OTS will be written on file upload, such case should be checked
exports.verifyNotarization = (event, callback) => {

    //check if ots metadata are eligible for verification attempt

    const f = event.data;
    console.log(`Receiving a file uploaded 24 hours ago: ${f.name}`);
    
    callback();
};
