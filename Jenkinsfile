pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME = 'dernier-metro-front'
        CONTAINER_NAME = 'dernier-metro-front'
        IMAGE_TAG = "${APP_NAME}:${BUILD_NUMBER}"
        VITE_API_BASE_URL = credentials('VITE_API_BASE_URL')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend Checks') {
            steps {
                sh '''
                    WS=$(pwd)
                    docker run --rm \
                      -u root:root \
                      -v "$WS:/app" \
                      -w /app \
                      node:20-alpine \
                      sh -c "npm ci && npm run build"
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build \
                      --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
                      -t ${IMAGE_TAG} .
                """
            }
        }

        stage('Deploy') {
            when {
                expression { env.GIT_BRANCH == 'origin/main' }
            }
            steps {
                sh """
                    docker rm -f ${CONTAINER_NAME} || true
                    docker run -d \
                      --name ${CONTAINER_NAME} \
                      --restart unless-stopped \
                      -p 80:80 \
                      ${IMAGE_TAG}
                """
            }
        }
    }

    post {
        success {
            echo "Build #${env.BUILD_NUMBER} completed successfully."
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed."
        }
    }
}
