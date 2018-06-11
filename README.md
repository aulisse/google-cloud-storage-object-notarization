# Google Cloud Storage Object Notarization

The purpose of this project is to provide a Google Cloud Storage user with a system that allows to notarize _every_ object uploaded in a specific bucket.

Notarization (also known as timestamping) is a powerful non-monetary blockchain application, consisting of trustless timestamping of documents or anchoring of arbitrarily large data sets.

A generic data file can be hashed to produce a short unique identifier, equivalent to its digital fingerprint. Such a fingerprint can be associated to a Bitcoin transaction (or any other kind of blockchain transaction), the bitcoin amount being irrelevant, and hence registered on the blockchain. The immutability of this hash commitment on the blockchain provides the data file owner with a robust means of non-repudiable timestamping and the ability to exhibit the file at a later time and prove without a doubt that its content has not changed i.e. by comparing the hash of the exhibited file to the hash notarized on the blockchain. 

Of course the notarization process is as reliable as the used blockchain, with the bitcoin one being the most secure. The generic notarization process has been standardized as [OpenTimestamps](https://opentimestamps.org/) to achieve third party auditable verification.

# License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# Requirements:
- [a Google Cloud Platform (GCP) account](https://cloud.google.com/free/)
- [a GCP project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project)
- [gcloud](https://cloud.google.com/sdk/downloads). Alternatevely, you can use the [Cloud Shell](https://cloud.google.com/shell/docs/starting-cloud-shell)

# How to deploy
- create a bucket on Google Cloud Storage (GCS)
- clone this project
- configure the name of the bucket in deploy.sh
- run deploy.sh

# How does it work
- upload a file on GCS
- the Google Cloud Function (GCF) _objectNotarization_ is triggered by 'new object on GCS' event
- the GCF _objectNotarization_ invokes the file notarization using OpenTimestamps API
- the GCF _objectNotarization_ receives a callback with the temporary notarization receipt, which is then written in the GCS object metadata. This receipt is temporary as the notarization does not happen instantly: the OpenTimestamps calendars will eventually finalize notarization when an actual bitcoin transaction including the Merkle root of all submitted documents will be included in the bitcoin blockchain  
- the GCF _upgradeNotarization_ is called when a metadata of the file object changes, e.g. after 24 hours from upload the object will be set from Regional to Nearline. This is used to upgrade the receipt to its final status

# Useful links
- [OpenTimestamps API](https://opentimestamps.org/)
- [Google Cloud Storage - Google Cloud Functions integration examples](https://cloud.google.com/functions/docs/tutorials/storage)
- [Google Cloud Functions Local Emulator](https://cloud.google.com/functions/docs/emulator)
- [Google Cloud Storage NodeJS client Library](https://cloud.google.com/storage/docs/reference/libraries#client-libraries-install-nodejs)
- [Google Cloud Storage Metadata Editing](https://cloud.google.com/storage/docs/viewing-editing-metadata)
- [API for metadata update](https://cloud.google.com/storage/docs/json_api/v1/objects/update) and [NodeJS client method](https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/File#setMetadata)
- [Background Functions Callback Parameter](https://cloud.google.com/functions/docs/writing/background#callback_parameter)
