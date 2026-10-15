import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setLogout } from "@/state/state";
import api from "@/lib/axios";

export const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
    const validateToken = async () => {
      if (!user || !user.token) {
        setIsValidating(false);
        setIsValid(false);
        return;
      }
      
      try {
        await api.get("/user/get-home-feed?page=1&limit=1");
        setIsValid(true);
      } catch (error) {
        if (error.response?.status === 401) {
          dispatch(setLogout());
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      } finally {
        setIsValidating(false);
      }
    };
    
    validateToken();
  }, [user, dispatch]);
  
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }
  
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
