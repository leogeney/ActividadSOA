import { use } from "react";

const obtenerMensaje = new Promise((resolve) => {
  setTimeout(() => {
    resolve("🚀 Datos cargados correctamente");
  }, 2000);
});

function Use() {

  const mensaje = use(obtenerMensaje);

  const estilos = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "60vh"
    },

    titulo: {
      fontSize: "28px",
      marginBottom: "20px"
    },

    card: {
      padding: "30px",
      borderRadius: "10px",
      background: "#282c34",
      color: "white",
      fontSize: "20px"
    }
  };

  return (
    <div style={estilos.container}>

   <h1>Home use</h1>
   <p>Sirve para leer el valor de recursos como Promises o Contextos incluso dentro de condicionales o bucles</p>

      <div style={estilos.card}>
        <p>{mensaje}</p>
      </div>
 <div>
        <a href="/"><button>Volver al Home</button></a>
      </div>
    </div>
  );
}

export default Use;