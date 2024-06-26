import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Home.css";
import Countdown from "../../components/Countdown";

function Home() {
  return (
    <div className="divHome">
      <Link to="/pres">
        <div className="divTextHome">
          <Countdown altText="Next Games in..." />
        </div>
      </Link>
    </div>
  );
}

export default Home;
