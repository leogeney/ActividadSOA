import { useSyncExternalStore } from "react";

let contador = 0;
let listeners = [];

function subscribe(listener) {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function getSnapshot() {
  return contador;
}

function incrementar() {
  contador++;
  listeners.forEach(listener => listener());
}

function UseSyncExternalStoreExample() {

  const value = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <div>

      <h1>useSyncExternalStore</h1>
      <p>Permite sincronizar React con datos externos.</p>

      <h2>Valor: {value}</h2>

      <button onClick={incrementar}>
        Incrementar desde store externo
      </button>

      <br /><br />
      <a href="/">Volver al Home</a>

    </div>
  );
}

export default UseSyncExternalStoreExample;