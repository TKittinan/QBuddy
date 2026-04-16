import express from 'express';
import userRoutes from './modules/users/user_routes';
import place_routes from './modules/places/place_routes';
import ticket_routes from './modules/tickets/ticket_routes';
import party_routes from './modules/party/party_routes';

const app = express();
app.use(express.json()); 

// ลงทะเบียนเส้นทางของ User
app.use('/api/users', userRoutes);
app.use('/api/places', place_routes);
app.use('/api/tickets', ticket_routes);
app.use('/api/parties', party_routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});