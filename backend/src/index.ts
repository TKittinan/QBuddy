import express from 'express';
import userRoutes from './modules/users/user_routes';

const app = express();
app.use(express.json()); 

// ลงทะเบียนเส้นทางของ User
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});