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
                    docker run --rm \
                      -u root:root \
                      -v "$WORKSPACE":/app \
                      -w /app \
                      node:20-alpine \
                      sh -lc "npm ci && npm test && npm run build"
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    test -n "${VITE_API_BASE_URL}" || { echo "VITE_API_BASE_URL is required"; exit 1; }
                    docker build \
                      --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
                      -t ${IMAGE_TAG} .
                """
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    docker rm -f ${CONTAINER_NAME} || true
                    docker run -d --name ${CONTAINER_NAME} --restart unless-stopped -p 80:80 ${IMAGE_TAG}
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
