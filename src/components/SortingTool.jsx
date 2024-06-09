import React, { useState } from "react";
import "../styles/SortingTool.css";
import Meeple from "./meeple";

function SortingTool({
  label,
  content,
  sortByNbrPlayers,
  setTwoPlayers,
  setSoloGames,
  autoClose,
}) {
  const [clicked, setClicked] = useState("");

  const checkHandler = (choise) => {
    choise === "two players" && setTwoPlayers(true);
    choise === "solo" && setSoloGames(true);
    sortByNbrPlayers(choise);
    clicked === choise ? setClicked("") : setClicked(choise);
    autoClose();
  };

  return (
    <>
      <div className="sotingTool">
        <div className="buttonGroup">
          <button
            className="sortGamesButtons"
            onClick={() => checkHandler("solo")}
          >
            {clicked === "solo" && `{`}
            <Meeple fillColor="white" size="15" />
            {clicked === "solo" && `}`}
          </button>
          <button
            className="sortGamesButtons"
            onClick={() => checkHandler("two players")}
          >
            {clicked === "two players" && `{`}
            <Meeple fillColor="white" size="15" />
            <Meeple fillColor="white" size="15" />
            {clicked === "two players" && `}`}
          </button>
        </div>
        <input
          type="range"
          id="nbrPlayersMax"
          min="3"
          max="10"
          step="1"
          defaultValue="5"
          onChange={(e) => {
            sortByNbrPlayers(e.target.value);
            autoClose();
          }}
        />
      </div>
    </>
  );
}

export default SortingTool;
