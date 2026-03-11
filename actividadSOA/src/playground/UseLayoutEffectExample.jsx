import { useState, useEffect } from "react";

function UseLayoutEffectExample() {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setCargando(false);
    }, 2000);

    return () => clearTimeout(timer); 
  }, []);

  return (
    <div>
      <h1>UseLayoutEffect</h1>

      {
      
      cargando ? (
        <p id="loading">Cargando datos...</p>
      ) : (
        <p id="success">Datos cargados con éxito</p>
      )}

      <br />
      <a href="/">Volver al Home</a>
    </div>
  );
}

export default UseLayoutEffectExample;