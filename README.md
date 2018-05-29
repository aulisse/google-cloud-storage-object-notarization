# google-cloud-storage-object-notarization

The purpose of this project is to provide a Google Cloud Storage user with a system that allows to notarize every object uploaded in a specific bucket.

# Requirements:
- [a GCP account](https://cloud.google.com/free/)
- [a GCP project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project)
- [gcloud](https://cloud.google.com/sdk/downloads). Alternatevely, you can use the [Cloud Shell](https://cloud.google.com/shell/docs/starting-cloud-shell)

# How to deploy
- create a bucket on Google Cloud Storage
- clone this project
- configure the name of the bucket in deploy.sh
- run deploy.sh

# Useful links
- [OpenTimestamps API](https://opentimestamps.org/)
- [Google Cloud Storage - Google Cloud Functions integration examples](https://cloud.google.com/functions/docs/tutorials/storage)
- [Google Cloud Functions Local Emulator](https://cloud.google.com/functions/docs/emulator)
- [Google Cloud Storage NodeJS client Library](https://cloud.google.com/storage/docs/reference/libraries#client-libraries-install-nodejs)
- [Google Cloud Storage Metadata Editing](https://cloud.google.com/storage/docs/viewing-editing-metadata)
- [API for metadata update](https://cloud.google.com/storage/docs/json_api/v1/objects/update) and [NodeJS client method](https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/File#setMetadata)
