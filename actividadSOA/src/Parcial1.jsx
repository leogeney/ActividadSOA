import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./parcial/LoginPage";
import RegisterPage from "./parcial/RegisterPage";
import './login.css'
import './register.css'
import ForgotPage from "./parcial/ForgotPage";
import ResetPage from "./parcial/ResetPage"; 
    



function Parcial1() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/reset" element={<ResetPage />} />

       
      </Routes>
    </BrowserRouter>
  );
}

export default Parcial1;