locals {
  envs                         = { for tuple in regexall("(.*)=(.*)", file(".env")) : tuple[0] => sensitive(tuple[1]) }

  api_handler_source_bucket_name = "api-handler-source-bucket"
  api_handler_source_dir       = "${path.module}/dist/api"
  api_name                     = "DistributedRendererApi"

  lambda_path                  = "${path.module}/dist/cloudfront-renderer/index.mjs"
  project_name                 = "DistributedRendererSaas"
}
