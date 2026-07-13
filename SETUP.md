# PlayFlix - Ubuntu LTS Local Server Setup Guide (Without Docker)

## Table of Contents
1. Prerequisites
2. Step 1: Update System Packages
3. Step 2: Install Required Dependencies
4. Step 3: Install Node.js and npm
5. Step 4: Install PostgreSQL Database
6. Step 5: Configure PostgreSQL
7. Step 6: Clone PlayFlix Repository
8. Step 7: Backend Setup
9. Step 8: Frontend Setup
10. Step 9: Install and Configure Nginx
11. Troubleshooting

---

## Prerequisites
- A computer or virtual machine running Ubuntu LTS (22.04 or 24.04 recommended)
- Stable internet connection
- Basic familiarity with terminal commands
- (Optional for production) A domain name pointing to your server's IP address

---

## Step 1: Update System Packages
First, let's make sure all system packages are up-to-date:
```bash
sudo apt update && sudo apt upgrade -y
```

---

## Step 2: Install Required Dependencies
Install essential build tools and libraries:
```bash
sudo apt install -y curl git build-essential libssl-dev
```

---

## Step 3: Install Node.js and npm
Install Node.js LTS version:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:
```bash
node -v
npm -v
```

---

## Step 4: Install PostgreSQL Database Locally
Install PostgreSQL and contrib packages:
```bash
sudo apt install -y postgresql postgresql-contrib
```

Start and enable PostgreSQL service to run on system boot:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Verify PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

---

## Step 5: Configure PostgreSQL Database
Switch to the `postgres` user and open psql shell:
```bash
sudo -u postgres psql
```

Inside the psql shell, create a new user and database for PlayFlix (replace `your_secure_password_here` with a strong password):
```sql
CREATE USER playflix WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE playflix_db;
GRANT ALL PRIVILEGES ON DATABASE playflix_db TO playflix;
\q
```

---

## Step 6: Clone PlayFlix Repository
Create a projects directory and clone the PlayFlix repo:
```bash
mkdir -p ~/projects && cd ~/projects
git clone <your-repository-url> PlayFlix
cd PlayFlix
```

---

## Step 7: Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Copy the example environment file to .env:
```bash
cp .env.example .env
```

Edit the .env file with your PostgreSQL database configuration (replace placeholders with your actual values):
```env
# Example .env configuration
DATABASE_URL=postgres://playflix:your_secure_password_here@localhost:5432/playflix_db
NODE_ENV=development
PORT=3002
```

---

## Step 8: Frontend Setup
Navigate back to the root directory:
```bash
cd ..
```

Install dependencies:
```bash
npm install
```

Build the frontend for production:
```bash
npm run build
```

---

## Step 9: Install and Configure Nginx
Nginx will act as a reverse proxy for both the frontend and backend.

### Install Nginx
```bash
sudo apt install -y nginx
```

Start and enable Nginx service:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

Verify Nginx is running:
```bash
sudo systemctl status nginx
```

Open your browser and go to `http://<your-server-ip>` to see the default Nginx welcome page!

### Configure Nginx for PlayFlix
Create a new Nginx server block configuration file for PlayFlix:
```bash
sudo nano /etc/nginx/sites-available/playflix
```

Paste the following configuration (replace `your-domain.com` with your actual domain name or server IP):
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend (NestJS) API
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save and exit nano (press `Ctrl+O` to save, `Enter` to confirm, `Ctrl+X` to exit).

Enable the new server block by creating a symbolic link:
```bash
sudo ln -s /etc/nginx/sites-available/playflix /etc/nginx/sites-enabled/
```

Test Nginx configuration for syntax errors:
```bash
sudo nginx -t
```

If there are no errors, restart Nginx to apply the changes:
```bash
sudo systemctl restart nginx
```

---

## Step 10: Install PM2 to Keep Apps Running
PM2 is a process manager for Node.js that will keep your frontend and backend running even after you close the terminal.

### Install PM2 globally:
```bash
sudo npm install -g pm2
```

### Start Backend with PM2:
```bash
cd ~/projects/PlayFlix/backend
pm2 start npm --name "playflix-backend" -- run start:dev
```

### Start Frontend with PM2 (Production mode):
First, make sure you've built the frontend (we did this in Step 8). Then:
```bash
cd ~/projects/PlayFlix
pm2 start npm --name "playflix-frontend" -- start
```

### Save PM2 process list to start on system boot:
```bash
pm2 save
pm2 startup
```
Follow the on-screen instructions to complete the PM2 startup setup!

---

## Troubleshooting
- **Port in use**: If a port is already in use, find and kill the process with `sudo lsof -ti :<port> | xargs kill -9`
- **PostgreSQL connection errors**: Verify PostgreSQL is running with `sudo systemctl status postgresql` and double-check your DATABASE_URL in .env
- **Nginx errors**: Check Nginx logs with `sudo tail -f /var/log/nginx/error.log`
- **Node.js/npm errors**: Try clearing npm cache with `npm cache clean --force`
- **PM2 process issues**: Check PM2 logs with `pm2 logs <process-name>`

