import React, { useCallback, useEffect, useState } from "react";
import GiveSomeLovin from "./GiveSomeLovin";
import "./../styles/glitch.css";

const Countdown = ({ altText }) => {
  const addAZero = (num) => {
    return num < 10 ? "0" + num : num;
  };
  const getNextThursdayAtNineteen = useCallback(() => {
    const now = new Date();
    const today = now.getDay();
    const daysToGo = (4 - today + 7) % 7 || 7;
    const nextGame = new Date(now);
    nextGame.setDate(now.getDate() + daysToGo);
    nextGame.setHours(19, 0, 0);

    const secondsLeft = Math.floor((nextGame.valueOf() - now.valueOf()) / 1000);
    // console.log(secondsLeft)
    /*
    if (secondsLeft > 60 * 60 * 24 * 6 + 25200) {
      return ["GAME ON"];
    }*/

    let seconds = secondsLeft;
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    hours = addAZero(hours - days * 24);
    minutes = addAZero(minutes - days * 24 * 60 - hours * 60);
    seconds = addAZero(
      seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60
    );
    const toDisplay = [];
    toDisplay.push(days, "d");

    toDisplay.push(hours, "h", minutes, "m", seconds, "s");
    return toDisplay;
  }, []);
  const [countdown, setCountdown] = useState(getNextThursdayAtNineteen());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getNextThursdayAtNineteen());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [getNextThursdayAtNineteen]);

  return (
    <>
      <div className="textHome glitch-wrapper">
        {altText && <div className="countdownAltText">{`${altText}`}</div>}
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
    </>
  );
};

export default Countdown;
