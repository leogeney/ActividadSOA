function HomeHooks() {
  return (
    <div>
      <p className='TittleHome'>Home Hooks</p>

      <div className='links'>
        <a href="">LoginPage</a>
        <a href="">RegisterPage</a>
        <a href="">ForgotPage</a>
        <a href="">ResetPage</a>   
      </div>

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
            <td className='name'>useCallback</td>
            <td>Hook para memorizar funciones en componentes funcionales</td>
            <td>Memorización</td>
            <td><a href="/useCallback">Ver</a></td>
        </tr>


        <tr>
            <td className='name'>useDeferredValue</td>
            <td>Hook para deferir el valor de un estado en componentes funcionales</td>
            <td>Memorización</td>
            <td><a href="/useDeferredValue">Ver</a></td>
        </tr>

        

        <tr>
            <td className='name'>useDebugValue</td>
            <td>Hook para mostrar un valor personalizado en las herramientas de depuración de React</td>
            <td>Depuración</td>
            <td><a href="/useDebugValue">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>Use</td>
            <td>Sirve para leer el valor de recursos como Promises o Contextos incluso dentro de condicionales o bucles</td>
            <td>Identificación</td>
            <td><a href="/use">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>useOptimistic</td>
            <td>Hook para manejar datos optimistas en componentes funcionales</td>
            <td>NEW </td>
            <td><a href="/useOptimistic">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>useFormStatus</td>
            <td>Hook para manejar el estado de un formulario en componentes funcionales</td>
            <td>NEW</td>
            <td><a href="/useFormStatus">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>useActionState</td>
            <td>Hook para manejar el estado de una acción en componentes funcionales</td>
            <td>NEW</td>
            <td><a href="/useActionState">Ver</a></td>
        </tr>
    
        


        <tr>
            <td className='name'>useInsertionEffect</td>
            <td>Hook para manejar efectos de inserción en componentes funcionales</td>
            <td>Efecto</td>
            <td><a href="/useInsertionEffect">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>useLayoutEffect</td>
            <td>Hook para manejar efectos secundarios en componentes funcionales</td>
            <td>Efecto</td>
            <td><a href="/useLayoutEffect">Ver</a></td>
        </tr>

        <tr>
            <td className='name'>useSyncExternalStore</td>
            <td>Hook para sincronizar React con datos externos</td>
            <td>Almacenamiento</td>
            <td><a href="/useSyncExternalStore">Ver</a></td>
        </tr>
        
        <tr>
            <td className='name'>UseId</td>
            <td>Hook para generar un ID único y estable</td>
            <td>Identificación</td>
            <td><a href="/useId">Ver</a></td>
        </tr>

         <tr>
            <td className='name'>useImperativeHandle</td>
            <td>Hook para personalizar la instancia de referencia expuesta por un componente</td>
            <td>Referencia</td>
            <td><a href="/useImperativeHandle">Ver</a></td>
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
            <td>Para gestionar estados complejos, permitiendo manejar múltiples actualizaciones relacionadas</td>
            <td>Estado</td>
            <td><a href="/useReducer">Ver</a></td>
        </tr>
    </tbody>
</table>
    </div>
  );
}
export default HomeHooks;