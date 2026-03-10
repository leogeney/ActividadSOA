import { useRef } from "react";
import Mensaje from "./mensaje";

function UseImperativeHandleExample() {

  const mensajeRef = useRef();

  const mostrar = () => {
    mensajeRef.current.mostrarMensaje();
  };

  const ocultar = () => {
    mensajeRef.current.ocultarMensaje();
  };

  return (
    <div>

      <h1>useImperativeHandle</h1>
      <p>
        Este hook permite que un componente padre controle funciones
        internas de un componente hijo usando referencias.
      </p>

      <Mensaje ref={mensajeRef} />

      <br />

      <div className="buttonState">
        <button onClick={mostrar}>Mostrar mensaje</button>
      <br /><br />
      <button id="disminuir" onClick={ocultar}>Ocultar mensaje</button>
      </div>

      <br /><br />
      <button><a href="/">Volver al Home</a></button>

    </div>
  );
}

export default UseImperativeHandleExample;