import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./parcial/LoginPage";
import RegisterPage from "./parcial/RegisterPage";

import ForgotPage from "./parcial/ForgotPage";
import ResetPage from "./parcial/ResetPage";
import Welcome from "./parcial/Welcome"; 
import Dashboard from "./parcial/Dashboard";
import ResetPasswordPage from "./parcial/ResetPasswordPage";
import PrivateRoute from "./parcial/PrivateRoute";  
    



function Parcial1() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/reset" element={<ResetPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/Welcome" element={<PrivateRoute><Welcome /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default Parcial1;