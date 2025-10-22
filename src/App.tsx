// Importamos las herramientas de React Router
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Importamos los componentes/páginas de la aplicación
import Login from "./Componentes/Login";
import RegisterForm from "./Componentes/RegisterForm";
// import Home from "./Home";
import Auth from "./Componentes/Authori";
import Home from "./Componentes/Home";
import NotFound from "./Componentes/NotFound";
// import { set } from "react-hook-form";
import { useState } from "react";

// Componente principal de la aplicación
function App() {

  const [login,setLogin] =useState<boolean>(false);


  return (
    // Contenedor principal: pantalla completa, centrado con TailwindCSS
    <div className="h-screen flex justify-center items-center">
      {/* BrowserRouter habilita la navegación con rutas */}
      {/* basename="/WNA-EPS" indica que todas las rutas estarán bajo esa carpeta */}
      <BrowserRouter basename="/WNA-EPS">
        {/* Routes agrupa todas las rutas de la aplicación */}
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/auth" element={<Auth />}>
          {/* <Route index element={<Login puedoEntrar={setLogin} />} /> */}
            <Route index element={<Login puedoEntrar={setLogin} />} />
            <Route path="login" element={<Login puedoEntrar={setLogin} />} />
            <Route path="register" element={<RegisterForm />} />
          </Route>
          {
            login &&
            <Route path="/home" element={<p>Hola walter</p>} />
          }
          <Route path="*" element={<NotFound/>} />

          {/* Ruta raíz "/" -> Muestra el componente Login */}
          {/* <Route path="/" element={<Login />} /> */}

          {/* Ruta "/login" -> También muestra Login */}
          {/* <Route path="/login" element={<Login />} /> */}

          {/* Ruta "/register" -> Muestra el formulario de registro */}
          {/* <Route path="/register" element={<RegisterForm />} /> */}

          {/* Ruta "/home" -> Muestra la página principal Home */}
          {/* <Route path="/home" element={<Home />} /> */}

          {/* Ruta comodín "*" -> Para cualquier otra URL muestra un error 404 */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

// Exportamos App para usarla en main.tsx/index.tsx
export default App;
