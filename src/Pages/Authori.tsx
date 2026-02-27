import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import info from "../info";

function Auth() {
  const [bgRot, setBgRot] = useState(0);
  const location = useLocation().pathname.split("/").pop() as
    | "login"
    | "register";
  const navegarA = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setBgRot((old) => (old + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  },[]);

  const viajarA = () => {
    if (location === "login" ) {
      navegarA("/auth/register");
    } else {
      navegarA("/auth/login");
    }
  };
  return (
    <div
      className="fixed w-screen h-screen flex justify-center items-center"
      style={{
        //azules oscuros
        background:`linear-gradient(${bgRot}deg, #0f2027, #203a43, #2c5364)`,
      }}
    >
      <div className="bg-white w-[60%]  h-[95%] max-h-[90%] rounded-[1.5rem] flex justify-between flex-row">
        <div className="bg-blue-900 h-full w-[50%] relative rounded-[1.5rem] flex flex-col justify-center items-center p-4 space-y-4 ">
          <strong className="text-white ">{info[location].message}</strong>
          <p className="text-white text-sm text-justify ">
            {info[location].description}
          </p>
          <button
            className="bg-white text-blue-900 rounded px-5 hover:opacity-50"
            onClick={viajarA}
          >
            {info[location].button}
          </button>
        </div>
        <div className=" w-[50%] flex items-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Auth;
