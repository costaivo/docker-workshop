# Docker Lab 002: Setting Up a Dockerfile for a Node.js Project

This guide explains how to create and configure a Dockerfile for a Node.js application, using the Quotes API Express app as an example. Each step is explained in detail to help you understand both the *what* and the *why*.

## Prerequisites

- Docker installed on your system
- A Node.js project with at least:
  - Application code (e.g., `app.js`)
  - `package.json` (with dependencies listed)

---

## Project Overview

The `lab-02` project structure:

| File | Purpose |
|------|---------|
| `app.js` | Express server that exposes the Quotes API on port 3000 |
| `package.json` | Declares dependencies (Express) for npm |
| `Dockerfile` | Instructions to build a container image |

---

## Understanding the Dockerfile

A Dockerfile is a text file containing instructions that Docker uses to build an image. Each instruction creates a **layer** in the image. Layers are cached, so changing only a later instruction reuses earlier layers, which speeds up rebuilds.

---

## Step-by-Step Dockerfile Instructions

### Step 1: Choose the Base Image (`FROM`)

```dockerfile
FROM node:18-alpine
```

**What it does:**  
Sets the base image for your container. Your app will run inside a Linux environment that includes Node.js.

**Details:**
- **`node`** — Official Node.js image from Docker Hub
- **`18`** — Major Node.js version; use a version that matches your project
- **`alpine`** — A minimal Linux distribution (~5MB). Much smaller than the default `node:18` image (~150MB+), which reduces build time and attack surface

**Alternatives:**
- `node:18` — Full Debian-based image (more tools, larger size)
- `node:20-alpine` — Use Node.js 20 if your project requires it
- `node:18-slim` — Debian slim variant (middle ground between alpine and full)

---

### Step 2: Set the Working Directory (`WORKDIR`)

```dockerfile
WORKDIR /app
```

**What it does:**  
Sets the directory inside the container where commands run and files are copied. Equivalent to `cd /app`.

**Details:**
- If `/app` does not exist, Docker creates it
- All subsequent `RUN`, `COPY`, and `CMD` instructions execute in this directory
- Using an absolute path like `/app` is preferred over relative paths

---

### Step 3: Copy Dependency Files First (`COPY`)

```dockerfile
COPY package.json ./
```

**What it does:**  
Copies `package.json` from your host into the container’s working directory (`/app`).

**Why copy `package.json` separately?**
This is a best practice for **layer caching**. Docker caches each instruction. If you copy all files together, any code change invalidates the cache and forces `npm install` to run again. By copying only `package.json` first, `npm install` is cached until dependencies change.

**Note:** If you use `package-lock.json` or `npm-shrinkwrap.json`, copy them too:

```dockerfile
COPY package*.json ./
```

This copies both `package.json` and `package-lock.json` if present.

---

### Step 4: Install Dependencies (`RUN`)

```dockerfile
RUN npm install
```

**What it does:**  
Runs `npm install` inside the container to install dependencies from `package.json`.

**Details:**
- Runs in the `/app` directory (from `WORKDIR`)
- Installs all dependencies listed in `package.json` into `node_modules`
- Produces a new layer; Docker caches this layer until `package.json` or `package*.json` changes

**For production:** Use `npm ci` when you have a lock file for reproducible installs:

```dockerfile
RUN npm ci --only=production
```

`--only=production` skips devDependencies to keep the image smaller.

---

### Step 5: Copy Application Code (`COPY`)

```dockerfile
COPY app.js ./
```

**What it does:**  
Copies your application source (`app.js`) into the container’s working directory.

**Details:**
- Runs after dependency installation, so code changes do not trigger `npm install` again
- The `./` destination is relative to `WORKDIR` (`/app`)

**If you have more files:**

```dockerfile
COPY . ./
```

This copies the entire project. Be careful: a `.dockerignore` file should exclude `node_modules`, `.git`, and other non-runtime files so they are not copied from the host.

---

### Step 6: Expose the Application Port (`EXPOSE`)

