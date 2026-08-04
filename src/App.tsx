import { Outlet, BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./Contexts/AuthContexts";
import ErrorAutho from "./Componentes/ErrorAutho";
import Login from "./Componentes/Login";
import RegisterForm from "./Componentes/RegisterForm";
import Auth from "./Pages/Authori";
import Bienvenida from "./Pages/Bienvenida";
import NotFound from "./Pages/NotFound";
import Home from "./Pages/Home";

function ProtectedRoutes() {
  const { logged, usuario, cargando } = useAuth();

  //  Mientras se valida la sesión
  if (cargando) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-blue-900 font-semibold">Cargando sesión...</p>
      </div>
    );
  }

  //  No está logueado
  if (!logged) {
    return <ErrorAutho />;
  }

  if (!usuario) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p>Cargando usuario...</p>
      </div>
    );
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter basename="/WNA-EPS">
      <Routes>
        <Route path="/" element={<Bienvenida />} />

        <Route path="/auth" element={<Auth />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<RegisterForm />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<Home />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
