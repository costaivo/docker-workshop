# Docker Lab 003: Building and Pushing a Docker Image

This guide continues from **Lab 02**, where you set up a Dockerfile for the Node.js Quotes API. Here you will:

1. **Build** the Docker image from your Dockerfile  
2. **Tag** the image with your Docker Hub username and repository name  
3. **Push** the image to Docker Hub  

## Prerequisites

- **Completed Lab 02** — You should have a Dockerfile, `app.js`, and `package.json` in your project directory (either `lab-02` or `lab-03`)
- Docker installed on your system
- Docker Hub account created at [https://hub.docker.com](https://hub.docker.com)

---

## Step 1: Build the Docker Image

From the project directory that contains your Dockerfile (created in Lab 02), run the build command.

```bash
# Navigate to the lab directory (use lab-02 or lab-03 depending on where your Dockerfile is)
cd lab-03

# Build the image
docker build -t docker-lab-003 .
```

**Explanation:**
- `docker build` — Command to build a new image from a Dockerfile
- `-t docker-lab-003` — Tags the image with the name `docker-lab-003` (the `:latest` tag is added by default if no tag is specified)
- `.` — Uses the Dockerfile in the current directory as build context

**Expected Output:**
```
Sending build context to Docker daemon  ...
Step 1/7 : FROM node:18-alpine
...
Successfully tagged docker-lab-003:latest
```

**Verify the build:**
```bash
docker images | grep docker-lab-003
```

---

## Step 2: Tag the Image for Docker Hub

To push an image to Docker Hub, it must be tagged with your Docker Hub username and a repository name. The format is `username/repository:tag`.

```bash
# Tag the image with your Docker Hub username (replace YOUR_DOCKERHUB_USERNAME with your actual username)
docker tag docker-lab-003 YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest

# Optionally, create additional tags for versioning
docker tag docker-lab-003 YOUR_DOCKERHUB_USERNAME/docker-lab-003:1.0
```

**Explanation:**
- **Format:** `docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]`
- **SOURCE_IMAGE** — Your locally built image (`docker-lab-003` or `docker-lab-003:latest`)
- **YOUR_DOCKERHUB_USERNAME** — Your Docker Hub username (e.g., `costaivo`)
- **docker-lab-003** — The repository name on Docker Hub (will be created when you first push)
- **latest** or **1.0** — The tag; `latest` is the default when pulling without specifying a tag

**Why tag?** — Docker Hub requires images to follow the `username/repository:tag` naming convention. Tagging creates a new reference to the same image without copying it.

**Verify the tags:**
```bash
docker images | grep docker-lab-003
```

You should see output similar to (all sharing the same IMAGE ID):
```
REPOSITORY                     TAG       IMAGE ID       CREATED        SIZE
YOUR_DOCKERHUB_USERNAME/docker-lab-003  latest    abc123def456   2 minutes ago   ~55MB
YOUR_DOCKERHUB_USERNAME/docker-lab-003  1.0       abc123def456   2 minutes ago   ~55MB
docker-lab-003                 latest    abc123def456   2 minutes ago   ~55MB
```

---

## Step 3: Push the Image to Docker Hub

Login to Docker Hub and push your image.

### Step 3.1: Login to Docker Hub

You must be logged in to Docker Hub before you can push images.

```bash
docker login
```

**What to enter:**
- **Username** — Your Docker Hub username
- **Password** — Your Docker Hub password (or an access token if you use 2FA)

**Expected Output:**
```
Login with your Docker ID to push and pull images from Docker Hub. ...
Username: YOUR_DOCKERHUB_USERNAME
Password: ****
Login Succeeded
```

### Step 3.2: Push the Image

Push your tagged image(s) to Docker Hub. The repository will be created automatically if it does not exist.

```bash
# Push the latest tag
docker push YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest

# Push the version tag (if you created it)
docker push YOUR_DOCKERHUB_USERNAME/docker-lab-003:1.0
```

**Explanation:**
- `docker push` — Uploads the image to Docker Hub
- Only the layers not already on Docker Hub are uploaded (Docker uses layer caching)

**Expected Output:**
```
The push refers to repository [docker.io/YOUR_DOCKERHUB_USERNAME/docker-lab-003]
abc123... Pushing
def456... Pushed
...
latest: digest: sha256:abcd1234... size: 1234
```

**Verify on Docker Hub:**
1. Go to [https://hub.docker.com](https://hub.docker.com)
2. Log in with your account
3. You should see the `docker-lab-003` repository in your account
4. Click it to view tags (`latest`, `1.0`) and the image details

---

## Step 4: Run the Image from Docker Hub (Optional)

You can pull and run your image from Docker Hub to verify it was pushed correctly.

### Step 4.1: Pull the Image (Optional)

The image will be pulled automatically when you run it, but you can pull it explicitly first:

```bash
docker pull YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest
```

### Step 4.2: Run the Container

```bash
# Run the container and map port 3000
docker run -p 3000:3000 YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest
```

**Explanation:**
- `docker run` — Creates and starts a new container from the image
- `-p 3000:3000` — Maps host port 3000 to container port 3000 (format: `host:container`)
- `YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest` — Image from Docker Hub to run

**Expected Output:**
```
Server is running on http://localhost:3000
Get quotes at http://localhost:3000/quotes
```

### Step 4.3: Access the Application

Open another terminal and test the API:

```bash
# Get all quotes
curl http://localhost:3000/quotes

# Get health check
curl http://localhost:3000/health

# Get root endpoint
curl http://localhost:3000/
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "text": "The only way to do great work is to love what you do.",
      "author": "Steve Jobs"
    },
    ...
  ],
  "message": "Quotes retrieved successfully"
}
```

### Step 4.4: Stop the Container

```bash
# Press Ctrl+C in the terminal running the container

# Or, in another terminal, find and stop the container
docker ps  # Find the CONTAINER ID

docker stop CONTAINER_ID
```

---

## Run in Detached Mode (Background)

To run the container in the background:

```bash
# Run in detached mode
docker run -d -p 3000:3000 --name quotes-app YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest

# Check running containers
docker ps

# View logs
docker logs quotes-app

# Follow logs in real-time
docker logs -f quotes-app

# Stop the container
docker stop quotes-app

# Remove the container
docker rm quotes-app
```

---

## Useful Docker Commands

| Command | Purpose |
|---------|---------|
| `docker build -t name:tag .` | Build an image from Dockerfile |
| `docker tag source target` | Create a new tag for an image |
| `docker images` | List all local images |
| `docker login` | Login to Docker Hub |
| `docker push image:tag` | Push image to Docker Hub |
| `docker pull image:tag` | Pull image from Docker Hub |
| `docker run -p host:container image:tag` | Run a container |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers |
| `docker logs container-id` | View container logs |
| `docker stop container-id` | Stop a running container |
| `docker rm container-id` | Remove a container |
| `docker rmi image:tag` | Remove an image |

---

## Troubleshooting

### Build Fails

```bash
# Check if Dockerfile exists
ls -la Dockerfile

# Check Docker daemon is running
docker ps
```

### Push Permission Denied

```bash
# Make sure you're logged in
docker login

# Verify login
docker info | grep Username
```

### Port Already in Use

```bash
# Change the host port
docker run -p 8080:3000 YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest

# Access at http://localhost:8080/quotes
```

### Can't Pull Image

```bash
# Make sure image name is correct (use your Docker Hub username)
docker pull YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest

# Try without tag (defaults to 'latest')
docker pull YOUR_DOCKERHUB_USERNAME/docker-lab-003
```

---

## Complete Quick Reference

```bash
# 1. Build the image (from lab-02 or lab-03 directory)
docker build -t docker-lab-003 .

# 2. Tag the image for Docker Hub
docker tag docker-lab-003 YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest

# 3. Login to Docker Hub
docker login

# 4. Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest

# 5. (Optional) Run locally from Docker Hub
docker run -p 3000:3000 YOUR_DOCKERHUB_USERNAME/docker-lab-003:latest

# 6. Test the API
curl http://localhost:3000/quotes
```

---

## Next Steps

- Explore Docker volumes for persistent data
- Learn about Docker networks for multi-container applications
- Study Docker Compose for orchestrating multiple containers
- Implement health checks and restart policies
- Optimize image size and layer caching

---

## Lab Flow Summary

| Lab | Focus |
|-----|-------|
| **Lab 02** | Create and configure a Dockerfile for your Node.js project |
| **Lab 03** | Build the image, tag it for Docker Hub, and push it to the registry |
