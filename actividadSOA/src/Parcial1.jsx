import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./parcial/LoginPage";
import RegisterPage from "./parcial/RegisterPage";

import ForgotPage from "./parcial/ForgotPage";
import ResetPage from "./parcial/ResetPage";
import Welcome from "./parcial/Welcome"; 
import Dashboard from "./parcial/Dashboard";
    



function Parcial1() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/reset" element={<ResetPage />} />
        <Route path="/Welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Parcial1;