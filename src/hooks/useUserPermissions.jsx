import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function useUserPermissions() {
  const [permissions, setPermissions] = useState([]);
  const [token, setToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const permisos =
          decoded.rol?.flatMap(
            (rol) => rol.permisos?.map((p) => p.name) || []
          ) || [];

        setToken(storedToken);
        setDecodedToken(decoded);
        setPermissions(permisos);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, []);

  return { permissions, token, decodedToken };
}
