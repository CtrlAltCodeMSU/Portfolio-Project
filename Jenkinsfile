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
        
        stage('Package Static Files') {
            steps {
                sh '''
                    mkdir -p lambda-package
                    
                    if [ -d "dist" ]; then
                        cp -r dist/* lambda-package/
                    else
                        echo '<h1>GitProfile Portfolio</h1><p>Static deployment successful!</p>' > lambda-package/index.html
                    fi
                    
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
                        aws s3 cp gitprofile-lambda.zip s3://${S3_BUCKET}/gitprofile-lambda.zip
                        
                        aws cloudformation deploy \
                            --template-file cloudformation.yaml \
                            --stack-name ${STACK_NAME} \
                            --parameter-overrides \
                                S3Bucket=${S3_BUCKET} \
                                S3Key=gitprofile-lambda.zip \
                            --capabilities CAPABILITY_IAM
                        
                        aws cloudformation describe-stacks \
                            --stack-name ${STACK_NAME} \
                            --query 'Stacks[0].Outputs[?OutputKey==`LambdaFunctionUrl`].OutputValue' \
                            --output text
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful! Check AWS Console for Lambda Function URL.'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}