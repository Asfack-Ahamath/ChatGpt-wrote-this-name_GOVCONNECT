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
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/govconnect.git
   cd govconnect
   ```

2. **Set up the backend**
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

4. **Start the development servers**

   Backend:
   ```bash
   cd server
   npm run dev
   ```

   Frontend:
   ```bash
   cd client
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://root:pass12345@cluster1.f8cotog.mongodb.net/govconnect
JWT_SECRET=govconnect-secret-key-2024-sri-lanka
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API requests
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **Express Validator** for request validation

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

## 📊 Analytics & Monitoring

- **User Analytics**: Track user engagement and behavior
- **Service Analytics**: Monitor service usage and performance
- **Error Tracking**: Log and monitor system errors
- **Performance Metrics**: Track system performance metrics
- **Audit Logs**: Track important system events

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
