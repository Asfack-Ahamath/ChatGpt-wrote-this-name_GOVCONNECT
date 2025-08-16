# 🏛️ GOVCONNECT

GOVCONNECT is a modern, user-friendly platform designed to streamline access to government services in Sri Lanka. It provides citizens with an easy way to book appointments, manage documents, and interact with various government departments through a single, unified interface.

## ✨ Features

### 👤 For Citizens
- **Service Discovery**: Browse and search through available government services
- **Appointment Booking**: Schedule appointments with various departments
- **Document Management**: Upload and manage required documents
- **Status Tracking**: Track application and appointment status in real-time
- **Multi-language Support**: Interface available in English, සිංහල (Sinhala), and தமிழ் (Tamil)
- **Mobile-First Design**: Native app-like experience on mobile devices
- **AI Assistant**: 24/7 chatbot support for government service inquiries
  - NIC application guidance
  - Motor vehicle registration help
  - Document requirements info
  - Service location details
  - Real-time assistance

### 👨‍💼 For Government Officers
- **Appointment Management**: View and manage citizen appointments
- **Document Verification**: Review and verify submitted documents
- **Service Updates**: Update service status and send notifications
- **Department-specific Views**: Customized interfaces for different departments

### 👨‍💻 For Administrators
- **User Management**: Manage citizens, officers, and admin accounts
- **Department Management**: Add and configure government departments
- **Service Management**: Configure available services and requirements
- **Analytics Dashboard**: Monitor system usage and performance
- **System Settings**: Configure system-wide settings and preferences

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/govconnect.git
   cd govconnect
   ```

2. **Set up the backend server**
   ```bash
   cd server
   npm install
   cp .env.example .env  # Configure your environment variables
   ```

3. **Set up the frontend**
   ```bash
   cd client
   npm install
   cp .env.example .env  # Configure your environment variables
   ```

4. **Set up the chatbot**
   ```bash
   cd chatbot
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env  # Configure your environment variables
   ```

5. **Start the development servers**

   Backend Server:
   ```bash
   cd server
   npm run dev
   ```

   Frontend:
   ```bash
   cd client
   npm run dev
   ```

   Chatbot:
   ```bash
   cd chatbot
   python run.py
   ```

### Environment Variables

#### Backend Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://root:pass12345@cluster1.f8cotog.mongodb.net/govconnect
JWT_SECRET=govconnect-secret-key-2024-sri-lanka
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sayesara2025@gmail.com
SMTP_PASS=hhmfoltyopznwwnc
EMAIL_FROM=sayesara2025@gmail.com
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

#### Chatbot (.env)
```env
MISTRAL_API_KEY=NbyuptruAsVKPYOdDA3xtNygCzyVkzeH
MISTRAL_MODEL_ID=ft:open-mistral-7b:0ffd4d8a:20250718:0b9abfb2
VECTOR_DIR=govconnect_nic
DATA_DIR=data
EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2
MAX_TOKENS=512
FLASK_DEBUG=False
FLASK_APP=app.py
PORT=5001
HOST=0.0.0.0
LOG_LEVEL=INFO
```

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API requests
- **Lucide React** for icons

### Backend Server
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **Express Validator** for request validation

### Chatbot
- **Python** with Flask
- **Mistral AI** for language model
- **FAISS** for vector similarity search
- **BGE Base** for embeddings
- **dotenv** for configuration
- **CORS** for cross-origin support

## 📱 Mobile-First Design

GOVCONNECT is built with a mobile-first approach, providing a native app-like experience on mobile devices:

- **Responsive Design**: Adapts seamlessly to different screen sizes
- **Touch Optimized**: Large touch targets and intuitive gestures
- **Offline Support**: Basic functionality works without internet
- **PWA Ready**: Can be installed as a Progressive Web App

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Different permissions for citizens, officers, and admins
- **Password Hashing**: Secure password storage with bcrypt
- **Input Validation**: Comprehensive server-side validation
- **XSS Protection**: Protection against cross-site scripting
- **CSRF Protection**: Protection against cross-site request forgery
- **Chatbot Security**:
  - API key protection
  - Rate limiting
  - Input sanitization
  - Response filtering
  - Conversation logging
  - CORS configuration

## 📊 Analytics & Monitoring

- **User Analytics**: Track user engagement and behavior
- **Service Analytics**: Monitor service usage and performance
- **Error Tracking**: Log and monitor system errors
- **Performance Metrics**: Track system performance metrics
- **Audit Logs**: Track important system events
- **Chatbot Analytics**:
  - Query patterns and trends
  - User satisfaction metrics
  - Response accuracy tracking
  - Service discovery insights
  - Conversation flow analysis

## 🌐 API Documentation

The API documentation is available at `/api/docs` when running the development server. It includes:

- **Endpoint Documentation**: Detailed API endpoint documentation
- **Request/Response Examples**: Sample requests and responses
- **Authentication Guide**: How to authenticate with the API
- **Error Codes**: List of possible error codes and meanings

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Sri Lankan Government Departments for their support
- Open source community for various tools and libraries
- All contributors who have helped shape this project

## 📞 Support

For support, please email support@govconnect.lk or open an issue in the repository.

---

Built with ❤️ for the people of Sri Lanka 🇱🇰
