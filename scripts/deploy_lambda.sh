#!/bin/bash
set -e

# Configuration
export AWS_REGION="ap-south-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="mantrios-attachments-${ACCOUNT_ID}"
ROLE_NAME="mantrios-email-poller-role"
FUNCTION_NAME="mantrios-email-poller"

echo "================================================="
echo " Deploying AWS Infrastructure in ${AWS_REGION}"
echo "================================================="

# 1. Create S3 Bucket (if it doesn't exist)
echo "Checking S3 Bucket: ${BUCKET_NAME}..."
if aws s3api head-bucket --bucket "${BUCKET_NAME}" 2>/dev/null; then
    echo "Bucket ${BUCKET_NAME} already exists."
else
    echo "Creating S3 Bucket: ${BUCKET_NAME}..."
    aws s3api create-bucket \
        --bucket "${BUCKET_NAME}" \
        --region "${AWS_REGION}" \
        --create-bucket-configuration LocationConstraint="${AWS_REGION}"
    
    # Block public access
    aws s3api put-public-access-block \
        --bucket "${BUCKET_NAME}" \
        --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
fi

# 2. Create IAM Role for Lambda
echo "Checking IAM Role: ${ROLE_NAME}..."
ROLE_ARN=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    echo "Creating IAM Role: ${ROLE_NAME}..."
    aws iam create-role --role-name "${ROLE_NAME}" \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"Service": "lambda.amazonaws.com"},
                    "Action": "sts:AssumeRole"
                }
            ]
        }' > /dev/null
    
    ROLE_ARN=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.Arn' --output text)
    
    # Attach basic execution policy
    aws iam attach-role-policy --role-name "${ROLE_NAME}" \
        --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        
    echo "Waiting 10 seconds for IAM role to propagate..."
    sleep 10
else
    echo "IAM Role ${ROLE_NAME} already exists."
fi

# 3. Package Lambda Function
echo "Packaging Lambda function..."
cd backend/lambda_email_poller
zip -r lambda_function.zip lambda_function.py
cd ../../

# 4. Deploy Lambda Function
echo "Checking Lambda Function: ${FUNCTION_NAME}..."
if aws lambda get-function --function-name "${FUNCTION_NAME}" >/dev/null 2>&1; then
    echo "Updating existing Lambda function code..."
    aws lambda update-function-code \
        --function-name "${FUNCTION_NAME}" \
        --zip-file fileb://backend/lambda_email_poller/lambda_function.zip > /dev/null
else
    echo "Creating new Lambda function: ${FUNCTION_NAME}..."
    aws lambda create-function \
        --function-name "${FUNCTION_NAME}" \
        --runtime python3.12 \
        --role "${ROLE_ARN}" \
        --handler lambda_function.lambda_handler \
        --timeout 90 \
        --memory-size 256 \
        --zip-file fileb://backend/lambda_email_poller/lambda_function.zip > /dev/null
fi

echo "Updating Lambda environment variables..."
aws lambda update-function-configuration \
    --function-name "${FUNCTION_NAME}" \
    --environment "Variables={API_ENDPOINT=https://REPLACE_WITH_YOUR_DOMAIN/api/v1/email_webhook/process-email,IMAP_SERVER=imap.gmail.com,IMAP_PORT=993,IMAP_USER=REPLACE_ME,IMAP_PASSWORD=REPLACE_ME}" > /dev/null

echo "================================================="
echo " Deployment Complete!"
echo " Next steps:"
echo " 1. Configure the IMAP environment variables in the AWS Lambda console."
echo " 2. Add an EventBridge 1-minute schedule trigger."
echo " 3. Update your local backend/.env to include S3_BUCKET_NAME=${BUCKET_NAME}"
echo "================================================="
