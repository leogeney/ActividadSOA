import { useState, forwardRef, useImperativeHandle } from "react";

const Mensaje = forwardRef((props, ref) => {

  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    mostrarMensaje() {
      setVisible(true);
    },
    ocultarMensaje() {
      setVisible(false);
    }
  }));

  return (
    <div>
      {visible && <h3 className="mensajeImperative" >Hola UFPSO</h3>}
    </div>
  );
});

export default Mensaje;