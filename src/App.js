import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./pages/Home";
import Session from "./pages/Session";
import Presentation from "./pages/Presentation";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import LoginBtn from "./components/LoginBtn";
import useToken from './components/useToken';
import './App.css';

function App() {
  const { token, setToken } = useToken();
  const { user, setUser } = useState({});

  console.log(token);

  return (
    <React.StrictMode>
    <div className="container">
      <Router>
        <LoginBtn />
        <Switch>
          <Route path="/session" >
            { !sessionStorage.getItem('token') ? <Login setToken={setToken} user={user} setUser={setUser} /> : <Session user={user} setUser={setUser} /> }
          </Route>
          <Route path="/presentation" >
            <Presentation />
          </Route>
          <Route path="/trucBidule" >
            <SignUp />
          </Route>
          <Route exact path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </div>
    </React.StrictMode>
  );
}

export default App;
