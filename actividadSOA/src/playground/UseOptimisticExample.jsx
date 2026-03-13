import { useState, useOptimistic } from "react";

export default function UseOptimisticExample() {

  const [comentarios, setComentarios] = useState([]);

  const [optimisticComentarios, agregarOptimista] = useOptimistic(
    comentarios,
    (state, nuevoComentario) => [...state, nuevoComentario]
  );

  async function enviarComentario(formData) {
    const texto = formData.get("comentario");

    agregarOptimista(texto);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setComentarios((prev) => [...prev, texto]);
  }

  return (
    <div className="contenedor">
      <style>{`
        .contenedor{
          text-align:center;
          margin-top:70px;
          font-family: Arial;
        }

        form{
          display:flex;
          flex-direction:column;
          gap:10px;
          width:220px;
          margin:auto;
        }

        input{
          padding:8px;
        }

        button{
          padding:8px;
          cursor:pointer;
        }

        ul{
          margin-top:20px;
          list-style:none;
          padding:0;
        }

        li{
          margin:5px 0;
        }

        .volver{
          margin-top:30px;
        }
      `}</style>

      <h1>Hook useOptimistic</h1>
      <p>Hook para manejar datos optimistas en componentes funcionales</p>

      <form action={enviarComentario}>
        <input
          type="text"
          name="comentario"
          placeholder="Escribe un comentario"
          required
        />

        <button>Enviar</button>
      </form>

      <ul>
        {optimisticComentarios.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>

      <div className="volver">
        <a href="/"><button>Volver al Home</button></a>
      </div>

    </div>
  );
}