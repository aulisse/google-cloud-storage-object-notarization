GCS_BUCKET=bcn

#deploy cloud functions
gcloud beta functions deploy objectNotarization --trigger-resource $GCS_BUCKET --trigger-event google.storage.object.finalize
gcloud beta functions deploy upgradeNotarization --trigger-resource $GCS_BUCKET --trigger-event google.storage.object.metadataUpdate

#set bucket rule for lifecycle management
gsutil lifecycle set lifecycle_config_file gs://$GCS_BUCKET
