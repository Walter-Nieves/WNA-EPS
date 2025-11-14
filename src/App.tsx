
// import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import Login from "./Componentes/Login";
// import RegisterForm from "./Componentes/RegisterForm";
// import Auth from "./Componentes/Authori";
// import Home from "./Componentes/Home";
// import NotFound from "./Componentes/NotFound";
// import FormularioMod from "./Componentes/FormularioMod";

// function App() {
//   const [login, setLogin] = useState<boolean>(false);
//   const [cargando, setCargando] = useState<boolean>(true);

//   // 🟦 Verifica sesión desde el backend (cookie HttpOnly)
//   useEffect(() => {
//     const verificarSesion = async () => {
//       try {
//         const respuesta = await fetch("http://localhost:3000/auth/perfil", {
//           credentials: "include",
//         });
//         setLogin(respuesta.ok);
//       } catch (error) {
//         console.error("Error verificando sesión:", error);
//         setLogin(false);
//       } finally {
//         setCargando(false);
//       }
//     };

//     verificarSesion();
//   }, []);

//   // 🟨 Pantalla de carga mientras se valida la sesión
//   if (cargando) {
//     return (
//       <div className="h-screen flex justify-center items-center text-xl text-gray-600">
//         Verificando sesión...
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex justify-center items-center">
//       <BrowserRouter basename="/WNA-EPS">
//         <Routes>
//           {/* 🟩 Si ya está logueado y entra al login, lo redirige a /home */}
//           {login ? (
//             <Route path="/auth/*" element={<Navigate to="/home" replace />} />
//           ) : (
//             <Route path="/auth" element={<Auth />}>
//               <Route index element={<Login puedoEntrar={setLogin} />} />
//               <Route path="login" element={<Login puedoEntrar={setLogin} />} />
//               <Route path="register" element={<RegisterForm />} />
//               <Route path="form" element={<FormularioMod />} />
//             </Route>
//           )}

//           {/* 🟦 Si NO está logueado → redirigir a /auth/login */}
//           {!login && (
//             <>
//               <Route path="/" element={<Navigate to="/auth/login" replace />} />
//               <Route path="/home" element={<Navigate to="/auth/login" replace />} />
//             </>
//           )}

//           {/* 🟢 Si está logueado → mostrar Home */}
//           {login && (
//             <>
//               <Route path="/" element={<Navigate to="/home" replace />} />
//               <Route path="/home" element={<Home />} />
//             </>
//           )}

//           {/* 🟥 Rutas inexistentes → NotFound */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;

// Importamos las herramientas principales de React Router DOM
// Navigate permite redirigir programáticamente a otra ruta
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Importamos los hooks de React para manejar estado y efectos secundarios
import { useEffect, useState } from "react";

// Importamos los componentes que representan las páginas o secciones de la app
import Login from "./Componentes/Login";
import RegisterForm from "./Componentes/RegisterForm";
import Auth from "./Componentes/Authori";
import Home from "./Componentes/Home";
import NotFound from "./Componentes/NotFound";
import FormularioMod from "./Componentes/FormularioMod";

// Componente principal de toda la aplicación
function App() {

  // Estado que guarda si el usuario está autenticado o no
  const [login, setLogin] = useState<boolean>(false);

  // Estado para controlar si todavía se está verificando la sesión (pantalla de carga)
  const [cargando, setCargando] = useState<boolean>(true);

  // 🟦 useEffect: al montar el componente, verifica la sesión del usuario
  // Consulta al backend si existe una cookie válida con el token de sesión
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        // Se hace una petición al backend para verificar la cookie de sesión
        const respuesta = await fetch("http://localhost:3000/auth/perfil", {
          credentials: "include", // Importante: envía cookies al servidor
        });

        // Si la respuesta es correcta (HTTP 200), el usuario está logueado
        setLogin(respuesta.ok);
      } catch (error) {
        // Si hay error (ej. backend caído o token inválido), lo consideramos deslogueado
        console.error("Error verificando sesión:", error);
        setLogin(false);
      } finally {
        // Una vez finalizada la verificación (éxito o error), quitamos la pantalla de carga
        setCargando(false);
      }
    };

    verificarSesion(); // Llamamos la función al iniciar
  }, []); // Solo se ejecuta una vez, al montar el componente

  // 🟨 Si todavía se está verificando la sesión, mostramos una pantalla temporal
  // Evita que la app "parpadee" mostrando contenido incorrecto
  if (cargando) {
    return (
      <div className="h-screen flex justify-center items-center text-xl text-gray-600">
        Verificando sesión...
      </div>
    );
  }

  // 🟩 Si ya se verificó la sesión, renderizamos las rutas normales
  return (
    <div className="h-screen flex justify-center items-center">
      {/* BrowserRouter: envuelve toda la app para habilitar el enrutamiento */}
      {/* basename="/WNA-EPS" indica que las rutas estarán bajo esa carpeta base */}
      <BrowserRouter basename="/WNA-EPS">
        <Routes>

          {/* 🟩 Si el usuario YA está logueado e intenta entrar al login, lo redirigimos a /home */}
          {login ? (
            <Route path="/auth/*" element={<Navigate to="/home" replace />} />
          ) : (
            // 🟥 Si NO está logueado, mostramos las rutas de autenticación
            <Route path="/auth" element={<Auth />}>
              {/* Ruta por defecto dentro de /auth */}
              <Route index element={<Login puedoEntrar={setLogin} />} />
              {/* Ruta /auth/login */}
              <Route path="login" element={<Login puedoEntrar={setLogin} />} />
              {/* Ruta /auth/register */}
              <Route path="register" element={<RegisterForm />} />
              {/* Ruta /auth/form */}
              <Route path="form" element={<FormularioMod />} />
            </Route>
          )}

          {/* 🟦 Si NO está logueado → redirigir a /auth/login */}
          {!login && (
            <>
              {/* Si entra a la raíz / lo mandamos a login */}
              <Route path="/" element={<Navigate to="/auth/login" replace />} />
              {/* Si intenta ir a /home sin sesión, también lo mandamos a login */}
              <Route path="/home" element={<Navigate to="/auth/login" replace />} />
            </>
          )}

          {/* 🟢 Si está logueado → mostrar Home */}
          {login && (
            <>
              {/* Si entra a la raíz / lo mandamos directamente a /home */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              {/* Ruta protegida: solo visible si está logueado */}
              <Route path="/home" element={<Home />} />
            </>
          )}

          {/* 🟥 Rutas inexistentes → mostrar página de error 404 */}
          {/* Este componente se muestra cuando ninguna ruta anterior coincide */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

// Exportamos el componente principal
export default App;