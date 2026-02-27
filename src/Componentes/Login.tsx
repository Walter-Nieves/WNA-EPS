import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import info from "../info";
import type { LoginInputs } from "../types";
import CampoGenerico from "./Campo";
import { useAuth } from "../Contexts/AuthContexts";

const Campo = CampoGenerico<LoginInputs>;

function Login() {
  //nuevo props
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>();

  const { setLogged, setUsuario } = useAuth();
  const navegarA = useNavigate();
  // const { setLoading} = useAuth();

  const handlerSubmit = handleSubmit(async (data) => {
    try {
      // 🟢 NUEVO: URL del backend local (puede ser Railway, pero con cookie segura)
      const peticion = await fetch(
        import.meta.env.VITE_BACKEND + "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cedula: data.cedula, clave: data.clave }), // 🔵 CAMBIO: ajustado a la API (usa correo o cedula según backend)
          credentials: "include", //NUEVO: Permite enviar y recibir cookies HttpOnly
        },
      );

      const respuesta = await peticion.json();

      if (!peticion.ok) {
        throw new Error(respuesta?.error || "Error en login");
        //throw new Error(respuesta);
      }

      console.log("✅ Login correcto:", respuesta);

      alert("Bienvenido, sesión iniciada 🚀");

      // setLoading(true);
      setLogged(true);
      //  AHORA TRAEMOS EL USUARIO
      const userResp = await fetch(
        import.meta.env.VITE_BACKEND + "/api/usuarios/me",
        { credentials: "include" },
      );

      const usuario = await userResp.json();
      setUsuario(usuario);

      // Redirección base
      navegarA("/home", { replace: true });
    } catch (error) {
      console.error("❌ Error en login:", error);
      alert("Ha ocurrido un error al iniciar sesión");
    }
  });
  return (
    <div className="bg-white h-full w-full flex justify-center items-center flex-col rounded-[1.5rem]">
      <h2 className="text-[1.5rem] font-bold mb-6">{info.login.parrafo1}</h2>

      <form
        onSubmit={handlerSubmit}
        noValidate //  Desactiva validación nativa del navegador
        className="w-full max-w-sm flex flex-col gap-4"
      >
        {/* Email */}
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
        <div className="  flex flex-col relative">
          <Campo
            nombre="clave"
            placeholder="Contraseña"
            tipo="password"
            errors={errors}
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
            })}
          />
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
