pipeline {
  agent any
  environment {
    NODE_ENV = 'test'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              node --version
              npm --version
              npm ci
            '''
          } else {
            // Windows (cmd)
            bat '''
              node --version
              npm --version
              npm ci
            '''
          }
        }
      }
    }

    stage('Test') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              mkdir -p reports
              npm test
            '''
          } else {
            // Windows (cmd) - create folder if not exists, then run tests
            bat '''
              if not exist reports mkdir reports
              npm test
            '''
          }
        }
      }
    }

    stage('Archive') {
      steps {
        archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
      }
    }
  }

  post {
    always {
      // publish test results (jenkins expects junit xml)
      junit 'reports/junit.xml'
      cleanWs()
    }
  }
}
