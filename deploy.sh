GCS_BUCKET=bcn
PUBSUB_TOPIC=verification
PUBSUB_SUBSCRIPTION=verification
# create pubsub topic (https://cloud.google.com/sdk/gcloud/reference/alpha/pubsub/topics/create)
# create pubsub subscriber and set ack-deadline(https://cloud.google.com/sdk/gcloud/reference/alpha/pubsub/subscriptions/create)
gcloud beta functions deploy objectNotarization --trigger-resource $GCS_BUCKET --trigger-event google.storage.object.finalize
