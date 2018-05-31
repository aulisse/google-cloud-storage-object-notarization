'use strict';

const OpenTimestamps = require('javascript-opentimestamps');
const Storage = require('@google-cloud/storage');
const storage = new Storage();

exports.objectNotarization = (event, callback) => {
    const f = event.data;
    const context = event.context;

    //print current metadata info
    storage
            .bucket(f.bucket)
            .file(f.name)
            .getMetadata()
            .then((data) => {
                console.log(data);
            })
            .catch(err => {
                console.error('ERROR:', err);
            });

    console.log(`Starting notarization...`);
    const hash = Buffer.from(f.md5Hash, "hex");
    const detached = OpenTimestamps.DetachedTimestampFile.fromBytes(new OpenTimestamps.Ops.OpSHA256(), hash);
    OpenTimestamps.stamp(detached).then(() => {
        console.log(detached);
        const infoResult = OpenTimestamps.info(detached);
        console.log(infoResult);
        console.log(`Notarization completed`);

        console.log(`Writing OTS to object metadata...`);
        storage
                .bucket(f.bucket)
                .file(f.name)
                .setMetadata({metadata: {ots: infoResult}})
                .then(() => {
                    console.log(`OTS written in metadata`);
                    //push metadata in pubsub, ack deadline 10 minutes
                    callback();
                })
                .catch(err => {
                    console.error('ERROR:', err);
                });

    });
};

//triggered but a new message received in pubsub, "google.pubsub.topic.publish"
exports.verifyNotarization = (event, callback) => {
    // if #num_attempt > max_num_attent log the error and return
    // if (now() - pubsub message timestamp < 10 minutes) do nothing (pubsub will redeliver message when the ack deadline expires
    // extract body of the pubsub message and call OpenTimestamps api in order to verify
    // if verification is OK, write confirmation in GCS object metadata and ack pubsub message
    // if verification is KO, increment #num_attempt and push message in pubsub
};
