pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --no-audit --no-fund'
            }
        }

        stage('Restart Server') {
            steps {
                sh '''
                pm2 delete backend || true
                pm2 start app.js --name backend
                pm2 save
                '''
            }
        }
    }
}