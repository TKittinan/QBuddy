import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoute from "./routes/user_route";
import adminRoute from "./routes/admin_route";
import authRoute from "./routes/auth_route";

import restaurantRoute from "./routes/restaurant_route";
import categoryRoute from "./routes/category_route";
import restaurantCategoryRoute from "./routes/restaurant_category_route";

import queueRoute from "./routes/queue_route";

import bookingRoute from "./routes/booking_route";

import promotionRoute from "./routes/promotion_route";

import activityRoute from "./routes/activity_route";

import chatRoute from "./routes/chat_route";

import aiRoute from "./routes/ai_route";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoute);
app.use("/admin", adminRoute);
app.use("/auth", authRoute);

app.use("/restaurants", restaurantRoute);
app.use("/categories", categoryRoute);
app.use("/restaurant-category", restaurantCategoryRoute);

app.use("/queue", queueRoute);

app.use("/booking" , bookingRoute);

app.use("/promotion", promotionRoute);

app.use("/activity" , activityRoute)

app.use("/chat", chatRoute);

app.use("/ai", aiRoute);

app.listen(3000, () => {
  console.log("Server running on 3000");
});