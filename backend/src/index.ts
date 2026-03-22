import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoute from "./routes/user_route";
import authRoute from "./routes/auth_route";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoute);
app.use("/auth", authRoute);

app.listen(3000, () => {
  console.log("Server running on 3000");
});