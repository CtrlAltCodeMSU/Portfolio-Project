pipeline {
    agent any
    
    environment {
        AWS_DEFAULT_REGION = 'us-east-1'  // Change to your region
        AWS_CREDENTIALS_ID = 'aws-credentials'
        S3_BUCKET = 'gitprofile-lambda-deployment'  // Change to your bucket name
        STACK_NAME = 'gitprofile-stack'
        NODEJS_HOME = tool 'NodeJS-18'
        PATH = "${NODEJS_HOME}/bin:${PATH}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
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
        always {
            cleanWs()
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}