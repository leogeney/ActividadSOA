function RegisterPage() {
  
  return (
    
<div>
      <h2>Register</h2>

      <form>
        <div className="Addtext">
            <label className="title">Email address</label>
            <input type="text" id="nombre" name="nombre" placeholder="example@gmail.com" />
        </div>

        <div className="Addtext">
            <label className="title">Password</label>
            <input type="password" id="password" name="password" placeholder="Contraseña" />
        </div>
    


        <div className="Addtext">
            <label className="title">Username</label>
            <input type="text" id="nombre" name="nombre" placeholder="Username"/>
        </div>

        
        <input type="submit" value="Create Account"  className="enviar"/>
       
        <a href="/">Already have an account? Login</a>
      </form>
    </div>
  );
}

export default RegisterPage;