// Página de Bienvenida para una plataforma de seguimiento de vacunas
// ------------------------------------------------------------------
// - Diseño tipo GitHub (minimalista y profesional)
// - Enfocado en salud y seguimiento de vacunas
// - Botones para iniciar sesión y registrarse
// - Fondo con gradiente azul salud
// ------------------------------------------------------------------

import { useNavigate } from "react-router-dom";

function Bienvenida() {
  const navegarA = useNavigate();

  return (
    // Fondo de pantalla completa con gradiente tipo "salud"
    <div
      className="w-screen h-screen flex flex-col justify-center items-center text-white p-6"
      style={{
        background: "linear-gradient(120deg, #0a2f43, #185a74, #2589a6)",
      }}
    >
      {/* Contenedor principal */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-xl">

        {/* Título principal */}
        <h1 className="text-[2.25rem] font-bold">
          Bienvenido a <span className="text-blue-300">WNA EPS</span>
        </h1>

        {/* Descripción */}
        <p className="text-gray-200 text-lg">
          Controla tu historial de vacunación, recibe recordatorios y lleva un 
          seguimiento completo de tus dosis aplicadas y pendientes. 
          Mantén tu salud siempre al día.
        </p>

    {/* Botones principales */}
        <div className="flex flex-row space-x-4 mt-4">

          {/* Botón Login */}
          <button
            onClick={() => navegarA("/auth/login")}
            className="bg-white text-blue-900 font-semibold px-6 py-2 rounded-lg hover:opacity-80 transition"
          >
            Iniciar Sesión
          </button>

          {/* Botón Registro */}
          <button
            onClick={() => navegarA("/auth/register")}
            className="bg-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Registrarse
          </button>

        </div>

      </div>
    </div>
  );
}

export default Bienvenida;
