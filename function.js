'use strict';

const OpenTimestamps = require('javascript-opentimestamps');
const Storage = require('@google-cloud/storage');
const crypto = require('crypto');
const storage = new Storage();

const MESSAGE_COMPLETED = 'Timestamp already completed';
const MESSAGE_NOT_UPGRADED = 'Timestamp not upgraded';

const STATUS_UPGRADE_NEEDED = 'UPGRADE_NEEDED';
const STATUS_COMPLETED = 'COMPLETED';
const STATUS_FAILED = 'FAILED';

//this function will be called when a new object is uploaded in the GCS bucket
//it computes sha256 and then starts the notarization process
exports.objectNotarization = (event, callback) => {
  const hasher = crypto.createHash('sha256');
  const f = event.data;
  const stream = storage.bucket(f.bucket).file(f.name).createReadStream();

  stream
    .on('data', function(chunk) {
      //console.log(`Received ${chunk.length} bytes of data.`);
      hasher.update(chunk);
    })
    .on('end', function() {
      //console.log("end!");
      const hash = hasher.digest();
      const hash_hex = hash.toString('hex');
      console.log(`sha256 is ${hash_hex}`);
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
          .setMetadata({metadata: {ots: ots_base64, sha256: hash_hex, status: STATUS_UPGRADE_NEEDED}})
          .then(() => {
            console.log(`OTS written in metadata`);
            callback();
          })
          .catch(err => {
            console.error('ERROR:', err);
            callback();
          });

      });
    });
};


//This function will be called when a metadata of the object changes
//After 24 hours from upload the object will be set from Regional to Nearline, metadata will change and upgrade can be attempted
//This function will be called every time an object metadata changes, thus upgrade eligibility must be checked
exports.upgradeNotarization = (event, callback) => {

	const f = event.data;
	console.log(`Detected a metadata modification in file: ${f.name}, access object metadata to check eligibility for upgrade`);

	var detachedOts = {};
        storage
		.bucket(f.bucket)
		.file(f.name)
		.getMetadata()
		.then((results) => {
                        console.log("Reading object metadata...");
			const metadata = results[0].metadata;
			const ots_base64 = metadata.ots;
                        //console.log(`got metadata ots is ${ots_base64}`);
			const ots = Buffer.from(ots_base64, 'base64');
			detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(ots);
			if (detachedOts.timestamp.isTimestampComplete ()){
                                console.log("Timestamp completed, no need to upgrade");
				throw new Error(MESSAGE_COMPLETED);
			}
			return OpenTimestamps.upgrade(detachedOts);
		})
		.then((changed) => {
			if(!changed){
                                console.log("Timestamp not eligible for upgrade");
				throw new Error(MESSAGE_NOT_UPGRADED);
			}
			console.log('Timestamp upgraded, writing upgraded ots in object metadata');
			const ots_base64 = Buffer.from(detachedOts.serializeToBytes()).toString('base64');
			return storage
				.bucket(f.bucket)
				.file(f.name)
				.setMetadata({metadata: {ots: ots_base64, status: STATUS_COMPLETED}});
		})
		.then(() => {
			console.log(`OTS written in metadata`);
			callback();
		})
		.catch(err => {
			if (err.message === MESSAGE_COMPLETED){
				callback(null, err.message);
			} else if (err.message === MESSAGE_NOT_UPGRADED){
				callback(null, err.message);
			} else {
				console.error('ERROR:', err);
				callback(1);
			}
		});
};
