import "../../styles/login.css";
import { useState } from "react";

function Reset() {
  const [name, setUserName] = useState();
  const [password, setPassword] = useState();
  const [newPassword, setNewPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    await resetPass({
      name,
      password,
      newPassword
    });
  }

  async function resetPass(credentials) {
    return fetch("http://localhost:8000/api/auth/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    }).then(data => data.json());
  }

  return (
    <div className="login-wrapper">
      <h1>La grande Porte</h1>

      <form  onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" onChange={e => setUserName(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input type="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <label>
          <p>New Password</p>
          <input type="password" onChange={e => setNewPassword(e.target.value)} />
        </label>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default Reset;
