import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import info from "../info";
// import { useState } from "react";
// import closedeye from "/icons/eye-slash.svg";
// import openedeye from "/icons/eye.svg";
import type { LoginInputs } from "../types";
import CampoGenerico from "./Campo";

// --- Validación personalizada de correo ---
// Función de validación paso a paso
// const validarCorreo = (campo: string) => {
//   const valor = String(campo ?? "").trim();

//   if (!valor) return "El correo electrónico es obligatorio";

//   // 1. Debe tener exactamente un "@"
//   const partes = valor.split("@");
//   if (partes.length !== 2) return "El correo debe contener exactamente un @";

//   const [local, dominio] = partes;

//   // 2. Local-part (antes del @)
//   if (/[^a-zA-Z0-9._-]+/.test(local)) {
//     return "El nombre de usuario solo puede contener letras (a-z, A-Z), números (0-9), punto (.), guion (-) y guion bajo (_)";
//   }
//   if (local.startsWith(".") || local.endsWith(".")) {
//     return "El nombre de usuario no puede empezar ni terminar con un punto (.)";
//   }

//   // 3. Dominio
//   if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(dominio)) {
//     return "El dominio debe ser válido, por ejemplo: midominio.com o correo.ejemplo.org";
//   }

//   return true; // válido
// };

const Campo = CampoGenerico<LoginInputs>

function Login({puedoEntrar}: {puedoEntrar: (valor:boolean)=>void} ) { //nuevo props
  const {
    register,
    handleSubmit,
    // getValues,
    // setValue,
    formState: { errors },
  } = useForm<LoginInputs>();

  const navegarA = useNavigate();//nuevo

  const handlerSubmit = handleSubmit(async (data) => {
    try {
      const peticion = await fetch(
        "http://localhost:3000/api/login/",{
          method:"POST",
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );
      if (!peticion.ok) {
        throw new Error("Los datos ingresados son incorrectos");
      }
      const respuesta = await peticion.json();
      console.log(respuesta);
      onSubmit(data);
      alert(" Binvenido login exitoso 🚀");
      puedoEntrar(true); //nuevo
      navegarA("/home"); //nuevo
    } catch (error) {
      alert("Ha ocurrido un error");
      console.error(error);
    }
  });

  const navigate = useNavigate();

  const onSubmit = (data: LoginInputs) => {
    console.log("Datos de login:", data);
    alert("Login exitoso 🚀");
    navigate("/");
  };

  // const [mostrarClave, setMostrarClave] = useState(false);

  // const toggleVisibilidad = () => {
  //   setMostrarClave(!mostrarClave);
  // };

  return (
    <div className="bg-white h-full w-full flex justify-center items-center flex-col rounded-3xl">
      <h2 className="text-2xl font-bold mb-6">{info.login.parrafo1}</h2>

      <form
        onSubmit={handlerSubmit}
        noValidate // 🚀 Desactiva validación nativa del navegador
        className="w-full max-w-sm flex flex-col gap-4"
      >
        {/* Email */}
         <Campo nombre="cedula" placeholder="Numero de cédula" tipo="number" errors={errors}
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

            
          })}/>
        {/* <input
          type="number" // 👈 importante: no usar "email"
          placeholder="Numero de cédula"
          {...register("cedula", {
            required: {
              value: true,
              message: "El numero de cedula es obligatorio",
            },
            minLength: { value: 5, message: "Debe tener al menos 5 dígitos" },
            maxLength: {
              value: 10,
              message: "Debe tener como máximo 10 dígitos",
            },

            onChange: () => {
              const cedula = getValues().cedula;
              const texto = String(cedula).replaceAll("3", "0");
              setValue("cedula", Number(texto));
            },
          })}
          className="border border-gray-300 p-2 rounded-lg"
        />
        {errors.cedula && (
          <p className="text-red-500 text-sm">
            {errors.cedula.message as string}
          </p>
        )} */}

        {/* Contraseña */}
        <div className="  flex flex-col relative">
          {/* <img
              className=" pl-1 cursor-pointer absolute top-3 right-2"
              onClick={toggleVisibilidad}
              src={
                mostrarClave
                  ? closedeye
                  : openedeye
              }
              alt=""
            /> */}
            <Campo nombre="clave" placeholder="Contraseña" tipo="text" errors={errors}
          regis={register("clave", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 6,
                message: "Debe tener al menos 6 caracteres",
              },
              maxLength: {
                value: 20,
                message: "No puede tener más de 20 caracteres",
              },
              validate: (campo) => {
                if (!campo) return "La contraseña es obligatoria";
                if (!/[a-z]/.test(campo)) return "Debe incluir una minúscula";
                if (!/[A-Z]/.test(campo)) return "Debe incluir una mayúscula";
                if (!/[0-9]/.test(campo)) return "Debe incluir un número";
                if (!/[^0-9A-Za-z]/.test(campo))
                  return "Debe incluir un carácter especial";
                if (/[<>]/.test(campo)) return "No puede contener < o >";
                return true;
              },
            })}/>
          {/* <input
            type={mostrarClave ? "text" : "password"}
            placeholder="Contraseña"
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 8,
                message: "Debe tener al menos 8 caracteres",
              },
              maxLength: {
                value: 20,
                message: "No puede tener más de 20 caracteres",
              },
              validate: (campo) => {
                if (!campo) return "La contraseña es obligatoria";
                if (!/[a-z]/.test(campo)) return "Debe incluir una minúscula";
                if (!/[A-Z]/.test(campo)) return "Debe incluir una mayúscula";
                if (!/[0-9]/.test(campo)) return "Debe incluir un número";
                if (!/[^0-9A-Za-z]/.test(campo))
                  return "Debe incluir un carácter especial";
                if (/[<>]/.test(campo)) return "No puede contener < o >";
                return true;
              },
            })}
            className="border border-gray-300 p-2 rounded-lg w-full"
          />
          {errors.password && (
            <p className="text-red-500 text-sm flex justify-start w-full pt-3">
              {errors.password.message as string}
            </p>
          )} */}
        </div>

        {/* Botón login */}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          {info.login.parrafo3}
        </button>

        {/* Enlace recuperar clave */}
        <Link
          to="/forgot-password"
          className="text-sm text-blue-600 text-center mt-2 hover:underline"
        >
          {info.login.parrafo2}
        </Link>
      </form>
      
    </div>
  );
}

export default Login;
