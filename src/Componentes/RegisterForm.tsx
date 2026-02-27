import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { FormValues } from "../types";
import Campo from "./Campo";
import { useNavigate } from "react-router-dom";


export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Datos enviados:", data);
  };

  const navegarA = useNavigate(); //nuevo

  const handlerSubmit = handleSubmit(async (data) => {
    try {
      const cuerpo = new FormData();
      cuerpo.append("cedula", String(data.cedula));
      cuerpo.append("nombre", data.nombre);
      cuerpo.append("apellido", data.apellido);
      // cuerpo.append("correo",data.correo);
      cuerpo.append("foto", data.foto[0]);
      cuerpo.append("telefono", String(data.telefono));
      cuerpo.append("clave", data.clave);
      cuerpo.append("rol", "Paciente");

      const peticion = await fetch(import.meta.env.VITE_BACKEND+"/api/usuarios", {
        method: "POST",
        body: cuerpo,
      });
      if (!peticion.ok) {
        throw new Error("Ocurrio un error al crear el usuario");
      }
      const respuesta = await peticion.json();
      onSubmit(data);
      console.log(respuesta);
      alert("Usuario registrado con éxito");
      navegarA("/auth/login");
    } catch (error) {
      alert("Ha ocurrido un error");
      console.error(error);
    }
  });

  return (
    <div className="bg-white w-full h-full flex justify-center items-start rounded-[1.5rem]">
      <form
        onSubmit={handlerSubmit}
        className=" w-[100%] max-h-[90%] mx-auto p-6   rounded-[1.5rem] space-y-4"
      >
        {/* Nombre */}
        <div>
          <Campo
            nombre="nombre"
            placeholder="Nombre"
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
                if (/ {2,}/.test(valor))
                  return "No se permiten más de dos espacios seguidos";
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor))
                  return "Solo se permiten letras y espacios";
                return true;
              },
            })}
          />
        </div>
        {/* Apellido */}
        <div>
          <Campo
            nombre="apellido"
            placeholder="Apellido"
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
        </div>

        {/* Correo */}
        {/* <div>
          <Campo
            nombre="correo"
            placeholder="Correo electronico"
            tipo="text"
            errors={errors}
            regis={register("correo", {
              required: {
                value: true,
                message: "El correo es obligatorio",
              },
              validate: (campo) => {
                // Aquí llamas tu función validarCorreo paso a paso
                const resultado = validarCorreo(campo);
                return resultado === true ? true : resultado;
              },
            })}
          />
        </div> */}
        {/* Foto */}
        <div>
          <label className="cursor-pointer block w-full border rounded-lg p-2 text-gray-500">
            Foto: súbela desde tus archivos
            <input
              type="file"
              accept="image/*"
              {...register("foto")}
              className="hidden"
            />
          </label>
          {errors.foto && (
            <p className="text-red-500 text-[0.625rem]">{errors.foto.message}</p>
          )}
        </div>

        {/* Cédula */}
        <div>
          <Campo
            nombre="cedula"
            placeholder="Cedula"
            tipo="text"
            errors={errors}
            regis={register("cedula", {
              required: "La cédula es obligatoria",
              minLength: {
                value: 5,
                message: "La cédula debe tener mínimo 5 caracteres",
              },
              maxLength: {
                value: 10,
                message: "La cédula no debe superar 10 caracteres",
              },
              validate: (valor) => {
                if (/[<>]/.test(valor))
                  return "No se permiten los caracteres < o >";
                if (!/^[0-9]+$/.test(valor))
                  return "La cédula solo puede contener números";
                return true;
              },
            })}
          />
        </div>

        {/* Teléfono */}
        <div>
          <Campo
            nombre="telefono"
            placeholder="Telefono"
            tipo="text"
            errors={errors}
            regis={register("telefono", {
              required: "El teléfono es obligatorio",
              minLength: {
                value: 10,
                message: "El teléfono debe tener mínimo 10 caracteres",
              },
              maxLength: {
                value: 20,
                message: "El teléfono no debe superar 40 caracteres",
              },
              validate: (valor) => {
                if (/[<>]/.test(valor))
                  return "No se permiten los caracteres < o >";
                if (/ {2,}/.test(valor))
                  return "No se permiten más de dos espacios seguidos";
                if (/[^0-9ext\s()+]/.test(valor))
                  return "El teléfono solo puede contener números, espacios, 'ext', '+', y ()";
                if ((valor.match(/ext/g) || []).length > 1)
                  return "La palabra 'ext' solo se puede usar una vez";
                if ((valor.match(/\+/g) || []).length > 1)
                  return "El signo '+' solo se puede usar una vez";
                if (
                  (valor.match(/\(/g) || []).length > 1 ||
                  (valor.match(/\)/g) || []).length > 1
                )
                  return "Los paréntesis solo se pueden usar una vez";
                return true;
              },
            })}
          />
        </div>

        {/* Contraseña */}
        <div className="  flex flex-col relative">
          <Campo
            nombre="clave"
            placeholder="Contraseña"
            tipo="password"
            errors={errors}
            regis={register("clave", {
              required: "La contraseña es obligatoria",
              validate: (campo) => {
                if (!campo) return true;
                if (!/[a-z]/.test(campo))
                  return "Debe contener al menos una letra minúscula";
                if (!/[A-Z]/.test(campo))
                  return "Debe contener al menos una letra mayúscula";
                if (!/[0-9]/.test(campo))
                  return "Debe contener al menos un número";
                if (!/[^0-9A-Za-z]/.test(campo))
                  return "Debe contener al menos un carácter especial";
                if (/[<>]/.test(campo))
                  return "No se permiten los caracteres < o >";
                return true;
              },
            })}
          />
        </div>

        {/* Confirmar Contraseña */}
        <div className="  flex flex-col relative">
          <Campo
            nombre="confirmarClave"
            placeholder="Confirmar contraseña"
            tipo="password"
            errors={errors}
            regis={register("clave", {
              required: "La contraseña es obligatoria",
              validate: (campo) => {
                if (!campo) return true;
                if (!/[a-z]/.test(campo))
                  return "Debe contener al menos una letra minúscula";
                if (!/[A-Z]/.test(campo))
                  return "Debe contener al menos una letra mayúscula";
                if (!/[0-9]/.test(campo))
                  return "Debe contener al menos un número";
                if (!/[^0-9A-Za-z]/.test(campo))
                  return "Debe contener al menos un carácter especial";
                if (/[<>]/.test(campo))
                  return "No se permiten los caracteres < o >";
                return true;
              },
            })}
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
