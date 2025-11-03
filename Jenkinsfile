pipeline {
    agent any
    
    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        AWS_CREDENTIALS_ID = 'aws-credentials'
        S3_BUCKET = 'gitprofile-lambda-deployment'
        STACK_NAME = 'gitprofile-stack'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Node.js & Dependencies') {
            steps {
                sh '''
                    # Install Node.js if not present
                    if ! command -v node &> /dev/null; then
                        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                        sudo yum install -y nodejs
                    fi
                    
                    node --version
                    npm --version
                    npm ci
                '''
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Package for Lambda') {
            steps {
                sh '''
                    mkdir -p lambda-package
                    cp -r dist/* lambda-package/
                    cp lambda/index.js lambda-package/
                    cd lambda-package
                    zip -r ../gitprofile-lambda.zip .
                '''
            }
        }
        
        stage('Deploy to AWS') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: env.AWS_CREDENTIALS_ID]]) {
                    sh '''
                        # Upload to S3
                        aws s3 cp gitprofile-lambda.zip s3://${S3_BUCKET}/gitprofile-lambda.zip
                        
                        # Deploy CloudFormation stack
                        aws cloudformation deploy \
                            --template-file cloudformation.yaml \
                            --stack-name ${STACK_NAME} \
                            --parameter-overrides \
                                S3Bucket=${S3_BUCKET} \
                                S3Key=gitprofile-lambda.zip \
                            --capabilities CAPABILITY_IAM
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}