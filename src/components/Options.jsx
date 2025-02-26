import { useState } from "react";
import "../styles/Options.css";

const Options = ({
  label,
  Content,
  contentAction,
  setTwoPlayers,
  setSoloGames,
}) => {
  const [opened, setOpened] = useState("");
  const [actioned, setActioned] = useState(0);
  const easyOpening = () => {
    actioned && clearTimeout(actioned);
    const toId = setTimeout(() => {
      setOpened("");
    }, 2400);
    setActioned(toId);
    setOpened("open");
  };

  return (
    <div className="optionWrapper">
      <div className={`Options ${opened}`}>
        <div className="optionInner">
          <Content
            sortByNbrPlayers={contentAction}
            setTwoPlayers={setTwoPlayers}
            setSoloGames={setSoloGames}
            autoClose={easyOpening}
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
