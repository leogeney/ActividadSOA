import { createContext, useContext } from "react";


const UsuarioContext = createContext();

function UseContextExample() {
  const nombreUsuario = "Leonardo";

  return (
    
    <UsuarioContext.Provider value={nombreUsuario}>
      <h1>useContext</h1>
      <ComponenteHijo />
      
      <br />
      <a href="/">Volver al Home</a>
    </UsuarioContext.Provider>
  );
}


function ComponenteHijo() {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px" }}>
      <p>Soy el componente hijo</p>
      <ComponenteNieto />
    </div>
  );
}


function ComponenteNieto() {
  const usuario = useContext(UsuarioContext);

  return (
    <div style={{ background: "blue", padding: "10px" }}>
      <p>Soy el nieto y sé que el usuario es: <strong>{usuario}</strong></p>
    </div>
  );
}

export default UseContextExample;