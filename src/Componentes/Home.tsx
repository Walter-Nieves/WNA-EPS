// ✅ Home.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home: React.FC = () => {
  const [rotacion, setRotacion] = useState<number>(0);
  const navigate = useNavigate();

  // 🎨 Fondo animado girando lentamente
  useEffect(() => {
    const intervalo = setInterval(() => {
      setRotacion((r) => (r + 1) % 360);
    }, 50);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div
      className="w-screen h-screen flex flex-col justify-center items-center text-center"
      style={{
        background: `linear-gradient(${rotacion}deg, #0f2027, #203a43, #2c5364)`,
      }}
    >
      {/* Caja principal animada */}
      <motion.div
        className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl p-10 max-w-xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* 🧩 Título con animación de entrada */}
        <motion.h1
          className="text-4xl font-bold text-white mb-4"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Bienvenido a <span className="text-blue-300">WNA-EPS</span>
        </motion.h1>

        {/* 💬 Descripción con animación suave */}
        <motion.p
          className="text-white/90 mb-8 text-lg"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Tu plataforma de confianza donde estarás al día con la información
          sobre tus vacunas y salud.
        </motion.p>

        {/* 🔘 Botones con animación secuencial */}
        <motion.div
          className="flex justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/auth/login")}
            className="px-6 py-2 bg-white text-blue-900 font-semibold rounded-xl shadow hover:bg-blue-100 transition"
          >
            Iniciar sesión
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/auth/register")}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
          >
            Registrarse
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
