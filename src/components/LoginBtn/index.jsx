import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/loginBtn.css";

function LoginBtn() {
  const location = useLocation();

  function switchLocation(location) {
    switch (location) {
      case "/session":
        return <Link to="/">back</Link>;
      default:
        return sessionStorage.getItem("token") ? (
          <Link to="/session">session</Link>
        ) : (
          <Link to="/session">Login</Link>
        );
    }
  }
  return <div className="loginBtn">{switchLocation(location.pathname)}</div>;
}

export default LoginBtn;
