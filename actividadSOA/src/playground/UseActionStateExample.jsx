import { useActionState } from "react";

async function accionFormulario(prevState, formData) {
  const nombre = formData.get("nombre");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  return "Acción completada por " + nombre;
}

export default function UseActionStateExample() {

  const [estado, formAction, pendiente] = useActionState(accionFormulario, "");

  return (
    
    <div className="contenedor">

      <style>{`
        .contenedor{
          text-align:center;
          margin-top:80px;
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

        .mensaje{
          margin-top:15px;
          font-size:16px;
        }

        .volver{
          margin-top:30px;
        }
      `}</style>

      <h2>Hook useActionState</h2>
        <p>Hook para manejar el estado de una acción en componentes funcionales</p>

      <form action={formAction}>
        <input
          type="text"
          name="nombre"
          placeholder="Escribe tu nombre"
          required
        />

        <button disabled={pendiente}>
          {pendiente ? "Procesando..." : "Enviar"}
        </button>
      </form>

      <p className="mensaje">{estado}</p>

      <div className="volver">
        <a href="/"><button>Volver al Home</button></a>
      </div>

    </div>
  );
}