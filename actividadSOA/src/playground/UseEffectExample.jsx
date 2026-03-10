import { useState, useEffect } from "react";

function UseEffectExample(){

  const [nombre, setNombre] = useState("");

  function changeTitle(){
    document.title = nombre;
  }

  useEffect(() => {
    changeTitle();
  }, [nombre]);

  function change(e){

    setNombre(e.target.value);
  }

  return (
    <div>

      <h1>Use Effect (Cambia el titulo)</h1>

      <input className="inputEffect"
        type="text"
        placeholder="Escribe tu nombre"
        onChange={change}
      />

      <p className="holaEffect">Hola {nombre}</p>

    </div>
  );
}

export default UseEffectExample;