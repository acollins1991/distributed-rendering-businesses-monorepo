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

resource "aws_instance" "app_server" {
  ami           = "ami-830c94e3"
  instance_type = "t2.micro"

  tags = {
    Project = "DistributedRendererSaas"
  }
}
