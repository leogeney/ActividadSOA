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

      </Routes>
    </BrowserRouter>
  );
}

export default App;