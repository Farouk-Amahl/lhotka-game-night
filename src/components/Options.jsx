import { useState, useRef, useEffect } from "react";
import "../styles/Options.css";

const Options = ({
  label,
  Content,
  contentAction,
  setTwoPlayers,
  setSoloGames,
}) => {
  const [opened, setOpened] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const resetTimer = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpened(false);
    }, 2400);
  };

  const easyOpening = () => {
    if (opened) {
      clearTimeout(timeoutRef.current);
      setOpened(false);
    } else {    
      resetTimer();
      setOpened(true);
    }
  };

  return (
    <div className="optionWrapper">
      <div className={(`Options ${opened ? "open" : ""}`).trim()}>
        <div className="optionInner">
          <Content
            sortByNbrPlayers={contentAction}
            setTwoPlayers={setTwoPlayers}
            setSoloGames={setSoloGames}
            autoClose={resetTimer}
          />
        </div>
      </div>
      <div className="optionLabel" onClick={easyOpening}>
        {label}
      </div>
    </div>
  );
};

export default Options;
