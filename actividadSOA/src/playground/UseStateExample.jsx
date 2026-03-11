import { useState } from "react";






function UseStateExample() {

const [count, setCount] = useState(0);

function aumentar(){
    setCount (count+1);
    
}

function disminuir(){
    setCount (count-1);
}


  
  return (
    <div>
      <p className="tittle-useState">Use State</p>
      <p>Hook para manejar el estado en componentes funcionales</p>
      <p className="count">Contador: {count}</p>
      <div className="buttonState">
        <button onClick={aumentar}>SUMAR +</button>
      <button id='disminuir' onClick={disminuir}>RESTAR -</button>
      </div>

      <div>
        <a href="/"><button>Volver al Home</button></a>
      </div>

    </div>
  );
}

export default UseStateExample;