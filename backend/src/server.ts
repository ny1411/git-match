import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'GitMatch Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` Signup: POST http://localhost:${PORT}/api/auth/signup`);
  console.log(` Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(` Get Profile: GET http://localhost:${PORT}/api/profile/me`);
  console.log(` Update Profile: PUT http://localhost:${PORT}/api/profile/me`);
});