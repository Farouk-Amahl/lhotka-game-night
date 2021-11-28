import "../../styles/login.css";
import { useState } from "react";

function Login({ setToken, user, setUser }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    const userData = await loginUser({
      username,
      password
    });
    setToken(userData.token);
    sessionStorage.setItem('userName', userData.user.name);
  }

  async function loginUser(credentials) {
    return fetch("https://lhotka-game-night.herokuapp.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    }).then(data => data.json());
  }

  return (
    <div className="login-wrapper">
      <h1>Who am I ?</h1>

      <form  onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" onChange={e => setUserName(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input type="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
