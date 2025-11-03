# Jenkins Setup for GitProfile AWS Deployment

## Prerequisites

1. **Jenkins Server** running on AWS EC2
2. **AWS CLI** installed on Jenkins server
3. **Node.js** installed on Jenkins server
4. **S3 Bucket** for Lambda deployment packages

## Jenkins Configuration

### 1. Install Required Plugins
- AWS Steps Plugin
- Pipeline Plugin
- Git Plugin
- NodeJS Plugin

### 2. Configure AWS Credentials
1. Go to Jenkins → Manage Jenkins → Manage Credentials
2. Add AWS credentials with ID: `aws-credentials`
3. Use your AWS Access Key ID and Secret Access Key

### 3. Configure NodeJS
1. Go to Jenkins → Manage Jenkins → Global Tool Configuration
2. Add NodeJS installation (version 18+)

### 4. Create S3 Bucket
```bash
aws s3 mb s3://gitprofile-lambda-deployment --region us-east-1
```

### 5. Create Jenkins Pipeline Job
1. New Item → Pipeline
2. Configure GitHub webhook trigger
3. Set Pipeline script from SCM
4. Repository URL: your GitHub repo
5. Script Path: Jenkinsfile

## GitHub Webhook Setup

1. Go to your GitHub repository → Settings → Webhooks
2. Add webhook:
   - Payload URL: `http://your-jenkins-server:8080/github-webhook/`
   - Content type: `application/json`
   - Events: Push events

## Environment Variables (Update in Jenkinsfile)

```groovy
environment {
    AWS_DEFAULT_REGION = 'us-east-1'           // Your AWS region
    AWS_CREDENTIALS_ID = 'aws-credentials'      // Jenkins credential ID
    S3_BUCKET = 'gitprofile-lambda-deployment' // Your S3 bucket
    STACK_NAME = 'gitprofile-stack'            // CloudFormation stack name
}
```

## Deployment Process

1. Push code to GitHub
2. Webhook triggers Jenkins build
3. Jenkins builds the React app
4. Packages for Lambda deployment
5. Uploads to S3
6. Deploys via CloudFormation
7. Lambda Function URL provides access

## Access Your Deployed App

After successful deployment, check CloudFormation outputs for the Lambda Function URL.