terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {    
  profile = "default"    
  region = "us-east-1"
}

###########################
# S3 Bucket
###########################
resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "file_bucket" {
  bucket        = "file-manager-bucket-${random_id.suffix.hex}"
}

###########################
# DynamoDB Table
###########################
resource "aws_dynamodb_table" "metadata_table" {
  name         = "file-manager-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "file_id"

  attribute {
    name = "file_id"
    type = "S"
  }
}

###########################
# S3 Trigger for Lambda
###########################
resource "aws_lambda_permission" "extractor_s3_permission" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = "arn:aws:lambda:us-east-1:326648945718:function:extract-metadata-lambda"
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.file_bucket.arn
}

# S3 bucket notification
resource "aws_s3_bucket_notification" "extractor_trigger" {
  bucket = aws_s3_bucket.file_bucket.id

  depends_on = [aws_lambda_permission.extractor_s3_permission]

  lambda_function {
    lambda_function_arn = "arn:aws:lambda:us-east-1:326648945718:function:extract-metadata-lambda"
    events              = ["s3:ObjectCreated:*"]
  }
}