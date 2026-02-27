import Campo from "./Campo";
import Select from "./Select";
import { useForm } from "react-hook-form";
import type { FormValues, Usuario } from "../types";
import { Rol } from "../types";
import { useState } from "react";
import { User } from "lucide-react";
import ModalUsuarioEstado from "./ModalUsuarioEstado";

interface Props {
  onClose: () => void;
  onUsuarioActualizado: (usuario: Usuario) => void;
}

function FormularioModAdmin({ onClose, onUsuarioActualizado }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>();

  const [usuarioEncontrado, setUsuarioEncontrado] = useState<Usuario | null>(
    null,
  );

  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);

  const [estadoUsuario, setEstadoUsuario] = useState<
    "encontrado" | "no-encontrado" | null
  >(null);

  const cedula = watch("cedula");

  /* =======================
     BUSCAR USUARIO MANUAL
  ======================= */

  const buscarUsuarioManual = async () => {
    const esValido = await trigger("cedula");

    if (!esValido) return; //  Si no pasa validación, muestra error y NO busca

    if (!cedula) return;

    try {
      const resp = await fetch(
        import.meta.env.VITE_BACKEND + "/api/usuarios/" + cedula,
        { credentials: "include" },
      );

      if (resp.status === 404) {
        setEstadoUsuario("no-encontrado");
        setUsuarioEncontrado(null);
        return;
      }

      if (!resp.ok) return;

      const usuario: Usuario = await resp.json();

      setUsuarioEncontrado(usuario);
      setEstadoUsuario("encontrado");

      setValue("nombre", usuario.nombre);
      setValue("apellido", usuario.apellido);
      setValue("telefono", usuario.telefono);
      setValue("rol", usuario.rol as Rol);
    } catch (error) {
      console.error(error);
    }
  };

  /* =======================
     DETECTAR CAMBIOS
  ======================= */
  const valores = watch();

  const hayCambios =
    usuarioEncontrado &&
    (valores.nombre !== usuarioEncontrado.nombre ||
      valores.apellido !== usuarioEncontrado.apellido ||
      valores.telefono !== usuarioEncontrado.telefono ||
      valores.rol !== usuarioEncontrado.rol ||
      valores.foto?.length > 0);

  /* =======================
     MODIFICAR USUARIO
  ======================= */
  const handlerSubmit = handleSubmit(async (data) => {
    if (!usuarioEncontrado) return;

    try {
      const cuerpo = new FormData();
      cuerpo.append("cedula", String(data.cedula));
      cuerpo.append("nombre", data.nombre);
      cuerpo.append("apellido", data.apellido);
      cuerpo.append("telefono", String(data.telefono));
      cuerpo.append("rol", data.rol);

      if (data.foto?.[0]) cuerpo.append("foto", data.foto[0]);

      const peticion = await fetch(
        import.meta.env.VITE_BACKEND + "/api/usuarios/" + usuarioEncontrado._id,
        {
          method: "PUT",
          body: cuerpo,
          credentials: "include",
        },
      );

      if (!peticion.ok) throw new Error();

      const usuarioActualizado: Usuario = await peticion.json();

      setUsuarioEncontrado(usuarioActualizado);

      alert("Usuario modificado con éxito");
      // avisar al padre que refresque
      onUsuarioActualizado(usuarioActualizado);
      //  cerrar modal principal
      onClose();
    } catch (error) {
      alert("Ha ocurrido un error");
      console.error(error);
    }
  });

  return (
    <div className="bg-white h-full w-full flex justify-center items-center flex-col rounded-[1.5rem]">
      <form onSubmit={handlerSubmit} className="w-full">
        <h2 className="flex justify-center items-center pb-4 text-4xl">
          Modificar usuario
        </h2>

        {/* CÉDULA */}
        <div className="flex w-full gap-[0.5rem] mb-[0.5rem]">
          <div className="w-[80%]">
            <Campo
              nombre="cedula"
              placeholder="Número de cédula"
              tipo="number"
              disabled={mostrarFormulario}
              errors={errors}
              regis={register("cedula", {
                required: "La cédula es obligatoria",
                validate: (value) =>
                  value.toString().length >= 6 ||
                  "La cédula ingresada debe tener al menos seis digitos",
              })}
            />
          </div>

          {/* ICONO QUE DISPARA LA BÚSQUEDA */}
          <div
            onClick={buscarUsuarioManual}
            className="w-[20%] flex items-center justify-center rounded-lg bg-gray-200 cursor-pointer"
          >
            {usuarioEncontrado?.foto ? (
              <img
                src={usuarioEncontrado.foto}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User size={32} />
            )}
          </div>
        </div>

        {mostrarFormulario && usuarioEncontrado && (
          <>
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

            <Campo
              nombre="foto"
              placeholder="Modificar foto"
              tipo="file"
              errors={errors}
              regis={register("foto")}
            />

            <Select
              nombre="rol"
              titulo="Rol"
              errors={errors}
              setValue={setValue}
              regis={register("rol")}
              opciones={Object.values(Rol)}
            />

            <button
              type="submit"
              disabled={!hayCambios}
              className={`w-full py-[0.5rem] rounded-lg mt-[0.5rem] text-white ${
                hayCambios
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Modificar
            </button>
          </>
        )}
      </form>

      {estadoUsuario && (
        <ModalUsuarioEstado
          tipo={estadoUsuario}
          cedula={cedula}
          foto={usuarioEncontrado?.foto}
          onClose={() => {
            if (estadoUsuario === "encontrado") {
              setMostrarFormulario(true);
            }
            setEstadoUsuario(null);
          }}
        />
      )}
    </div>
  );
}

export default FormularioModAdmin;
