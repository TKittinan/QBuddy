import { createContext } from "react";
import type { AuthContextType } from "./auth.type";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);