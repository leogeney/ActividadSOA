import { useState, useDebugValue } from "react";

function UseDebugValue() {

  const [count, setCount] = useState(0);

  const estado = count > 5 ? "Alto" : "Bajo";

  useDebugValue(estado);

  return (
    <div>
      <h1>Hook useDebugValue</h1>
      <p>Hook para mostrar un valor personalizado en las herramientas de depuración de React</p>

      <p>Contador: {count}</p>
      <p>Estado: {estado}</p>

      <button onClick={() => setCount(count + 1)}>
        Incrementar
      </button>

      <button onClick={() => setCount(count - 1)}>
        Disminuir
      </button>
      <div>
        <a href="/"><button>Volver al Home</button></a>
      </div>
    </div>
    
  );
}

export default UseDebugValue;