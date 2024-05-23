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

# resource "aws_instance" "dashboard" {
#   # Custom image; Amazon Linux Image with Bun v1.1.9 installed
#   ami           = "ami-01b3ce625b22aa148"
#   instance_type = "t2.micro"

#   tags = {
#     Project = local.project_name
#   }
# }

resource "aws_s3_bucket" "dashboard_source" {
  bucket = local.dashboard_source_bucket_name

  force_destroy = true

  tags = {
    Project = local.project_name
  }
}

resource "aws_s3_object" "dashboard_zip" {
  bucket = aws_s3_bucket.dashboard_source.id
  key    = "${local.dashboard_source_bucket_name}_source"
  source = local.dashboard_zip_path
  etag   = filemd5(local.dashboard_zip_path)
}
