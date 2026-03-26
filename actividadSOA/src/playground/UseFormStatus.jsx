import { useState } from "react";
import { useFormStatus } from "react-dom";

function BotonEnviar() {
  const { pending } = useFormStatus();

  return (
    <button className="botonEnviar" disabled={pending}>
      {pending ? "Enviando..." : "Enviar"}
    </button>
  );
}

export default function UseFormStatusEjemplo() {
  const [mensaje, setMensaje] = useState("");

  async function enviarFormulario(formData) {
    const nombre = formData.get("nombre");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setMensaje("Formulario enviado por " + nombre);
  }

  return (
    <div className="contenedor">

      <style>{`
        body{
          font-family: Arial;
          background: linear-gradient(135deg,#4facfe,#00f2fe);
        }

        .contenedor{
          text-align:center;
          margin-top:80px;
        }

        .formulario{
          display:flex;
          flex-direction:column;
          gap:15px;
          width:250px;
          margin:auto;
        }

        input{
          padding:10px;
          border-radius:8px;
          border:none;
        }

        .botonEnviar{
          padding:10px;
          border:none;
          border-radius:8px;
          background:#ff7b00;
          color:white;
          font-weight:bold;
          cursor:pointer;
          transition:0.3s;
        }

        .botonEnviar:hover{
          transform:scale(1.05);
          background:#ff5400;
        }

        .mensaje{
          margin-top:20px;
          font-size:18px;
          color:white;
        }

        .volver{
          margin-top:40px;
        }

        .volver button{
          padding:10px 20px;
          border:none;
          border-radius:8px;
          background:#222;
          color:white;
          cursor:pointer;
          transition:0.3s;
        }

        .volver button:hover{
          background:#444;
          transform:scale(1.05);
        }
      `}</style>

      <h1>Hook UseFormStatus</h1>

      <form action={enviarFormulario} className="formulario">
        <input
          type="text"
          name="nombre"
          placeholder="Escribe tu nombre"
          required
        />

        <BotonEnviar />
      </form>

      <p className="mensaje">{mensaje}</p>

      <div className="volver">
        <a href="/"><button>Volver al Home</button></a>
      </div>

    </div>
  );
}