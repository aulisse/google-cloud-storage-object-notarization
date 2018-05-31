GCS_BUCKET=bcn
GCS_TOPIC=verification
GCS_SUBSCRIPTION=verification
# create pubsub topic 
# create pubsub subscriber and set ack-deadline
gcloud beta functions deploy objectNotarization --trigger-resource $GCS_BUCKET --trigger-event google.storage.object.finalize
