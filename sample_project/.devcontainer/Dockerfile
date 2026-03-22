FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

# Install global dependencies for the project
RUN npm install -g aws-cdk@2.1112.0 typescript@5.9.3


# Ensure node_modules exists and is owned by the node user to avoid permission issues with volumes
RUN mkdir -p /workspaces/iamjaekim.github.io/sample_project/node_modules && \
    chown node:node /workspaces/iamjaekim.github.io/sample_project/node_modules

# Ensure the environment is ready
RUN cdk --version && tsc --version
