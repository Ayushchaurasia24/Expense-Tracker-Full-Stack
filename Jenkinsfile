pipeline {
    agent any

    stages {
        stage('Clone Repo') {
            steps {
                git branch: 'main', url: 'https://github.com/Ayushchaurasia24/Expense-Tracker-Full-Stack.git'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Start Server') {
            steps {
                dir('backend') {
                    sh 'pm2 restart all || pm2 start npm --name "backend" -- start'
                }
            }
        }
    }
}
