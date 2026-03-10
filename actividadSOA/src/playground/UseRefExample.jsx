import { useRef } from "react";


function UseRefExample() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  }

  return (
    <div>
      <h1>Use Ref</h1>
      <input className="inputEffect" ref={inputRef} type="text" placeholder="Escribe algo..." />
      <br/> <br />
      <button onClick={focusInput} id="buttonRef">Enfocar Input</button>
    </div>
  );
}

export default UseRefExample;