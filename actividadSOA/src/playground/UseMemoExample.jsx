import { useState, useMemo } from "react";

function UseMemoExample() {
  const [buscar, setBuscar] = useState("");
  

  const alumnos = ["Ana", "Betico", "Carlos", "Diego", "Elena"];

  
  const listaFiltrada = useMemo(() => {
    console.log("Filtrando lista..."); 
    return alumnos.filter((nombre) => 
      nombre.toLowerCase().includes(buscar.toLowerCase())
    );
  }, [buscar]); 

  return (
    <div>
      <h1>UseMemo</h1>
      <p>Hook para memorizar valores en componentes funcionales</p>
      
      <input 
        type="text" 
        placeholder="Buscar alumno..." 
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
      />

      <ul>
        {listaFiltrada.map((a) => <li key={a}>{a}</li>)}
      </ul>

      <hr />
      

      <br /><br />
      <a href="/">Volver</a>
    </div>
  );
}

export default UseMemoExample;