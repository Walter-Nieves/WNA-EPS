import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  // Estado para controlar el ángulo de rotación del gradiente
  const [angle, setAngle] = useState<number>(45);

  // useEffect para animar el fondo rotando lentamente
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 1) % 360);
    }, 100); // velocidad de rotación (100 ms)
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-screen h-screen flex flex-col justify-center items-center text-center text-white transition-all duration-500"
      style={{
        background: `linear-gradient(${angle}deg, #0f2027, #203a43, #2c5364)`,
      }}
    >
      {/* Animación del número 404 */}
      <motion.h1
        className="text-[6rem] font-extrabold mb-4 text-blue-300 drop-shadow-lg"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 10 }}
      >
        404
      </motion.h1>

      {/* Mensaje descriptivo */}
      <motion.h2
        className="text-[1.5rem] font-semibold mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Oops... La dirección ingresada no existe
      </motion.h2>

      <motion.p
        className="text-white/80 mb-8 max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Puede que el enlace haya cambiado, esté roto o la página se haya movido.
      </motion.p>

      {/* Botones de acción */}
      <motion.div
        className="flex gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-white text-blue-900 font-semibold rounded-xl shadow hover:bg-blue-100 transition"
        >
          Volver al inicio
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/auth/login")}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
        >
          Ir al Login
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;
