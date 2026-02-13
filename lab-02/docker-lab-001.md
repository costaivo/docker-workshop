# Docker Lab 001: Building and Pushing a Docker Image

This guide walks through the complete process of building a Docker image from the Node.js Express application, tagging it, pushing it to Docker Hub, and running it locally.

## Prerequisites

- Docker installed on your system
- Docker Hub account created at [https://hub.docker.com](https://hub.docker.com)
- Node.js application files: `app.js`, `package.json`, and `Dockerfile`

---

## Step 1: Build the Docker Image

Navigate to the project directory and build the image.

```bash
# Navigate to the lab directory
cd /home/ivo/work/2026/02-training/session-docker/draft/01-docker/labs/01

# Build the image
docker build -t docker-lab-101 .
```

**Explanation:**
- `docker build` - Command to build a new image from a Dockerfile
- `-t docker-lab-101` - Tags the image with the name `docker-lab-101`
- `.` - Uses the Dockerfile in the current directory

**Expected Output:**
```
Sending build context to Docker daemon  ...
Step 1/7 : FROM node:18-alpine
...
Successfully tagged docker-lab-101:latest
```

**Verify the build:**
```bash
docker images | grep docker-lab-101
```

---

## Step 2: Tag the Image for Docker Hub

Tag your local image with your Docker Hub username and repository name.

```bash
# Tag the image with Docker Hub username
docker tag docker-lab-101 costaivo/docker-lab-101:latest

# Optionally, also tag with version numbers
docker tag docker-lab-101 costaivo/docker-lab-101:1.0
```

**Explanation:**
- Format: `docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]`
- `costaivo` - Your Docker Hub username
- `docker-lab-101` - Your repository name
- `latest` - Tag/version of the image

**Verify the tags:**
```bash
docker images | grep docker-lab-101
```

You should see output similar to:
```
REPOSITORY                    TAG       IMAGE ID       CREATED        SIZE
costaivo/docker-lab-101       latest    abc123def456   2 minutes ago   123MB
costaivo/docker-lab-101       1.0       abc123def456   2 minutes ago   123MB
docker-lab-101                latest    abc123def456   2 minutes ago   123MB
```

---

## Step 3: Push the Image to Docker Hub

Login to Docker Hub and push your image.

### Step 3.1: Login to Docker Hub

```bash
docker login
```

**What to enter:**
- Username: Your Docker Hub username (e.g., `costaivo`)
- Password: Your Docker Hub password

**Expected Output:**
```
Login with your Docker ID to push and pull images from Docker Hub. ...
Username: costaivo
Password: ****
Login Succeeded
```

### Step 3.2: Push the Image

```bash
# Push the latest tag
docker push costaivo/docker-lab-101:latest

# Push the version tag
docker push costaivo/docker-lab-101:1.0
```

**Expected Output:**
```
The push refers to repository [docker.io/costaivo/docker-lab-101]
abc123... Pushing
def456... Pushed
...
latest: digest: sha256:abcd1234... size: 1234
```

**Verify on Docker Hub:**
1. Go to [https://hub.docker.com](https://hub.docker.com)
2. Login with your account
3. You should see the `docker-lab-101` repository in your account

---

## Step 4: Run the Image from Docker Hub Locally

Pull and run the image from Docker Hub.

### Step 4.1: Pull the Image (Optional)

The image will be pulled automatically when you run it, but you can pull it explicitly:

```bash
docker pull costaivo/docker-lab-101:latest
```

### Step 4.2: Run the Container

```bash
# Run the container and map port 3000
docker run -p 3000:3000 costaivo/docker-lab-101:latest
```

**Explanation:**
- `docker run` - Command to create and run a new container
- `-p 3000:3000` - Maps port 3000 from host to port 3000 in container (format: `host:container`)
- `costaivo/docker-lab-101:latest` - Image to run from Docker Hub

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
docker run -d -p 3000:3000 --name quotes-app costaivo/docker-lab-101:latest

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
docker run -p 8080:3000 costaivo/docker-lab-101:latest

# Access at http://localhost:8080/quotes
```

### Can't Pull Image

```bash
# Make sure image name is correct
docker pull costaivo/docker-lab-101:latest

# Try without tag (defaults to 'latest')
docker pull costaivo/docker-lab-101
```

---

## Complete Quick Reference

```bash
# 1. Build the image
docker build -t docker-lab-101 .

# 2. Tag the image
docker tag docker-lab-101 costaivo/docker-lab-101:latest

# 3. Login to Docker Hub
docker login

# 4. Push to Docker Hub
docker push costaivo/docker-lab-101:latest

# 5. Run locally from Docker Hub
docker run -p 3000:3000 costaivo/docker-lab-101:latest

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
