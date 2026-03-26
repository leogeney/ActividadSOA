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

      <h1>Use Effect </h1>
      <p>Hook para manejar efectos secundarios en componentes funcionales</p>

      <input className="inputEffect"
        type="text"
        placeholder="Escribe tu nombre"
        onChange={change}
      />

      <p className="holaEffect">Hola {nombre}</p>

      <div>
        <a href="/"><button>Volver al Home</button></a>
      </div>

    </div>
  );
}

export default UseEffectExample;