```dockerfile
EXPOSE 3000
```

**What it does:**  
Documents that the container listens on port 3000.

**Details:**
- **Documentation only** — It does not publish the port by itself
- Publishing happens when you run the container: `docker run -p 3000:3000 ...`
- Helps others understand which port the app uses
- Used by tools like Docker Compose for port mapping

---

### Step 7: Define the Startup Command (`CMD`)

```dockerfile
CMD ["node", "app.js"]
```

**What it does:**  
Specifies the command to run when the container starts.

**Details:**
- **Exec form** — `["node", "app.js"]` runs `node` directly with `app.js` as an argument, without a shell
- Prefer this form because it handles signals (e.g. SIGTERM) correctly
- Alternative **shell form** — `CMD node app.js` runs via `/bin/sh -c`, which can complicate signal handling

**Other examples:**
- `CMD ["npm", "start"]` — if `package.json` has a `"start"` script
- `CMD ["node", "src/index.js"]` — if your entry point is elsewhere

---

## Complete Dockerfile Reference

```dockerfile
# Use official Node.js runtime as the base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists) to the container
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY app.js ./

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["node", "app.js"]
```

---

## Optional: Add a `.dockerignore` File

Create a `.dockerignore` file in the same directory as the Dockerfile to exclude files from the build context:

```
node_modules
npm-debug.log
.git
.gitignore
.env
*.md
Dockerfile
```

**Why it matters:**
- `node_modules` on the host is ignored; dependencies come from `npm install` in the container
- Reduces build context size and speeds up builds
- Avoids overwriting container `node_modules` with host files

---

## Build and Run the Image

### Build the Image

```bash
cd lab-02
docker build -t quotes-api:latest .
```

**Explanation:**
- `docker build` — Build an image from the Dockerfile
- `-t quotes-api:latest` — Tag the image as `quotes-api` with tag `latest`
- `.` — Use the current directory as build context

### Run the Container

```bash
docker run -p 3000:3000 quotes-api:latest
```

**Explanation:**
- `-p 3000:3000` — Map host port 3000 to container port 3000
- The app will be available at `http://localhost:3000`

### Verify the Application

```bash
# In another terminal
curl http://localhost:3000/
curl http://localhost:3000/quotes
curl http://localhost:3000/health
```

---

## Layer Caching Recap

| Order | Instruction | Cache invalidated when… |
|-------|-------------|--------------------------|
| 1 | `FROM` | Base image changes |
| 2 | `WORKDIR` | Instruction changes |
| 3 | `COPY package.json` | `package.json` changes |
| 4 | `RUN npm install` | Step 3 changes |
| 5 | `COPY app.js` | `app.js` or other copied files change |
| 6 | `EXPOSE` | Instruction changes |
| 7 | `CMD` | Instruction changes |

Code changes only invalidate steps 5–7, so `npm install` is usually reused.

---

## Best Practices Summary

1. **Use specific base image tags** — `node:18-alpine` instead of `node:latest`
2. **Copy dependency files before application code** — Improves layer caching
3. **Use `EXPOSE`** — Documents the port the app uses
4. **Prefer exec form for `CMD`** — `["node", "app.js"]` instead of `node app.js`
5. **Add `.dockerignore`** — Keeps build context small and clean
6. **Consider `npm ci`** — For production builds with a lock file

---

## Troubleshooting

### Build fails with "package.json not found"

Ensure you run `docker build` from the directory that contains both the Dockerfile and `package.json`.

### Container exits immediately

Check that the app binds to `0.0.0.0`, not `localhost`. In Express, `app.listen(3000)` binds to all interfaces by default.

### Port already in use

Use a different host port: `docker run -p 8080:3000 quotes-api:latest`, then access `http://localhost:8080`.

---

## Next Steps

- Try adding `package-lock.json` and using `npm ci`
- Add a `.dockerignore` file and compare build times
- Explore multi-stage builds for smaller production images
- Integrate with Docker Compose for multi-container setups
