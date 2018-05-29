GCS_BUCKET=bcn
gcloud beta functions deploy objectNotarization --trigger-resource $GCS_BUCKET --trigger-event google.storage.object.finalize
