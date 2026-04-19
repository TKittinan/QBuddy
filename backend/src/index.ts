import express from 'express';
import cors from 'cors';

import userRoutes from './modules/users/user_routes';
import place_routes from './modules/places/place_routes';
import ticket_routes from './modules/tickets/ticket_routes';
import party_routes from './modules/party/party_routes';
import support_routes from './modules/support/support_routes';
import settings from './modules/settings/settings_routes';
import auth_routes from './modules/auth/auth_routes';
import dashboard_routes from './modules/dashboard/dashboard_routes';
import aiRoutes from "./modules/ai_chatbot/ai_routes";
import savedPlaceRoutes from './modules/saveplace/savedplace_routes';

const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ลงทะเบียนเส้นทางทั้งหมด
app.use('/api/auth', auth_routes);
app.use('/api/users', userRoutes);
app.use('/api/places', place_routes);
app.use('/api/tickets', ticket_routes);
app.use('/api/parties', party_routes);
app.use('/api/support', support_routes);
app.use('/api/settings', settings);
app.use('/api/dashboard', dashboard_routes);

app.use('/api/ai-chat', aiRoutes);

app.use('/api/saved-places', savedPlaceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});