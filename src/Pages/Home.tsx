
import { useAuth } from "../Contexts/AuthContexts";
import Dashboard from "./Dashboard";
import Loading from "../Componentes/Loading";

function Home() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <Loading />;
  }

  if (!usuario) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-blue-900 font-semibold">
          Cargando usuario...
        </p>
      </div>
    );
  }

  return <Dashboard />;
}

export default Home;

