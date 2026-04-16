import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import type{ AppDispatch } from "./redux/Reduxindex";
import { getProfile } from "./redux/authSlice"; 

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  return <AppRoutes />;
};

export default App;