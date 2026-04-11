pipeline {
    agent any

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Start Server') {
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