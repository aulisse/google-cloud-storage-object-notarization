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
            //push metadata in pubsub, specifying #num_attempt=0
            callback();
          })
          .catch(err => {
            console.error('ERROR:', err);
          });

      });
    });
};

//triggered by a new message received in pubsub, event "google.pubsub.topic.publish"
exports.verifyNotarization = (event, callback) => {
    // if #num_attempt > max_num_attempt then log the error, set "failed" in object metadata and return
    // if (now() - pubsub message timestamp < 10 minutes) do nothing (pubsub will redeliver message when the ack deadline expires, that is after 10 minutes) and return
    // extract body of the pubsub message and call OpenTimestamps api in order to verify
    // if verification is OK, write confirmation in GCS object metadata, ack pubsub message and return
    // if verification is KO, increment #num_attempt, push message in pubsub and return
};
