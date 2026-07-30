import { createContext, useContext, useState, type ReactNode } from "react";

interface PhotoContextType {
  fotos: Record<string, string>;
  actualizarFoto: (usuarioId: string, nuevaFoto: string) => void;

  triggerVacunador: boolean;
  dispatchTriggerVacunador: () => void;

  // ✅ NUEVO
  triggerPacientes: boolean;
  dispatchTriggerPacientes: () => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export function PhotoProvider({ children }: { children: ReactNode }) {
  const [triggerVacunador, setTriggerVacunador] = useState<boolean>(false);

  const dispatchTriggerVacunador = () =>
    setTriggerVacunador(!triggerVacunador);

  // ✅ NUEVO
  const [triggerPacientes, setTriggerPacientes] = useState<boolean>(false);

  const dispatchTriggerPacientes = () =>
    setTriggerPacientes(!triggerPacientes);

  const [fotos, setFotos] = useState<Record<string, string>>({});

  const actualizarFoto = (
    usuarioId: string,
    nuevaFoto: string
  ): void => {
    setFotos((prev) => ({
      ...prev,
      [usuarioId]: nuevaFoto,
    }));
  };

  return (
    <PhotoContext.Provider
      value={{
        fotos,
        actualizarFoto,
        triggerVacunador,
        dispatchTriggerVacunador,

        // ✅ NUEVO
        triggerPacientes,
        dispatchTriggerPacientes,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePhoto(): PhotoContextType {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhoto debe usarse dentro de PhotoProvider");
  }
  return context;
}