import { useInsertionEffect } from "react";

function UseInsertionEffectExample() {
  
  useInsertionEffect(() => {
    
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      .caja-dinamica {
        color: #333;
        background-color: #f0f0f0;
        padding: 20px;
        border: 2px solid #333;
        border-radius: 8px;
        text-align: center;
      }
    `;

    
    document.head.appendChild(styleTag);

    
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <div>
      <h1>useInsertionEffect</h1>
      
      <div className="caja-dinamica">
        Esta caja usa estilos insertados dinámicamente.
      </div>

      <br />
      <a href="/">Volver al Home</a>
    </div>
  );
}

export default UseInsertionEffectExample;