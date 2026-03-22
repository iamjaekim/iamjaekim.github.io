FROM mcr.microsoft.com/devcontainers/javascript-node:1-24-bookworm

# Install global dependencies for the project
RUN npm install -g aws-cdk@2.1112.0 typescript@5.9.3


# Ensure the environment is ready
RUN cdk --version && tsc --version
