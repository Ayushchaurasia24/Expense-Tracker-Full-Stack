pipeline {
    agent any

    stages {
        stage('Install Backend Dependencies') {
            steps {
                sh 'cd backend && npm install'
            }
        }

        stage('Start Server') {
            steps {
                sh '''
                cd backend
                pm2 delete backend || true
                pm2 start npm --name "backend" -- start
                '''
            }
        }
    }
}
