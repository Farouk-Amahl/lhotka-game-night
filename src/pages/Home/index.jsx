import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Home.css";
import "../../styles/glitch.css";
import GiveSomeLovin from "../../components/GiveSomeLovin";

function Home() {
  const addAZero = (num) => {
    return num < 10 ? "0" + num : num;
  };
  const getNextThursday = () => {
    const now = new Date();
    const today = now.getDay();
    const daysToGo = (4 - today + 7) % 7 || 7;
    const nextGame = new Date(now);
    nextGame.setDate(now.getDate() + daysToGo);
    nextGame.setHours(19, 0, 0);
    let seconds = Math.floor((nextGame - now) / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    hours = addAZero(hours - days * 24);
    minutes = addAZero(minutes - days * 24 * 60 - hours * 60);
    seconds = addAZero(
      seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60
    );
    const toDisplay = [];
    days !== 7 && toDisplay.push(days, "d");
    toDisplay.push(hours, "h", minutes, "m", seconds, "s");
    return toDisplay;
  };
  const [countdown, setCountdown] = useState([]);
  setInterval(() => {
    setCountdown(getNextThursday());
  }, 1000);

  return (
    <div className="divHome">
      <Link to="/pres">
        <div className="divTextHome">
          <div className="textHome glitch-wrapper">
            <div className="textHomeCountdown glitch">
              {countdown && (
                <span>
                  <GiveSomeLovin sayMyName="base" things={countdown} />
                  <GiveSomeLovin sayMyName="firstOverlay" things={countdown} />
                  <GiveSomeLovin sayMyName="lastOverlay" things={countdown} />
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default Home;
