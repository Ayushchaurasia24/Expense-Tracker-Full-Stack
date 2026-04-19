pipeline {
    agent any

    stages {

        stage('Deploy to EC2') {
            steps {
                sh '''
                cd /home/ubuntu/Expense-Tracker-Full-Stack

                echo "Pulling latest code..."
                git pull origin main

                echo "Installing dependencies..."
                npm install --no-audit --no-fund

                echo "Restarting server..."
                pm2 restart backend || pm2 start app.js --name backend

                pm2 save
                '''
            }
        }
    }
}