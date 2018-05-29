'use strict';

const OpenTimestamps = require('javascript-opentimestamps');

/**
 * https://cloud.google.com/functions/docs/calling/storage
 * https://github.com/opentimestamps/javascript-opentimestamps/blob/master/README.md
 */
exports.objectNotarization = (event, callback) => {
    const f = event.data;
    const context = event.context;

    //input file information
    console.log(`Event ${context.eventId}`);
    console.log(`Event Type: ${context.eventType}`);
    console.log(`Bucket: ${f.bucket}`);
    console.log(`File: ${f.name}`);
    console.log(`Metageneration: ${f.metageneration}`);
    console.log(`Created: ${f.timeCreated}`);
    console.log(`Updated: ${f.updated}`);
    console.log(`md5hash: ${f.md5Hash}`);
    console.log(`Function ended`);

    console.log(`Starting notarization...`);

    const hash = Buffer.from(f.md5Hash);
    const detached = OpenTimestamps.DetachedTimestampFile.fromHash(new OpenTimestamps.Ops.OpSHA256(), [hash]);
    OpenTimestamps.stamp(detached).then(() => {
        console.log(`done`);
        console.log(detached);
        //no need to write file. Content is logged and could be saved in file metadata
        //const fileOts = detached.serializeToBytes();
        const infoResult = OpenTimestamps.info(detached);
        console.log(infoResult);

        console.log(`Notarization completed`);
    });

    callback();
};

/*var propValue;
 for(var propName in f) {
 propValue = f[propName]

 console.log(propName,propValue);
 }*/
