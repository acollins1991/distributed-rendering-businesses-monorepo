#!/bin/sh
echo "Initializing localstack s3"

# awslocal s3 mb s3://incircl
# awslocal sqs create-queue --queue-name my-app-queue
# awslocal ses verify-email-identity --email-address app@demo.com

# awslocal dynamodb create-table --cli-input-json file://etc/friendly-sites-table-schema.json