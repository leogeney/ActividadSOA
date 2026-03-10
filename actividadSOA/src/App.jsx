import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeHooks from "./playground/HomeHooks";
import UseStateExample from "./playground/UseStateExample";
import UseEffectExample from "./playground/UseEffectExample";
import UseRefExample from "./playground/UseRefExample";
import UseContextExample from "./playground/UseContextExample";
import UseMemoExample from "./playground/UseMemoExample";
import UseReducerExample from "./playground/UseReducerExample";

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

      </Routes>
    </BrowserRouter>
  );
}

export default App;