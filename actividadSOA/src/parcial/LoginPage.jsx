function LoginPage() {
  return (
    <div>
      <h2>Login</h2>

      <form>
        <div className="Addtext">
            <label className="title">Username or email address</label>
            <input type="text" id="nombre" name="nombre" placeholder="Username or email" />
        </div>



        <div className="Addtext">
            <label className="title">Password</label>
            <input type="password" id="password" name="password" placeholder="Password"/>
        </div>
        <input type="submit" value="Login"  className="enviar"/>
       
        <a href="/register">Don't have an account? Register</a>
      </form>
    </div>
  );
}

export default LoginPage;