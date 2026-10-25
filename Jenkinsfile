pipeline {
    agent any

    parameters {
        string(name: 'DOCKERHUB_USERNAME', defaultValue: '', description: 'Docker Hub username')
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

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
                echo 'Next.js standalone build completed.'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    def dockerHubUsername = params.DOCKERHUB_USERNAME.trim()
                    if (!dockerHubUsername) {
                        error('Set the DOCKERHUB_USERNAME pipeline parameter.')
                    }
                    env.GIT_SHORT_SHA = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    env.IMAGE_NAME = "${dockerHubUsername}/justneedmotivation"
                }
                sh 'docker build -t "$IMAGE_NAME:$GIT_SHORT_SHA" -t "$IMAGE_NAME:latest" .'
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                    sh '''
                        set +x
                        trap 'docker logout >/dev/null 2>&1 || true' EXIT
                        printf '%s' "$DOCKERHUB_PASSWORD" | docker login --username "$DOCKERHUB_USER" --password-stdin
                        docker push "$IMAGE_NAME:$GIT_SHORT_SHA"
                        docker push "$IMAGE_NAME:latest"
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        kubectl --namespace justneedmotivation set image deployment/justneedmotivation justneedmotivation="$IMAGE_NAME:$GIT_SHORT_SHA"
                        if ! kubectl --namespace justneedmotivation rollout status deployment/justneedmotivation --timeout=180s; then
                            kubectl --namespace justneedmotivation rollout undo deployment/justneedmotivation
                            kubectl --namespace justneedmotivation rollout status deployment/justneedmotivation --timeout=180s
                            exit 1
                        fi
                    '''
                }
            }
        }
    }

    post {
        always {
            deleteDir()
        }
    }
}