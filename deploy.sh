GCS_BUCKET=bcn
GCS_TOPIC=verification
GCS_SUBSCRIPTION=verification
#create pubsub topic and pubsub subscriber
gcloud beta functions deploy objectNotarization --trigger-resource $GCS_BUCKET --trigger-event google.storage.object.finalize
