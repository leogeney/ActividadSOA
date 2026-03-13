import { useState, useCallback } from "react";

export default function UseCallbackExample() {

  const [contador, setContador] = useState(0);

  const incrementar = useCallback(() => {
    setContador((c) => c + 1);
  }, []);

  const disminuir = useCallback(() => {
    setContador((c) => c - 1);
  }, []);

  return (
    <div className="contenedor">

      <style>{`
        .contenedor{
          text-align:center;
          margin-top:80px;
          font-family: Arial;
        }

        button{
          padding:8px;
          margin:5px;
          cursor:pointer;
        }

        .volver{
          margin-top:30px;
        }
      `}</style>

      <h1>Hook useCallback</h1>
      <p>Hook para memorizar funciones en componentes funcionales</p>

      <p>Contador: {contador}</p>

      <button onClick={incrementar}>Incrementar</button>
      <button onClick={disminuir}>Disminuir</button>

      <div className="volver">
        <a href="/"><button>Volver al Home</button></a>
      </div>

    </div>
  );
}