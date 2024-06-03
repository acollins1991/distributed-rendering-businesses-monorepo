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

resource "aws_s3_bucket" "dashboard_source" {
  bucket = local.dashboard_source_bucket_name

  force_destroy = true

  tags = {
    Project = local.project_name
  }
}

resource "aws_s3_object" "dashboard_zip" {
  bucket = aws_s3_bucket.dashboard_source.id
  key    = "source.zip"
  source = local.dashboard_zip_path
  etag   = filemd5(local.dashboard_zip_path)
}


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


resource "aws_iam_role" "ec2_access_role" {
  name = "ec2_access_role"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : {
          "Service" : "ec2.amazonaws.com"
        },
        "Action" : "sts:AssumeRole"
      }
    ]
  })

  inline_policy {
    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Effect" : "Allow",
          "Action" : [
            "s3:GetObject",
            "s3:ListBucket"
          ],
          "Resource" : [
            format("arn:aws:s3:::%s", aws_s3_bucket.dashboard_source.id),
            format("arn:aws:s3:::%s/*", aws_s3_bucket.dashboard_source.id)
          ]
        },
        {
          "Effect" : "Allow",
          "Action" : [
            "*"
          ],
          "Resource" : [
            aws_dynamodb_table.friendly_sites_table.arn
          ]
        }
      ]
    })
  }
}

resource "aws_iam_instance_profile" "ec2_access_profile" {
  name = "ec2_access_profile"
  role = aws_iam_role.ec2_access_role.name
}

resource "aws_security_group" "ec2_access_group" {
  name = "ec2_access_group"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["3.8.37.24/29"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0             # Allow all ports for outbound traffic
    to_port     = 0             # Allow all ports for outbound traffic
    protocol    = "-1"          # Allow all protocols for outbound traffic
    cidr_blocks = ["0.0.0.0/0"] # Allow traffic to any destination
  }
}


resource "aws_instance" "dashboard_server" {
  ami                    = "ami-01f10c2d6bce70d90"
  instance_type          = "t2.micro"
  iam_instance_profile   = aws_iam_instance_profile.ec2_access_profile.name
  vpc_security_group_ids = [aws_security_group.ec2_access_group.id]

  depends_on = [aws_iam_instance_profile.ec2_access_profile, aws_dynamodb_table.friendly_sites_table, aws_s3_object.dashboard_zip]

  user_data_replace_on_change = true

  user_data = <<-EOL
  #!/bin/bash -xe

  # should ensure the ec2 instance is redeployed when the dashboard source changes
  echo ${aws_s3_object.dashboard_zip.etag}

  su ec2-user -c 'aws configure set aws_access_key_id ${local.envs["AWS_ACCESS_KEY_ID"]}'
  su ec2-user -c 'aws configure set aws_secret_access_key ${local.envs["AWS_SECRET_ACCESS_KEY"]}'
  su ec2-user -c 'aws configure set default.region ${local.envs["AWS_REGION"]}'

  su ec2-user -c 'curl -fsSL https://bun.sh/install | bash && export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH"'
  su ec2-user -c 'sudo yum -y install yum-plugin-copr && sudo yum -y copr enable @caddy/caddy epel-7-$(arch) && sudo yum -y install caddy'

  cd /home/ec2-user
  su ec2-user -c 'aws s3 cp s3://${aws_s3_bucket.dashboard_source.id}/source.zip source.zip'
  su ec2-user -c 'unzip source.zip'
  su ec2-user -c 'mkdir dist'
  su ec2-user -c 'mv client/ server/ dist/'
  su ec2-user -c 'bun run dist/server/entry-server.js' & 

  sudo setcap cap_net_bind_service=+ep $(which caddy)
  su ec2-user -c 'caddy reverse-proxy --from :80 --to :3000'

  EOL

  tags = {
    Project = local.project_name
  }
}

### cloudfront and lambda@edge

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

resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  ]
}

data "archive_file" "lambda" {
  type        = "zip"
  source_file = local.lambda_path
  output_path = "dist/lambda_function_payload.zip"
}

resource "aws_lambda_function" "test_lambda" {

  # use us-east-1 region provider
  provider = aws.us-east-1

  filename      = "dist/lambda_function_payload.zip"
  function_name = "lambda_function_name"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "index.handler"

  source_code_hash = data.archive_file.lambda.output_base64sha256

  runtime = "nodejs18.x"

  publish = true
}

resource "aws_s3_bucket_website_configuration" "example" {
  bucket = aws_s3_bucket.dummy_s3_bucket_for_cloudfront_origin.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket" "dummy_s3_bucket_for_cloudfront_origin" {
  bucket = "dummy-s3-bucket-for-cloudfront-origin"
}

locals {
  cloudfront_distribution_origin_id = "cloudfront_distribution_proxy_1234567"
}

resource "aws_cloudfront_distribution" "cloudfront_distribution" {
  depends_on = [aws_lambda_function.test_lambda]

  origin {
    domain_name = aws_s3_bucket.dummy_s3_bucket_for_cloudfront_origin.bucket_domain_name
    origin_id   = local.cloudfront_distribution_origin_id
  }

  enabled = true

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.cloudfront_distribution_origin_id

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    lambda_function_association {
      event_type = "origin-request"
      lambda_arn = aws_lambda_function.test_lambda.qualified_arn
    }

    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "allow-all"
  }


  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  tags = {
    Project                         = local.project_name
    default_cloudfront_distribution = true
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
