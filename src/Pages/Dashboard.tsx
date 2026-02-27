
import { useState } from "react";
import { useAuth } from "../Contexts/AuthContexts";
import { Rol } from "../types";
import RolLayout from "./RolLayout";
import Vacunas from "./Vacunas";
import ModalFormulario from "../Componentes/ModalFormulario";
import ModalFotoPerfil from "../Componentes/ModalFotoPerfil";
import FormularioModAdmin from "../Componentes/FormularioModAdmin";
import { PhotoProvider } from "../Contexts/PhotoContext";

function Dashboard() {
  const { usuario, setUsuario } = useAuth();

  const [showModalConfig, setShowModalConfig] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showModalFoto, setShowModalFoto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!usuario) return null;

  const esAdministrador = usuario.rol === Rol.Administrador;

  return (
  <PhotoProvider>
    <div>
      {showModalConfig && (
        <ModalFormulario
          usuario={usuario}
          setUsuario={setUsuario}
          cerrar={() => setShowModalConfig(false)}
        />
      )}

      {esAdministrador && showAdminModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] max-w-xl rounded-2xl p-6 relative">
            <FormularioModAdmin
              onClose={() => setShowAdminModal(false)}
              onUsuarioActualizado={() => {
                setRefreshKey((prev) => prev + 1);
              }}
            />
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              X
            </button>
          </div>
        </div>
      )}

      <div className="bg-white w-screen h-screen flex overflow-hidden relative">
        <RolLayout
          usuario={usuario}
          fotoPerfil={
            typeof usuario.foto === "string" && usuario.foto.trim() !== ""
              ? usuario.foto
              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          onEditarFoto={() => setShowModalFoto(true)}
          onAbrirConfig={() => setShowModalConfig(true)}
          mostrarBotonAdmin={esAdministrador}
          onModificarUsuario={
            esAdministrador ? () => setShowAdminModal(true) : undefined
          }
        />

        {showModalFoto && (
          <ModalFotoPerfil
            usuario={usuario}
            setUsuario={setUsuario}
            onCancelar={() => setShowModalFoto(false)}
          />
        )}

        <Vacunas
          rol={usuario.rol}
          usuarioLogueado={usuario}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  </PhotoProvider>
);

}

export default Dashboard;
