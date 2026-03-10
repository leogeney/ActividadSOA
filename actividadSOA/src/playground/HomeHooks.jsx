function HomeHooks() {
  return (
    <div>
      <p className='TittleHome'>Home Hooks</p>

      <table>
    <thead>
        <tr>
            <th>Hook</th>
            <th>Descripcion</th>
            <th>Categoria</th>
            <th>👁️</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <td className='name'>useState</td>
            <td>Hook para manejar el estado en componentes funcionales</td>
            <td>Estado</td>
            <td><a href="/useState">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>useEffect</td>
            <td>Hook para manejar efectos secundarios en componentes funcionales</td>
            <td>Efecto</td>
            <td><a href="/useEffect">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>useRef</td>
            <td>Hook para crear una referencia mutable en componentes funcionales</td>
            <td>Referencia</td>
            <td><a href="/useRef">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>useContext</td>
            <td>Hook para acceder al contexto en componentes funcionales</td>
            <td>Contexto</td>
            <td><a href="/useContext">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>useMemo</td>
            <td>Hook para memorizar valores en componentes funcionales</td>
            <td>Memorización</td>
            <td><a href="/useMemo">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>useReducer</td>
            <td>Hook para manejar el estado en componentes funcionales</td>
            <td>Estado</td>
            <td><a href="/useReducer">Ver</a></td>
        </tr>
    </tbody>
</table>
    </div>
  );
}
export default HomeHooks;