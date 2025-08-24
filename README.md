# Fragments Microservice - Backend

This repository contains the **Fragments API Server**, a cloud-based microservice that allows authenticated users to create, retrieve, update, delete, and convert small fragments of text, JSON, or images.  

It is designed to run on **AWS (ECS, S3, DynamoDB, Cognito, ECR)** but also supports local development using **Docker Compose** with LocalStack and DynamoDB Local.

---

## Features
- REST API supporting full CRUD operations on fragments
- Stores fragment **metadata** in DynamoDB and **data** in S3
- Supports **text, JSON, YAML, and multiple image formats** (PNG, JPEG, WebP, AVIF, GIF)
- On-the-fly **conversion** between supported formats (e.g., Markdown → HTML, PNG → JPEG)
- Authentication via **Amazon Cognito** (Basic Auth supported for testing)
- **Integration tests** with Hurl + Docker Compose
- **Unit tests + CI/CD** via GitHub Actions
- **CD pipeline** builds & pushes Docker images to Amazon ECR and deploys to ECS

---

## 🛠️ Tech Stack
- **Node.js + Express** (API server)
- **Amazon DynamoDB** (fragments metadata)
- **Amazon S3** (fragments data storage)
- **Amazon Cognito** (authentication)
- **Docker & Docker Compose** (local development)
- **LocalStack + DynamoDB Local** (local integration testing)
- **Hurl** (integration tests)
- **GitHub Actions** (CI/CD workflows)

---


## ⚡ Getting Started

### 1. Clone the repository

   ```bash
   git clone https://github.com/kanwar1413/fragments.git
   cd fragments
   ```
### 2. Setup environment variables

Create a .env file:
```bash
   LOG_LEVEL=debug
   PORT=8080
   #HTPASSWD_FILE=tests/.htpasswd
   
   #AWS Amazon Cognito Client App ID (use your Client App ID)
   AWS_COGNITO_POOL_ID=""
   AWS_COGNITO_CLIENT_ID= ""
   
   API_URL=fragments-lb-1173807981.us-east-1.elb.amazonaws.com
   docker access token : ""
   
   AWS_S3_ENDPOINT_URL=http://localhost:4566
   AWS_ACCESS_KEY_ID=""
   AWS_SECRET_ACCESS_KEY=""
   AWS_SESSION_TOKEN=" "
   AWS_S3_BUCKET_NAME=""

```
### 3. Install dependencies:
   ```bash
   npm init -y //will create package.json
   npm install
   ```
### 4. Install lint

```bash
  npm init @eslint/config@latest
  Need to install the following packages:
  @eslint/create-config@1.3.1

  ✔ How would you like to use ESLint? · problems
  ✔ What type of modules does your project use? · commonjs
  ✔ Which framework does your project use? · none
  ✔ Does your project use TypeScript? · javascript
  ✔ Where does your code run? · node

  eslint, globals, @eslint/js
  ✔ Would you like to install them now? · No / Yes
  ✔ Which package manager do you want to use? · npm
  ☕️Installing...

  added 8 packages, removed 11 packages, changed 12 packages, and audited 224 packages in 2s

  34 packages are looking for funding
    run `npm fund` for details

  2 vulnerabilities (1 moderate, 1 high)

  To address all issues, run:
    npm audit fix

  Run `npm audit` for details.
  Successfully created /Users/humphd/Documents/Seneca/CCP555 DPS955/Fall 2024/fragments/eslint.config.mjs file.

  npm audit fix

```

### 5. Install the packages used

```bash
npm install --save-dev --save-exact prettier
npm install --save pino pino-pretty pino-http
npm install --save express cors helmet compression
npm install --save stoppable
npm install --save-dev nodemon
```

### 6. Add a lint script to your package.json file to run ESLint from the command line.

```bash
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "lint": "eslint \"./src/**/*.js\""
    },
```

### 7. Run lint

```bash
  npm run lint
```

### 8. For jq
   Install

```bash
  winget install jqlang.jq
```

Run

```bash
  Remove-Item alias:curl
  curl -s localhost:8080 | jq
```
### 9. Run locally with Docker Compose
```bash
   docker compose up --build
```

### 10. Run tests
```bash
   # Unit tests
   npm test
   
   # Integration tests with Hurl
   npm run test:integration
```
### 11. run Through nodemon

```bash
  npm start
  npm run dev
  npm run debug
```
