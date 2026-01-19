import "../../styles/login.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../Session/index.jsx"

function Login({ setToken, user, setUser }) {
  const [name, setUserName] = useState();
  const [password, setPassword] = useState();
  const [errors, setErrors] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = await loginUser({
      name,
      password,
    });
    if (userData.error) {
      setErrors(userData.error);
    } else {
      setToken(userData.token);
      sessionStorage.setItem("userName", userData.user);
    }
  };

  async function loginUser(credentials) {
    return fetch(BACKEND_URL + "?action=login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }).then((data) => data.json());
  }

  return (
    <div className="login-wrapper">
      <h1>2.0</h1>

      <form onSubmit={handleSubmit}>
        <p>{errors && `${errors}`}</p>
        <label>
          <input
            type="text"
            onChange={(e) => setUserName(e.target.value)}
            placeholder="username"
          />
        </label>
        <label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </label>
        <button type="submit">Submit</button>
      </form>
      <Link to="/visit">simple visit</Link>
    </div>
  );
}

export default Login;
