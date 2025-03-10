import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Home.css";
import Countdown from "../../components/Countdown";

function Home() {
  return (
    <div className="divHome">
      <Link to="/session">
        <div className="divTextHome">
          <Countdown textToDisplay="Next Games in..." />
        </div>
      </Link>
    </div>
  );
}

export default Home;
