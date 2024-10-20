terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region     = local.envs["AWS_REGION"]
  access_key = local.envs["AWS_ACCESS_KEY_ID"]
  secret_key = local.envs["AWS_SECRET_ACCESS_KEY"]
}

# needed for lambda@edge as these can only be deployed to us-east-1 region
provider "aws" {
  alias      = "us-east-1"
  region     = "us-east-1"
  access_key = local.envs["AWS_ACCESS_KEY_ID"]
  secret_key = local.envs["AWS_SECRET_ACCESS_KEY"]
}

## DynamoDB table

resource "aws_dynamodb_table" "friendly_sites_table" {
  name         = "friendly_sites"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "gsi1pk"
    type = "S"
  }

  attribute {
    name = "gsi1sk"
    type = "S"
  }

  global_secondary_index {
    name            = "gsi1pk-gsi1sk-index"
    hash_key        = "gsi1pk"
    range_key       = "gsi1sk"
    projection_type = "ALL"
  }

  tags = {
    Project = local.project_name
  }
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type = "Service"
      identifiers = [
        "edgelambda.amazonaws.com",
        "lambda.amazonaws.com",
      ]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "iam_for_table_access" {
  name               = "iam_for_lambda_table_access"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  ]
}

## API Lambda handler and gateway

data "archive_file" "api_handler_source_zip" {
  type        = "zip"
  source_dir = local.api_handler_source_dir
  output_path = local.api_handler_source_output
}

resource "aws_s3_bucket" "api_handler_source" {
  bucket = local.api_handler_source_bucket_name

  force_destroy = true

  depends_on = [ data.archive_file.api_handler_source_zip ]

  tags = {
    Project = local.project_name
  }
}

resource "aws_s3_object" "api_handler_source_zip" {
  bucket = aws_s3_bucket.api_handler_source.id
  key    = local.api_handler_zip_filename
  source = local.api_handler_source_output
  etag = filemd5(local.api_handler_source_output)
  depends_on = [ data.archive_file.api_handler_source_zip ]
}

resource "aws_lambda_function" "api_handler" {
  function_name = "DistributedRendererApi"

  # The bucket name as created earlier with "aws s3api create-bucket"
  s3_bucket = aws_s3_bucket.api_handler_source.id
  s3_key    = local.api_handler_zip_filename

  handler = "handler.handler"
  runtime = "provided.al2"
  layers = [ "arn:aws:lambda:eu-west-2:258587214769:layer:bun:2" ]

  role = "${aws_iam_role.iam_for_table_access.arn}"

  depends_on = [ aws_s3_object.api_handler_source_zip ]
}

### cloudfront and lambda@edge

# data "archive_file" "lambda" {
#   type        = "zip"
#   source_file = local.lambda_path
#   output_path = "dist/lambda_function_payload.zip"
# }

# resource "aws_lambda_function" "test_lambda" {

#   # use us-east-1 region provider
#   provider = aws.us-east-1

#   filename      = "dist/lambda_function_payload.zip"
#   function_name = "lambda_function_name"
#   role          = aws_iam_role.iam_for_lambda.arn
#   handler       = "index.handler"

#   source_code_hash = data.archive_file.lambda.output_base64sha256

#   runtime = "nodejs18.x"

#   publish = true
# }

# resource "aws_s3_bucket_website_configuration" "example" {
#   bucket = aws_s3_bucket.dummy_s3_bucket_for_cloudfront_origin.id

#   index_document {
#     suffix = "index.html"
#   }

#   error_document {
#     key = "error.html"
#   }
# }

# resource "aws_s3_bucket" "dummy_s3_bucket_for_cloudfront_origin" {
#   bucket = "dummy-s3-bucket-for-cloudfront-origin"
# }

# locals {
#   cloudfront_distribution_origin_id = "cloudfront_distribution_proxy_1234567"
# }

# resource "aws_route53_record" "cloudfront_alias_record" {
#   zone_id = "Z08252061K6DE4BQKWVWJ"
#   name    = "*.pagegenerator.link"
#   type    = "A"

#   alias {
#     # name                   = aws_elb.main.dns_name
#     # zone_id                = aws_elb.main.zone_id
#     name                   = aws_cloudfront_distribution.cloudfront_distribution.domain_name
#     zone_id                = aws_cloudfront_distribution.cloudfront_distribution.hosted_zone_id
#     evaluate_target_health = true
#   }
# }

# resource "aws_cloudfront_distribution" "cloudfront_distribution" {
#   depends_on = [aws_lambda_function.test_lambda]

#   aliases = ["pagegenerator.link", "*.pagegenerator.link"]

#   origin {
#     # custom_origin_config {
#     #   http_port              = 80
#     #   https_port             = 443
#     #   origin_protocol_policy = "match-viewer"
#     #   origin_ssl_protocols   = ["TLSv1.2"]
#     # }
#     domain_name = aws_s3_bucket.dummy_s3_bucket_for_cloudfront_origin.bucket_domain_name
#     origin_id   = local.cloudfront_distribution_origin_id
#   }

#   enabled = true

#   http_version = "http2"

#   default_cache_behavior {
#     allowed_methods  = ["GET", "HEAD", "OPTIONS"]
#     cached_methods   = ["GET", "HEAD", "OPTIONS"]
#     target_origin_id = local.cloudfront_distribution_origin_id

#     forwarded_values {
#       query_string = false
#       cookies {
#         forward = "none"
#       }
#       headers = ["Host"]
#     }

#     lambda_function_association {
#       event_type = "origin-request"
#       lambda_arn = aws_lambda_function.test_lambda.qualified_arn
#     }

#     min_ttl                = 0
#     default_ttl            = 86400
#     max_ttl                = 31536000
#     compress               = true
#     viewer_protocol_policy = "allow-all"
#   }


#   restrictions {
#     geo_restriction {
#       restriction_type = "none"
#       locations        = []
#     }
#   }

#   tags = {
#     Project                         = local.project_name
#     default_cloudfront_distribution = true
#   }

#   viewer_certificate {
#     acm_certificate_arn      = "arn:aws:acm:us-east-1:258587214769:certificate/bf050f0d-fcc2-4a2f-838a-7963f0c8ce69"
#     minimum_protocol_version = "TLSv1.2_2021"
#     ssl_support_method       = "sni-only"
#   }
# }
