# Online Judge Platform 🏆

A comprehensive online competitive programming platform built with Node.js and Express.js, designed to host programming contests, manage submissions, and provide real-time leaderboards.

🌐 **Live Demo**: [frontendavadhut.duckdns.org](https://www.cpcoders.duckdns.org)  
🎨 **Frontend Repository**: [online-judge-frontend](https://github.com/Avadhutgiri/online-judge-frontend)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

## 🚀 Features

- **User Management**: Registration, authentication, and profile management
- **Admin Panel**: Administrative controls for platform management
- **Problem Management**: Create, edit, and manage programming problems
- **Code Submission**: Submit solutions in multiple programming languages
- **Real-time Results**: Instant feedback on code execution and scoring
- **Leaderboards**: Dynamic ranking system for competitive programming
- **Team Support**: Team-based competitions and collaboration
- **Secure Authentication**: JWT-based authentication system
- **Containerized Deployment**: Docker support for easy deployment
- **SSL Security**: HTTPS support with Let's Encrypt certificates

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **JWT** - Authentication and authorization
- **bcrypt** - Password hashing
- **Redis** - Caching and session management
- **Celery** - Distributed task queue for code execution

### Database & Caching
- **PostgreSQL** - Primary relational database for storing user data, problems, and submissions
- **Redis** - In-memory data store for caching and task queue management

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Let's Encrypt** - SSL certificate management
- **Certbot** - Automated certificate renewal
- **DuckDNS** - Dynamic DNS service

## 📁 Project Structure

```
my-online-judge/
├── routes/                 # API route handlers
│   ├── user.js            # User authentication and management
│   ├── admin.js           # Admin-specific operations
│   ├── problem.js         # Problem CRUD operations
│   ├── submission.js      # Code submission handling
│   ├── result.js          # Result processing and retrieval
│   ├── polling.js         # Real-time polling for updates
│   └── leaderboard.js     # Leaderboard and ranking system
├── models/                # Database models
│   ├── User.js            # User schema and methods
│   ├── Team.js            # Team schema and methods
│   ├── Problem.js         # Problem schema and methods
│   ├── ProblemSample.js   # Sample test cases schema
│   └── Submission.js      # Submission schema and methods
├── middlewares/           # Custom middleware functions
│   ├── auth.js            # JWT authentication middleware
│   └── adminAuth.js       # Admin authorization middleware
├── certbot/               # SSL certificate configuration
├── docker-compose.yml     # Docker services configuration
├── Dockerfile            # Container build instructions
├── server.js             # Express server configuration
├── index.js              # Application entry point
├── .env.example          # Environment variables template
└── package.json          # Dependencies and scripts
```

## ⚙️ Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Git

### 🔧 Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Avadhutgiri/my-online-judge.git
   cd my-online-judge
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file for local development:
   ```env
   # Change to development mode
   NODE_ENV=development
   
   # Use localhost for local development
   COOKIE_DOMAIN=localhost
   COOKIE_SECURE=false
   COOKIE_SAME_SITE=Lax
   
   # JWT Secret for authentication
   JWT_SECRET=your-jwt-secret-key
   
   # Database configuration (PostgreSQL)
   LOCAL_DB_HOST=localhost
   LOCAL_REDIS_HOST=localhost
   
   POSTGRES_PASSWORD=your-postgres-password
   DB_HOST=db
   REDIS_HOST=redis
   DB_USER=postgres
   DB_PASS=your-db-password
   DB_NAME=your-db-name
   DB_DIALECT=postgres
   DB_PORT=5432
   
   # Redis configuration
   REDIS_PORT=6379
   
   # Backend service configuration
   BACKEND_HOST=backend
   BACKEND_PORT=5000
   
   # Celery configuration
   CELERY_BROKER_URL=redis://redis:6379/0
   CELERY_RESULT_BACKEND=redis://redis:6379/0
   
   # Worker configuration
   WORKER_CONCURRENCY=8
   LOG_LEVEL=WARNING
   
   # Frontend URL (for local development)
   FRONTEND_URL=http://localhost:5173
   
   # Project paths
   BASE_DIR=/app
   
   # CORS settings for local development
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

3. **Start the application**
   ```bash
   # Build and start all services with Docker Compose
   docker-compose up --build
   
   # Or run in detached mode
   docker-compose up -d --build
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

4. **Access the application**
   - API Server: `http://localhost:3000`
   - Frontend: [frontendavadhut.duckdns.org](https://frontendavadhut.duckdns.org) or `http://localhost:5173` (if running frontend locally)
   - Health Check: `http://localhost:3000/health`

### 🐳 Production Docker Setup

For production deployment with your domain:

1. **Clone and configure**
   ```bash
   git clone https://github.com/Avadhutgiri/my-online-judge.git
   cd my-online-judge
   cp .env.example .env
   ```

2. **Update environment variables for production**
   ```env
   # Production environment
   NODE_ENV=production
   
   # Production domain
   COOKIE_DOMAIN=your-domain.com
   COOKIE_SECURE=true
   COOKIE_SAME_SITE=None
   
   # Database
   DB_HOST=db
   REDIS_HOST=redis
   DB_USER=postgres
   DB_PASS=your-secure-db-password
   DB_NAME=your-db-name
   DB_DIALECT=postgres
   DB_PORT=5432
   
   # Redis
   REDIS_PORT=6379
   
   # Celery
   CELERY_BROKER_URL=redis://redis:6379/0
   CELERY_RESULT_BACKEND=redis://redis:6379/0
   
   # Frontend
   FRONTEND_URL=https://frontendavadhut.duckdns.org
   
   # SSL Certificate
   DOMAIN=your-domain.com
   EMAIL=your-email@example.com
   
   # CORS
   ALLOWED_ORIGINS=https://frontendavadhut.duckdns.org,https://your-domain.com
   ```

3. **Build and run with Docker Compose**
   ```bash
   # Build and start all services
   docker-compose up -d --build
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

4. **Access the production application**
   - API Server: `https://your-domain.com`
   - Frontend: [frontendavadhut.duckdns.org](https://frontendavadhut.duckdns.org)

## 🔐 SSL Configuration with Let's Encrypt

### Prerequisites
- Domain name (DuckDNS or custom domain)
- Server with public IP address

### Setup Steps

1. **Configure DuckDNS** (if using)
   ```bash
   # Update your DuckDNS domain to point to your server IP
   curl "https://www.duckdns.org/update?domains=your-domain&token=your-token&ip="
   ```

2. **Initial Certificate Generation**
   ```bash
   # Stop the application temporarily
   docker-compose down
   
   # Generate certificates
   docker run -it --rm \
     -v $(pwd)/certbot/conf:/etc/letsencrypt \
     -v $(pwd)/certbot/www:/var/www/certbot \
     -p 80:80 \
     certbot/certbot \
     certonly --standalone \
     -d your-domain.duckdns.org \
     --email your-email@example.com \
     --agree-tos \
     --no-eff-email
   ```

3. **Configure Nginx** (recommended for production)
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.duckdns.org;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.duckdns.org/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.duckdns.org/privkey.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **Auto-renewal Setup**
   ```bash
   # Add to crontab for automatic renewal
   0 12 * * * docker run --rm -v $(pwd)/certbot/conf:/etc/letsencrypt -v $(pwd)/certbot/www:/var/www/certbot certbot/certbot renew --quiet
   ```

## 📚 API Overview

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Problem Management
- `GET /api/problems` - List all problems
- `GET /api/problems/:id` - Get specific problem
- `POST /api/problems` - Create new problem (Admin)
- `PUT /api/problems/:id` - Update problem (Admin)
- `DELETE /api/problems/:id` - Delete problem (Admin)

### Submission System
- `POST /api/submissions` - Submit solution
- `GET /api/submissions` - Get user submissions
- `GET /api/submissions/:id` - Get specific submission

### Results & Leaderboard
- `GET /api/results/:submissionId` - Get submission results
- `GET /api/leaderboard` - Get current leaderboard
- `GET /api/polling/results/:id` - Poll for real-time results

### Admin Operations
- `GET /api/admin/users` - Manage users
- `GET /api/admin/submissions` - View all submissions
- `POST /api/admin/problems` - Problem management

## 🚀 Deployment

### Production Deployment

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Application Deployment**
   ```bash
   # Clone and setup
   git clone https://github.com/Avadhutgiri/my-online-judge.git
   cd my-online-judge
   
   # Configure production environment
   cp .env.example .env
   # Edit .env with production values
   
   # Deploy with Docker Compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Monitor Application**
   ```bash
   # Check service status
   docker-compose ps
   
   # View logs
   docker-compose logs -f app
   
   # Monitor resource usage
   docker stats
   ```

## 🤝 Contributing

We welcome contributions to improve the Online Judge platform! Here's how you can help:

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/my-online-judge.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m "Add: amazing new feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Contribution Guidelines

- **Code Style**: Follow ESLint configuration
- **Testing**: Ensure all tests pass and add tests for new features
- **Documentation**: Update README and code comments
- **Commit Messages**: Use conventional commit format
- **Issues**: Feel free to open issues for bugs or feature requests

### Areas for Contribution

- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🧪 Test coverage expansion
- 🎨 UI/UX improvements
- 🔒 Security enhancements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. **Check existing issues**: [GitHub Issues](https://github.com/Avadhutgiri/my-online-judge/issues)
2. **Create new issue**: Provide detailed description and reproduction steps
3. **Join discussions**: Share ideas and get help from the community

## 🙏 Acknowledgments

- Thanks to all contributors who have helped improve this project
- Inspired by popular online judge platforms like Codeforces and AtCoder
- Built with love for the competitive programming community

## 🔗 Related Repositories

- **Frontend**: [online-judge-frontend](https://github.com/Avadhutgiri/online-judge-frontend) - React-based frontend application
- **Live Demo**: [frontendavadhut.duckdns.org](www.cpcoders.duckdns.org) - Experience the platform in action

---

**Made with ❤️ by [Avadhut Giri](https://github.com/Avadhutgiri)**

⭐ **Star this repository if you find it helpful!**
