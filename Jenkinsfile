pipeline {
  agent {
    docker { image 'node:18' args '-u root:root' }
  }

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
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        // if you have a build step (e.g., transpile), put it here. otherwise this can be a no-op.
        echo 'No build step for this simple app'
      }
    }

    stage('Test') {
      steps {
        // Ensure reports dir exists
        sh 'mkdir -p reports'
        // Run tests (jest configured to write reports/junit.xml)
        sh 'npm test'
      }
    }

    stage('Archive') {
      steps {
        // archive the test reports and optionally the app (e.g., zipped)
        archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
      }
    }
  }

  post {
    always {
      // Publish JUnit test results to Jenkins (this will show test stats in the UI)
      junit allowEmptyResults: false, testResults: 'reports/junit.xml'

      // Optional: clean workspace
      cleanWs()
    }

    success {
      echo 'Pipeline succeeded!'
    }

    failure {
      echo 'Pipeline failed!'
    }
  }
}
