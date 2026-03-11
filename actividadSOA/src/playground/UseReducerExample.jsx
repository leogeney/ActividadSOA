import { useReducer } from "react";

// 1. La lógica: Si está en true, pasa a false. Si está en false, pasa a true.
function modoReducer(state, action) {
  if (action.type === "TOGGLE") {
    return !state;
  }
  return state;
}

function UseReducerExample() {
  
  const [esOscuro, dispatch] = useReducer(modoReducer, false);

  const estilo = {
    backgroundColor: esOscuro ? "#333" : "#fff",
    color: esOscuro ? "#fff" : "#000",
    padding: "20px",
    height: "100vh"
  };

  return (
    <div style={estilo}>
      <h1>useReducer Simple</h1>
      <p>El modo oscuro está: <strong>{esOscuro ? "Activado" : "Desactivado"}</strong></p>

      
      <button onClick={() => dispatch({ type: "TOGGLE" })}>
        Cambiar Modo
      </button>

      <br /><br />
      <a href="/" style={{ color: esOscuro ? "lightblue" : "blue" }}>Volver al Home</a>
    </div>
  );
}

export default UseReducerExample;