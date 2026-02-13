# Docker Lab 001: Running a Node.js Project — Observing Errors

This lab introduces the Quotes API Node.js application and guides you through attempts to run it. You will observe common errors that occur when dependencies are missing or the environment is not properly set up.

## Prerequisites

- Node.js installed on your system (check with `node --version`)
- Terminal or command line access

---

## Project Overview

The `lab-01` directory contains a simple Express.js application (`app.js`) that exposes a Quotes API with the following endpoints:

| Endpoint | Description |
|----------|-------------|
| `/` | Welcome message and API info |
| `/quotes` | Returns a list of inspirational quotes |
| `/health` | Health check for the server |

---

## Step 1: Navigate to the Project Directory

```bash
cd lab-01
```

---

## Step 2: Inspect the Project Contents

```bash
ls -la
```

**What you'll see:**

- `app.js` — The application source code
- No `package.json` — Dependencies are not declared
- No `node_modules` — Dependencies are not installed

---

## Step 3: Try to Run the Application

Attempt to run the application directly with Node.js:

```bash
node app.js
```

---

## Step 4: Observe the Error

**Expected output (error):**

```
Error: Cannot find module 'express'
```

Or a similar message such as:

```
node:internal/modules/cjs/loader:1080
  throw err;
  ^

Error: Cannot find module 'express'
    at Object.<anonymous> (/path/to/lab-01/app.js:1:15)
    ...
```

---

## Step 5: Understand What Went Wrong

The application fails because:

1. **The `express` module is required** — The first line of `app.js` is `const express = require('express')`. Node.js looks for this module in `node_modules/`.

2. **No `package.json`** — There is no manifest declaring dependencies, so `npm install` cannot be run.

3. **No `node_modules`** — Even with a `package.json`, you would need to run `npm install` to download dependencies into `node_modules/`.

**Summary:** The code depends on external packages (Express) that are not installed. Without a proper setup (package.json + npm install), the application cannot run.

---

## Step 6: Try Running `npm install` (Optional)

If you run `npm install` without a `package.json`:

```bash
npm install
```

**Expected result:** npm may create a minimal `package.json`, but it won't know to install Express. Running `node app.js` afterward will still fail.

---

## What You Have Learned

| Issue | Cause | Solution (covered in later labs) |
|-------|-------|----------------------------------|
| `Cannot find module 'express'` | Dependencies not installed | Add `package.json` and run `npm install` |
| No `package.json` | Project not initialized for npm | Create `package.json` with dependencies (Lab 02) |
| Environment inconsistency | Different machines may have different Node versions, OS, etc. | Use Docker to containerize the app (Lab 02, Lab 03) |

---

## Next Steps

- **Lab 02** — Add a `package.json` and Dockerfile to properly set up and containerize the application
- **Lab 03** — Build the Docker image, tag it, and push it to Docker Hub
