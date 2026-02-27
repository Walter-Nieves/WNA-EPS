import Campo from "./Campo";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { Usuario } from "../types";
import authFetch from "../utils/AuthFetch";
import { useNavigate } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";

interface FormInputs {
  nombre: string;
  apellido: string;
  telefono: string;
}

interface Props {
  usuario: Usuario;
  setUsuario: Dispatch<SetStateAction<Usuario | null>>;
  cerrar: () => void;
}

function FormularioMod({ usuario, setUsuario, cerrar }: Props) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
    },
  });

  const valoresActuales = watch();

  const hayCambiosReales =
    valoresActuales.nombre !== usuario.nombre ||
    valoresActuales.apellido !== usuario.apellido ||
    valoresActuales.telefono !== usuario.telefono;

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const resp = await authFetch(
        import.meta.env.VITE_BACKEND + "/api/usuarios/me",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
        navigate,
      );

      if (!resp || !resp.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      // ⚠️ Puede venir vacío si el backend responde 204
      let actualizado: Partial<Usuario> = {};

      try {
        actualizado = await resp.json();
      } catch {
        actualizado = data; // fallback seguro
      }

      // 🔥 ACTUALIZA INMEDIATAMENTE EL CONTEXTO
      setUsuario((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          ...actualizado,
        };
      });

      alert("Datos actualizados correctamente");
      cerrar();
    } catch (error) {
      console.error("Error real:", error);
      alert("Error al actualizar");
    }
  };

  return (
    <div className="bg-white h-full w-full flex justify-center items-center flex-col rounded-[1.5rem]">
      <form onSubmit={handleSubmit(onSubmit)} className="w-[60%] space-y-4">
        <h2 className="text-3xl text-center">Modificar datos</h2>

        <Campo
          nombre="nombre"
          placeholder="Nombres"
          tipo="text"
          errors={errors}
          regis={register("nombre", {
            required: "El nombre es obligatorio",
            minLength: {
              value: 2,
              message: "El nombre debe tener al menos 2 caracteres",
            },
            maxLength: {
              value: 40,
              message: "El nombre no debe superar 40 caracteres",
            },
            validate: (valor) => {
              if (/[<>]/.test(valor))
                return "No se permiten los caracteres < o >";
              if (/ {3,}/.test(valor))
                return "No se permiten más de dos espacios seguidos";
              if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor))
                return "Solo se permiten letras y espacios";
              return true;
            },
          })}
        />

        <Campo
          nombre="apellido"
          placeholder="Apellidos"
          tipo="text"
          errors={errors}
          regis={register("apellido", {
            required: "El apellido es obligatorio",
            minLength: {
              value: 2,
              message: "El apellido debe tener al menos 2 caracteres",
            },
            maxLength: {
              value: 40,
              message: "El apellido no debe superar 40 caracteres",
            },
            validate: (valor) => {
              if (/[<>]/.test(valor))
                return "No se permiten los caracteres < o >";
              if (/ {2,}/.test(valor))
                return "No se permiten más de dos espacios seguidos";
              if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor))
                return "Solo se permiten letras y espacios";
              return true;
            },
          })}
        />

        <Campo
          nombre="telefono"
          placeholder="Telefono"
          tipo="text"
          errors={errors}
          regis={register("telefono", {
            required: "El telefono es obligatorio",
            minLength: {
              value: 10,
              message: "El teléfono debe tener mínimo 10 caracteres",
            },
            maxLength: {
              value: 35,
              message: "El teléfono no debe superar 35 caracteres",
            },
            validate: (valor) => {
              const telefono = String(valor ?? "").toLowerCase();

              if (/[<>]/.test(telefono))
                return "No se permiten los caracteres < o >";

              if (/ {2,}/.test(telefono))
                return "No se permiten más de dos espacios seguidos";

              if ((telefono.match(/\+/g) || []).length > 1)
                return "El signo '+' solo se puede usar una vez";

              if (
                (telefono.match(/\(/g) || []).length > 1 ||
                (telefono.match(/\)/g) || []).length > 1
              )
                return "Los paréntesis solo se pueden usar una vez";

                if (/[^0-9\s()+ext]/i.test(telefono))
                  return "El teléfono contiene caracteres inválidos";

                if ((telefono.match(/ext/g) || []).length > 1)
                  return "La palabra 'ext' solo se puede usar una vez";

              return true;
            },
          })}
        />

        <button
          disabled={!hayCambiosReales}
          type="submit"
          className={`w-full py-2 rounded-lg text-white transition ${
            hayCambiosReales
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          Modificar
        </button>

        <button
          type="button"
          onClick={cerrar}
          className="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default FormularioMod;