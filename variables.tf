locals {
  envs                         = { for tuple in regexall("(.*)=(.*)", file(".env")) : tuple[0] => sensitive(tuple[1]) }
  dashboard_source_bucket_name = "dashboard-source-bucket"
  dashboard_zip_path           = "${path.module}/dist/dashboard.zip"
  project_name                 = "DistributedRendererSaas"
}
