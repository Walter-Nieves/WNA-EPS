// src/info.ts
export type InfoSection = {
  message: string;
  description: string;
  button: string;
  parrafo1:string;
  parrafo2:string;
  parrafo3:string;
};

export type InfoData = {
  login: InfoSection;
  register: InfoSection;
  "":InfoSection;
};

const info: InfoData = {
  login: {
    message: "¿Ya tienes cuenta?",
    description: "Ingresa a la pagina de inicio de sesión para ver tus vacunas",
    button: "Inicia sesión",
    parrafo1:"",
    parrafo2:"¿Olvidaste tu clave?",
    parrafo3:"Inicio de sesión"
  },
  register: {
    message: "¿No tienes cuenta?",
    description: "Registrate para comenzar a tener control sobre tus vacunas",
    button: "Regístrate",
    parrafo1:"",
    parrafo2:"",
    parrafo3:"",
  },
    "": {
    message: "¿Ya tienes cuenta?",
    description: "Ingresa a la pagina de inicio de sesión para ver tus vacunas",
    button: "Inicia sesión",
    parrafo1:"",
    parrafo2:"",
    parrafo3:"",
  },
};

export default info;