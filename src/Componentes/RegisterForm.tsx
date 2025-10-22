import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
// import { useState } from "react";
// import closedeye from "/icons/eye-slash.svg";
// import openedeye from "/icons/eye.svg";
import { validarCorreo } from "../utils/Validaciones";
import type { FormValues } from "../types";
import Campo from "./Campo";
import { useNavigate } from "react-router-dom";




export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    // watch,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Datos enviados:", data);
  };

   const navegarA = useNavigate();//nuevo

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
      cuerpo.append("cedula",String(data.cedula) );
      cuerpo.append("nombre", data.nombre);
      cuerpo.append("apellido", data.apellido);
      cuerpo.append("correo", data.correo);
      cuerpo.append("foto", data.foto[0]);
      cuerpo.append("telefono", String(data.telefono));
      cuerpo.append("clave", data.clave);


      const peticion = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        body: cuerpo
      });
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

  // const [mostrarClave, setMostrarClave] = useState(false);

  // const toggleVisibilidad = () => {
  //   setMostrarClave(!mostrarClave);
  // };
  

  return (
    <div className="bg-white w-full h-full flex justify-center items-start rounded-3xl">
      <form
        onSubmit={handlerSubmit}
        className=" w-[100%] max-h-[90%] mx-auto p-6   rounded-3xl space-y-4"
      >
        {/* Nombre */}
        <div>
          <Campo nombre="nombre" placeholder="Nombre" tipo="text" errors={errors}
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
            })} />
          {/* <input
            type="text"
            placeholder="Nombre completo"
            {...register("nombre", {
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
            className="mt-1 block w-full border rounded-lg p-2"
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm">{errors.nombre.message}</p>
          )} */}
        </div>
          {/* Apellido */}
        <div>
          <Campo nombre="apellido" placeholder="Apellido" tipo="text" errors={errors}
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
            })} />
        </div>

        {/* Correo */}
        <div>
          <Campo nombre="correo" placeholder="Correo electronico" tipo="text" errors={errors}
          regis={register("correo", {
              required: {
                value: true,
                message: "El correo es obligatorio" ,
              },
              validate: (campo) => {
                // Aquí llamas tu función validarCorreo paso a paso
                const resultado = validarCorreo(campo);
                return resultado === true ? true : resultado;
              },
              // validate: (campo) => {
              //   //[a-zA-Z0-9.-] correo empieza con letras,numeros,punto o guion
              //   //el correo debe tener @
              //   //[a-zA-Z0-9.-] lo que sigue al arroba debe tener letras,numeros,punto o guion
              //   //\. lo que sigue debe tener punto
              //   //[a-zA-Z]{2,} finalmente debe tener minimo dos letras
              //   //test(algo) verificar si un texto cumple con nuestro regex

              //   const esCorreo =
              //     /[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(campo);
              //   if (!esCorreo) {
              //     return "El correo ingresado no es valido";
              //   }
              // },
            })}/>
          {/* <input
            type="text"
            placeholder="Correo electronico"
            {...register("correo", {
              required: {
                value: true,
                message: "El correo es obligatorio" ,
              },
              validate: (campo) => {
                // Aquí llamas tu función validarCorreo paso a paso
                const resultado = validarCorreo(campo);
                return resultado === true ? true : resultado;
              },
              // validate: (campo) => {
              //   //[a-zA-Z0-9.-] correo empieza con letras,numeros,punto o guion
              //   //el correo debe tener @
              //   //[a-zA-Z0-9.-] lo que sigue al arroba debe tener letras,numeros,punto o guion
              //   //\. lo que sigue debe tener punto
              //   //[a-zA-Z]{2,} finalmente debe tener minimo dos letras
              //   //test(algo) verificar si un texto cumple con nuestro regex

              //   const esCorreo =
              //     /[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(campo);
              //   if (!esCorreo) {
              //     return "El correo ingresado no es valido";
              //   }
              // },
            })}
             className="mt-1 block w-full border rounded-lg p-2"
          />
          {errors.correo && (
            <span className="text-red-500 text-sm">{errors.correo.message}</span>
          )} */}
        </div>
        {/* Foto */}
        <div>
          <label className="cursor-pointer block w-full border rounded-lg p-2 text-gray-500">
            Foto: súbela desde tus archivos
            <input
              type="file"
              accept="image/*"
              {...register("foto", {
                required: "La foto es obligatoria",
              })}
              className="hidden"
            />
          </label>
          {errors.foto && (
            <p className="text-red-500 text-[10px]">{errors.foto.message}</p>
          )}
        </div>

        {/* Cédula */}
        <div>
          <Campo nombre="cedula" placeholder="Cedula" tipo="text" errors={errors}
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
            })}/>
          {/* <input
            type="text"
            placeholder="Cedula"
            {...register("cedula", {
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
            className="mt-1 block w-full border rounded-lg p-2"
          />
          {errors.cedula && (
            <p className="text-red-500 text-sm">{errors.cedula.message}</p>
          )} */}
        </div>

        {/* Teléfono */}
        <div>
          <Campo nombre="telefono" placeholder="Telefono" tipo="text" errors={errors}
          regis={register("telefono", {
              required: "El teléfono es obligatorio",
              minLength: {
                value: 10,
                message: "El teléfono debe tener mínimo 10 caracteres",
              },
              maxLength: {
                value: 20,
                message: "El teléfono no debe superar 20 caracteres",
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
            })}/>
          {/* <input
            type="text"
            placeholder="Telefono"
            {...register("telefono", {
              required: "El teléfono es obligatorio",
              minLength: {
                value: 10,
                message: "El teléfono debe tener mínimo 10 caracteres",
              },
              maxLength: {
                value: 20,
                message: "El teléfono no debe superar 20 caracteres",
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
            className="mt-1 block w-full border rounded-lg p-2"
          />
          {errors.telefono && (
            <p className="text-red-500 text-sm">{errors.telefono.message}</p>
          )} */}
        </div>

        {/* Contraseña */}
        <div className="  flex flex-col relative">
          {/* <img
            className=" pl-1 cursor-pointer absolute  top-4 right-2"
            onClick={toggleVisibilidad}
            src={mostrarClave ? closedeye : openedeye}
            alt=""
          /> */}
          <Campo nombre="clave" placeholder="Contraseña" tipo="password" errors={errors}
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
            })}/>
          {/* <input
            type={mostrarClave ? "text" : "password"}
            placeholder="Contraseña"
            {...register("clave", {
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
            className="mt-1 block w-full border rounded-lg p-2"
          />
          {errors.clave && (
            <p className="text-red-500 text-sm flex justify-start w-full">{errors.clave.message}</p>
          )} */}
        </div>

        {/* Confirmar Contraseña */}
        <div className="  flex flex-col relative">
          {/* <img
            className=" pl-1 cursor-pointer absolute  top-4 right-2"
            onClick={toggleVisibilidad2}
            src={mostrarClave2 ? closedeye : openedeye}
            alt=""
          /> */}
          <Campo nombre="confirmarClave" placeholder="Confirmar contraseña" tipo="password" errors={errors}
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
            })}/>
       
          {/* <input
            type={mostrarClave2 ? "text" : "password"}
            placeholder="Confirmar contraseña"
            {...register("confirmarClave", {
              required: "Debes confirmar la contraseña",
              validate: (valor) =>
                valor === watch("clave") || "Las contraseñas no coinciden",
            })}
            className="mt-1 block w-full border rounded-lg p-2"
          />
          {errors.confirmarClave && (
            <p className="text-red-500 text-sm flex justify-start w-full">
              {errors.confirmarClave.message}
            </p>
          )} */}
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
