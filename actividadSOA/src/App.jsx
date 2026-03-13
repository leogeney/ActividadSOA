import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomeHooks from "./playground/HomeHooks";
import UseStateExample from "./playground/UseStateExample";
import UseEffectExample from "./playground/UseEffectExample";
import UseRefExample from "./playground/UseRefExample";
import UseContextExample from "./playground/UseContextExample";
import UseMemoExample from "./playground/UseMemoExample";
import UseReducerExample from "./playground/UseReducerExample";
import UseImperativeHandleExample from "./playground/UseImperativeHandleExample";
import UseSyncExternalStore from "./playground/UseSyncExternalStoreExample";
import UseIdExample from "./playground/UseIdExample";
import UseLayoutEffect from "./playground/UseLayoutEffectExample";
import UseInsertionEffect from "./playground/UseInsertionEffectExample";
import UseDeferredValue from "./playground/UseDeferredValue";     
import UseDebugValue from "./playground/UseDebugValue";
import Use from "./playground/Use";
import UseFormStatus from "./playground/UseFormStatus";    
import UseActionStateExample from "./playground/UseActionStateExample";       
import UseActionStateEjemplo from "./playground/UseActionStateExample";    
import UseOptimisticExample from './playground/UseOptimisticExample';  
import UseCallbalckExample from './playground/UseCallbalckExample';             
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomeHooks />} />
        <Route path="/useState" element={<UseStateExample />} />
        <Route path="/useEffect" element={<UseEffectExample />} />
        <Route path="/useRef" element={<UseRefExample />} />
        <Route path="/useContext" element={<UseContextExample />} />
        <Route path="/useMemo" element={<UseMemoExample />} />
        <Route path="/useReducer" element={<UseReducerExample />} />
        <Route path="/useImperativeHandle" element={<UseImperativeHandleExample />} />
        <Route path="/useSyncExternalStore" element={<UseSyncExternalStore />} />
        <Route path="/useId" element={<UseIdExample />} />
        <Route path="/useLayoutEffect" element={<UseLayoutEffect />} />
        <Route path="/useInsertionEffect" element={<UseInsertionEffect />} />
        <Route path="/useDeferredValue" element={<UseDeferredValue />} />
        <Route path="/useDebugValue" element={<UseDebugValue />} />           
        <Route path="/use" element={<Use />} />     
        <Route path="/useFormStatus" element={<UseFormStatus />} />        
        <Route path="/useActionState" element={<UseActionStateExample />} /> 
        <Route path="/useActionStateEjemplo" element={<UseActionStateEjemplo />} /> 
        <Route path="/useOptimistic" element={<UseOptimisticExample />} />    
        <Route path="/useCallback" element={<UseCallbalckExample />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;