import React from "react";
import "../styles/Options.css";

const Options = ({
  label,
  Content,
  contentAction,
  setTwoPlayers,
  setSoloGames,
}) => {
  return (
    <div className="optionWrapper">
      <div className="Options">
        <div className="optionInner">
          <Content
            sortByNbrPlayers={contentAction}
            setTwoPlayers={setTwoPlayers}
            setSoloGames={setSoloGames}
          />
        </div>
      </div>
      <div className="optionLabel">{label}</div>
    </div>
  );
};

export default Options;
