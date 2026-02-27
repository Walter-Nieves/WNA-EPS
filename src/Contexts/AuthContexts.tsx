import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Usuario } from "../types";

interface AuthContextType {
  usuario: Usuario | null;
  setUsuario: Dispatch<SetStateAction<Usuario | null>>;
  cargando: boolean;
  logged: boolean;
  setLogged: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [logged, setLogged] = useState<boolean>(false);

  const iniciarSesion = async () => {
    try {
      const refreshResp = await fetch(
        import.meta.env.VITE_BACKEND + "/auth/refresh",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!refreshResp.ok) {
        setLogged(false);
        setUsuario(null);
        return;
      }

      const resp = await fetch(
        import.meta.env.VITE_BACKEND + "/api/usuarios/me",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (resp.ok) {
        const data: Usuario = await resp.json();
        setUsuario(data);
        setLogged(true);
      } else {
        setLogged(false);
        setUsuario(null);
      }
    } catch (error) {
      console.error("Error autenticando sesión:", error);
      setLogged(false);
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    iniciarSesion();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
        cargando,
        logged,
        setLogged,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

export default AuthProvider;
