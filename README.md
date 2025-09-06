## Overview

This project implements a serverless file management system using **AWS Lambda**, **S3**, and **DynamoDB**, orchestrated via **AWS SAM** for functions and **Terraform** for resource provisioning. It provides:

1. **File Upload** (`/upload` endpoint) – accepts PDFs, CSVs, images, and user metadata.  
2. **Metadata Extraction** – triggered on file upload; extracts file type, size, number of PDF pages, and CSV rows/columns.  
3. **Metadata Retrieval** (`/metadata/{file_id}` endpoint) – retrieves stored metadata by file identifier.

## Decisions Made
- **Terraform for Resource Creation:** S3 bucket, DynamoDB table, and S3 triggers are managed by Terraform, while SAM focuses on Lambda deployment.
- **Authentication & Security**: The API Gateway endpoints currently do **not** implement authentication or authorization. In a production scenario, it is recommended to secure the endpoints using common RESTful authentication methods such as OAuth, JWT validation, etc.

## Challenges Faced
- **Circular Dependencies:** Initially tried defining S3 triggers in SAM, but Lambda/S3 dependencies required Terraform for triggers.  
- **PDF Parsing in Lambda:** The `pdf-parse` library required importing from `/lib` to avoid runtime errors in Lambda.

## Assumptions
- The file uploads are reasonably sized and can fit in Lambda memory (128MB).  
- Users provide basic metadata: `author` and `expirationDate`.  
- CSV files are UTF-8 encoded with a header row optional.  
- Deployment assumes a pre-existing S3 bucket and DynamoDB table (managed by Terraform in the `main.tf` file).  

## Deploy to AWS
1. **SAM Build & Deploy:**  
   ```bash
   sam build
   sam deploy
   ```
2. **Terraform:** S3 bucket, DynamoDB table, and S3 trigger creation
    - Retrieve Metadata Extraction ARN and replace it in the main.tf file
    - Execute terraform commands
    ```bash
    terraform plan
    terraform apply
    ```
