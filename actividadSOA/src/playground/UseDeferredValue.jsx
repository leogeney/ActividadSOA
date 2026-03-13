import { useState, useDeferredValue } from "react";

function UseDeferredValue() {
  const [texto, setTexto] = useState("");
  const textoDiferido = useDeferredValue(texto);

  const lista = ["React", "JavaScript", "Node", "Python", "Java"];

  const resultados = lista.filter((item) =>
    item.toLowerCase().includes(textoDiferido.toLowerCase())
  );

  return (
    <div>
      <h1>Hook useDeferredValue</h1>
      <p>Hook para deferir el valor de un estado en componentes funcionales</p>
      <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar..."
      />

      <ul>
        {resultados.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <div>
        <a href="/"><button>Volver al Home</button></a>
      </div>

    </div>
    
  );
}

export default UseDeferredValue;