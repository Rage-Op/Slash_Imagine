import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setLogout } from "@/state/state";
import api from "@/lib/axios";

export const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [validationState, setValidationState] = useState("pending");
  const hasValidated = useRef(false);
  
  useEffect(() => {
    if (hasValidated.current) return;
    hasValidated.current = true;
    
    const validateToken = async () => {
      if (!user || !user.token) {
        setValidationState("invalid");
        return;
      }
      
      try {
        await api.get("/user/get-home-feed?page=1&limit=1");
        setValidationState("valid");
      } catch (error) {
        console.error("Token validation failed:", error.response?.status, error.message);
        if (error.response?.status === 401) {
          dispatch(setLogout());
        }
        setValidationState("invalid");
      }
    };
    
    validateToken();
  }, [user, dispatch]);
  
  if (!user || !user.token || validationState === "invalid") {
    return <Navigate to="/login" replace />;
  }
  
  if (validationState === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return children;
};
