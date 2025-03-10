import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Home.css";
import Countdown from "../../components/Countdown";

function Home() {
  return (
    <div className="divHome">
<<<<<<< HEAD
      <Link to="/visit">
=======
      <Link to="/session">
>>>>>>> 71b8de911f1d2443538f8046ef2f60be057c4993
        <div className="divTextHome">
          <Countdown textToDisplay="Next Games in..." />
        </div>
      </Link>
    </div>
  );
}

export default Home;
