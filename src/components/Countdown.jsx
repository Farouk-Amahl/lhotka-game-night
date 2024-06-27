import React, { useCallback, useEffect, useState } from "react";
import GiveSomeLovin from "./GiveSomeLovin";
import "./../styles/glitch.css";

const Countdown = ({ textToDisplay }) => {
  const altText = textToDisplay;
  const addAZero = (num) => {
    return num < 10 ? "0" + num : num;
  };
  const getNextThursdayAtNineteen = useCallback((altText) => {
    const now = new Date();
    const today = now.getDay();
    const dayNextGame = 4;
    const hourNextGame = 19;
    const timeGameSession = 5;
    const daysToGo =
      today === dayNextGame && now.getHours() < hourNextGame
        ? 0
        : (dayNextGame - today + 7) % 7 || 7;
    const nextGame = new Date(now);
    nextGame.setDate(now.getDate() + daysToGo);
    nextGame.setHours(hourNextGame, 0, 0);

    const secondsLeft = Math.floor((nextGame.valueOf() - now.valueOf()) / 1000);

    if (secondsLeft > 60 * 60 * 24 * 6 + timeGameSession) {
      //setAltText("");
      return ["GAME ON"];
    }

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
    if (secondsLeft > 60 * 60 * hourNextGame) {
      toDisplay.push(days, "d");
    }
    if (secondsLeft > 60 * 60) {
      toDisplay.push(hours, "h");
    }
    if (secondsLeft > 60) {
      toDisplay.push(minutes, "m");
    }
    toDisplay.push(seconds, "s");
    return toDisplay;
  }, []);
  const [countdown, setCountdown] = useState(getNextThursdayAtNineteen());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdown(getNextThursdayAtNineteen());
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [getNextThursdayAtNineteen]);

  return (
    <>
      <div className="textHome glitch-wrapper">
        {altText && countdown.length > 1 && (
          <div className="countdownAltText">{`${altText}`}</div>
        )}
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
