import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../hooks/authStore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { token } = useAuthStore();
  const [decodedToken, setDecodedToken] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setDecodedToken(decoded);
        setPermissions(decoded.permisos || []);
      } catch (e) {
        console.error("Token inválido:", e);
      }
    }
    setIsLoading(false);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ token, decodedToken, permissions, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
