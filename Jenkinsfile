pipeline {
    agent any

    stages {
        stage('Clone Repo') {
            steps {
                git 'https://github.com/Ayushchaurasia24/Expense-Tracker-Full-Stack.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run App') {
            steps {
                sh 'pm2 restart all || pm2 start app.js'
            }
        }
    }
}
