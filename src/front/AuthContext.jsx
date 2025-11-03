import { createContext, useContext, useState, useEffect } from "react";

// Creamos el contexto
const AuthContext = createContext();

// Componente proveedor para envolver tu app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Efecto para cargar el usuario desde el token al montar la app
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      fetch("/protected", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setCurrentUser(data))
        .catch(() => {
          sessionStorage.removeItem("token");
        });
    }
  }, []);

  const login = (token, user) => {
    sessionStorage.setItem("token", token);
    setCurrentUser(user);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto en otros componentes
export const useAuth = () => useContext(AuthContext);
