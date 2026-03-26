import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./parcial/LoginPage";
import RegisterPage from "./parcial/RegisterPage";
import './login.css'
import './register.css'



function Parcial1() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
       
      </Routes>
    </BrowserRouter>
  );
}

export default Parcial1;