import { useId } from "react";

function UseIdExample() {
  const idNombre = useId();
  const idApellido = useId();

  return (
    <div>
      <h1>useId</h1>

      <p>
        useId genera identificadores únicos para elementos HTML.
      </p>

      <div>
        <label htmlFor={idNombre}>Nombre:</label>
        <input id={idNombre} type="text" />
        <br /><br />
        <label htmlFor={idApellido}>Apellido:</label>
        <input id={idApellido} type="text" />
      </div>

      <br />

      <a href="/">Volver al Home</a>
    </div>
  );
}

export default UseIdExample;