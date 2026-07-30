
import { Edit, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authFetch from "../utils/AuthFetch";
import type { Usuario } from "../types";
import { useState } from "react";
import { usePhoto } from "../Contexts/PhotoContext";
import EliminarUsuario from "../Componentes/EliminarUsuario";
import RestaurarUsuario from "../Componentes/RestaurarUsuario";

interface RolProps {
  usuario: Usuario;
  fotoPerfil: string;
  onEditarFoto: () => void;
  onAbrirConfig: () => void;
  mostrarBotonAdmin?: boolean;
  onModificarUsuario?: () => void;
}

function RolLayout({
  usuario,
  fotoPerfil,
  onEditarFoto,
  onAbrirConfig,
  mostrarBotonAdmin = false,
  onModificarUsuario,
}: RolProps) {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [showEliminar, setShowEliminar] = useState(false);
  const [showRestaurar, setShowRestaurar] = useState(false);

  const { fotos } = usePhoto();
  const fotoFinal = fotos[usuario._id] || fotoPerfil;

  const cerrarSesion = async () => {
    const resp = await authFetch(
      import.meta.env.VITE_BACKEND + "/auth/logout",
      { method: "POST" },
      navigate
    );

    if (!resp) return;

    const data = await resp.json();
    alert(data?.message);
    navigate("/");
  };

  return (
    <>
      <div className="bg-blue-900 w-[20%] h-full flex flex-col items-center text-white relative">
        {/* FOTO */}
        <div className="h-[25%] flex flex-col justify-center items-center relative">
          <button
            className="absolute top-2 bg-white/80 p-1 rounded-full"
            onClick={onEditarFoto}
          >
            <Edit size={18} className="text-blue-900" />
          </button>

          <img
            src={fotoFinal}
            onError={(e) => {
              e.currentTarget.src =
                "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            }}
            className="w-28 h-28 rounded-full border-2 border-white object-cover"
          />
        </div>

        {/* INFO */}
        <div className="text-sm space-y-2 text-center">
          <p
            className="cursor-pointer"
            onClick={() => setShowInfo((p) => !p)}
          >
            <strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}
          </p>

          {showInfo && (
            <>
              <p>
                <strong>Rol:</strong> {usuario.rol}
              </p>
              <p>
                <strong>Cédula:</strong> {usuario.cedula}
              </p>
              <p>
                <strong>Teléfono:</strong> {usuario.telefono}
              </p>
            </>
          )}
        </div>

        {/* SOLO ADMIN */}
        {mostrarBotonAdmin && (
          <>
            <button
              onClick={onModificarUsuario}
              className="mt-4 bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100"
            >
              Modificar usuario
            </button>

            <button
              onClick={() => setShowEliminar(true)}
              className="mt-2 bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100"
            >
              Eliminar usuarios
            </button>

            <button
              onClick={() => setShowRestaurar(true)}
              className="mt-2 bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100"
            >
              Restaurar usuario
            </button>
          </>
        )}

        {/* FOOTER */}
        <div className="mt-auto w-full flex justify-between px-4 pb-4">
          <button onClick={onAbrirConfig}>
            <Settings />
          </button>
          <button onClick={cerrarSesion}>
            <LogOut />
          </button>
        </div>
      </div>

      {showEliminar && (
        <EliminarUsuario onClose={() => setShowEliminar(false)} />
      )}

      {showRestaurar && (
        <RestaurarUsuario onClose={() => setShowRestaurar(false)} />
      )}
    </>
  );
}

export default RolLayout;
