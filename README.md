
# Cloud Computing for Programmers - Lab 01

This README.md file to include instructions on how to run the various scripts you just created (i.e., lint, start, dev, debug).

### Instructions to run the code

1. Clone the repository:

   ```bash
   git clone https://github.com/kanwar1413/fragments.git
   cd fragments
   ```

2. Install dependencies:
   ```bash
   npm init -y //will create package.json
   npm install
   ```
3. Install lint

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

4. Install the packages used

```bash
npm install --save-dev --save-exact prettier
npm install --save pino pino-pretty pino-http
npm install --save express cors helmet compression
npm install --save stoppable
npm install --save-dev nodemon
```

5. Add a lint script to your package.json file to run ESLint from the command line.

```bash
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "lint": "eslint \"./src/**/*.js\""
    },
```

6. Run lint

```bash
  npm run lint
```

---

7. For jq
   Install

```bash
  winget install jqlang.jq
```

Run

```bash
  Remove-Item alias:curl
  curl -s localhost:8080 | jq
```

8. run Through nodemon

```bash
  npm start
  npm run dev
  npm run debug
```
