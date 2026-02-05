#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
async function checkDocker() {
    return new Promise((resolve) => {
        const docker = (0, child_process_1.spawn)('docker', ['--version']);
        docker.on('close', (code) => {
            resolve(code === 0);
        });
        docker.on('error', () => {
            resolve(false);
        });
    });
}
async function checkDockerCompose() {
    return new Promise((resolve) => {
        const dockerCompose = (0, child_process_1.spawn)('docker-compose', ['--version']);
        dockerCompose.on('close', (code) => {
            resolve(code === 0);
        });
        dockerCompose.on('error', () => {
            resolve(false);
        });
    });
}
async function startServices() {
    return new Promise((resolve) => {
        const dockerCompose = (0, child_process_1.spawn)('docker-compose', ['up', '-d'], {
            cwd: process.cwd(),
            stdio: 'inherit'
        });
        dockerCompose.on('close', (code) => {
            resolve(code === 0);
        });
        dockerCompose.on('error', () => {
            resolve(false);
        });
    });
}
async function main() {
    console.log('MisyBot AI Agent Platform - Docker Service Startup');
    console.log('================================================\n');
    if (!(0, fs_1.existsSync)('docker-compose.yml')) {
        console.error('❌ docker-compose.yml file not found in current directory');
        console.log('\nPlease make sure you are in the backend-refactor directory');
        return;
    }
    console.log('1. Checking Docker installation...');
    const dockerInstalled = await checkDocker();
    if (!dockerInstalled) {
        console.error('❌ Docker is not installed or not in PATH');
        console.log('\nPlease install Docker Desktop from: https://www.docker.com/products/docker-desktop');
        return;
    }
    console.log('✅ Docker is installed');
    console.log('\n2. Checking Docker Compose installation...');
    const dockerComposeInstalled = await checkDockerCompose();
    if (!dockerComposeInstalled) {
        console.error('❌ Docker Compose is not installed or not in PATH');
        console.log('\nDocker Compose is typically included with Docker Desktop');
        return;
    }
    console.log('✅ Docker Compose is installed');
    console.log('\n3. Starting services with Docker Compose...');
    console.log('(This may take a few minutes on first run as images are downloaded)\n');
    const success = await startServices();
    if (success) {
        console.log('\n✅ Services started successfully!');
        console.log('\nServices are now running in the background:');
        console.log('- PostgreSQL: localhost:5432');
        console.log('- Redis: localhost:6379');
        console.log('- MongoDB: localhost:27017');
        console.log('\nYou can now verify the services with the verification script:');
        console.log('npm run verify-services');
    }
    else {
        console.error('\n❌ Failed to start services');
        console.log('\nPlease check the Docker logs for more information:');
        console.log('docker-compose logs');
    }
}
main().catch(console.error);
//# sourceMappingURL=start-services-docker.js.map