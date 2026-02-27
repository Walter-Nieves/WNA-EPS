import { useState } from "react";
import authFetch from "../utils/AuthFetch";
import { useNavigate } from "react-router-dom";
import type { Usuario } from "../types";
import { obtenerFotoValida } from "../utils/Validaciones";
import type { Dispatch, SetStateAction } from "react";
import { usePhoto } from "../Contexts/PhotoContext";

interface Props {
  usuario: Usuario;
  setUsuario: Dispatch<SetStateAction<Usuario | null>>;
  onCancelar: () => void;
}

function ModalFotoPerfil({ usuario, setUsuario, onCancelar }: Props) {
  const navigate = useNavigate();
  const { dispatchTriggerVacunador } = usePhoto();

  const PLACEHOLDER =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const [preview, setPreview] = useState<string>(
    obtenerFotoValida(usuario.foto),
  );

  const [archivo, setArchivo] = useState<File | null>(null);

  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivo(file);

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const guardarFoto = async () => {
    if (!archivo) {
      alert("Selecciona una imagen");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("foto", archivo);

      const resp = await authFetch(
        import.meta.env.VITE_BACKEND + "/api/usuarios/me",
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        },
        navigate,
      );

      if (!resp) return;

      const data = await resp.json();

      //  ACTUALIZA USUARIO GLOBAL
      setUsuario((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          foto: data.foto,
        };
      });

      //  ACTUALIZA PHOTO CONTEXT INMEDIATAMENTE
      dispatchTriggerVacunador()

      alert("Foto actualizada correctamente");
      onCancelar();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar foto");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[30%] rounded-xl p-6 flex flex-col gap-4">
        <h2 className="text-[1.3rem] font-bold text-blue-900 text-center">
          Cambiar foto de perfil
        </h2>

        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-blue-900">
            <img
              src={preview}
              alt="Preview"
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER;
              }}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <label className="cursor-pointer bg-blue-900 text-white px-4 py-1 rounded hover:opacity-80 text-sm">
            Seleccionar archivo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={manejarArchivo}
            />
          </label>
        </div>

        <div className="flex flex-row justify-center gap-6 mt-2">
          <button
            onClick={guardarFoto}
            className="bg-blue-600 text-white px-5 py-1 rounded hover:bg-blue-700"
          >
            Guardar
          </button>

          <button
            onClick={onCancelar}
            className="bg-gray-300 px-5 py-1 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalFotoPerfil;
