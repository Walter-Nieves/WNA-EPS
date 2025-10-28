import Campo from "./Campo";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { FormValues } from "../types";
import { useNavigate } from "react-router-dom";

function FormularioMod() {
  const {
    register,
    handleSubmit,
    // watch,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Datos enviados:", data);
  };

  const navegarA = useNavigate(); //nuevo

  const handlerSubmit = handleSubmit(async (data) => {
    try {
      // const cuerpo = {
      //   cedula: data.cedula,
      //   nombre: data.nombre,
      //   apellido: data.apellido,
      //   correo: data.correo,
      //   foto: data.foto[0] ? await new Promise<string>((resolve, reject) => {
      //     const reader = new FileReader();
      //     reader.onload = () => {
      //       resolve(reader.result as string);
      //       console.log(reader.result);
      //     };
      //     reader.onerror = () => {
      //       reject("Error al leer el archivo");
      //     };
      //     reader.readAsDataURL(data.foto[0]);
      //   }) : "",
      //   telefono: data.telefono,
      //   clave: data.clave,
      // };
      const cuerpo = new FormData();
      cuerpo.append("cedula", String(data.cedula));
      cuerpo.append("nombre", data.nombre);
      cuerpo.append("apellido", data.apellido);
      cuerpo.append("correo", data.correo);
      cuerpo.append("foto", data.foto[0]);
      cuerpo.append("telefono", String(data.telefono));
      cuerpo.append("clave", data.clave);

      const peticion = await fetch(
        "https://wna-eps-production.up.railway.app/api/usuarios",
        {
          method: "PUT",
          body: cuerpo,
        }
      );
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
    <div className="bg-white h-full w-full flex justify-center items-center flex-col rounded-3xl">
      <form action="" onSubmit={handlerSubmit}>
        <Campo
          nombre="cedula"
          placeholder="Numero de cédula"
          tipo="number"
          errors={errors}
          regis={register("cedula", {
            required: {
              value: true,
              message: "El numero de cedula es obligatorio",
            },
            minLength: { value: 5, message: "Debe tener al menos 5 dígitos" },
            maxLength: {
              value: 10,
              message: "Debe tener como máximo 10 dígitos",
            },
          })}
        />
        <Campo
          nombre="nombre"
          placeholder="Nombres"
          tipo="text"
          errors={errors}
          regis={register("nombre", {
            required: {
              value: true,
              message: "El nombre es obligatorio",
            },
            minLength: { value: 5, message: "Debe tener al menos 5 dígitos" },
            maxLength: {
              value: 10,
              message: "Debe tener como máximo 10 dígitos",
            },
          })}
        />
        <Campo
          nombre="apellido"
          placeholder="Apellidos"
          tipo="text"
          errors={errors}
          regis={register("apellido", {
            required: {
              value: true,
              message: "El apellido es obligatorio",
            },
            minLength: { value: 5, message: "Debe tener al menos 5 dígitos" },
            maxLength: {
              value: 10,
              message: "Debe tener como máximo 10 dígitos",
            },
          })}
        />
        <Campo
          nombre="telefono"
          placeholder="Telefono"
          tipo="text"
          errors={errors}
          regis={register("telefono", {
            required: {
              value: true,
              message: "El telefono es obligatorio",
            },
            minLength: { value: 5, message: "Debe tener al menos 5 dígitos" },
            maxLength: {
              value: 10,
              message: "Debe tener como máximo 10 dígitos",
            },
          })}
        />
        <Campo
          nombre="foto"
          placeholder="Modifica tu foto"
          tipo="file"
          errors={errors}
          regis={register("foto", {
            required: {
              value: true,
              message: "El foto es obligatorio",
            },
            minLength: { value: 5, message: "Debe tener al menos 5 dígitos" },
            maxLength: {
              value: 10,
              message: "Debe tener como máximo 10 dígitos",
            },
          })}
        />
        <Campo
          nombre="clave"
          placeholder="Modifica tu clave"
          tipo="file"
          errors={errors}
          regis={register("clave", {
            minLength: { value: 5, message: "Debe tener al menos 5 dígitos" },
            maxLength: {
              value: 10,
              message: "Debe tener como máximo 10 dígitos",
            },
          })}
        />

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

export default FormularioMod;
