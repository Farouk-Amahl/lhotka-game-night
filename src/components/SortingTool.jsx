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
  const [minPlayers, setMinPlayers] = useState(1);

  const checkHandler = (choise) => {
    choise === "two players" && setTwoPlayers(true);
    choise === "solo" && setSoloGames(true);
    sortByNbrPlayers(choise);
    if (clicked === choise) {
      setClicked("")
      setMinPlayers(1);
    } else {
      setClicked(choise);
      setMinPlayers(0);
    }
    autoClose();
  };

  return (
    <>
      <div className="sotingTool" onMouseOver={() => autoClose()}>
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
<<<<<<< HEAD
        <input
          type="range"
          id="nbrPlayersMax"
          min="1"
          max="10"
          step="1"
          defaultValue="1"
          onChange={(e) => {
            sortByNbrPlayers(e.target.value);
            autoClose();
          }}
        />
=======
        <div className="inputGroup">
          <input
            title="Minimum players"
            type="range"
            id="nbrPlayersMax"
            min="1"
            max="9"
            step="1"
            value={minPlayers}
            onChange={(e) => {
              setClicked("");
              setMinPlayers(e.target.value);
              sortByNbrPlayers(e.target.value);
              autoClose();
            }}
          />
          <span>{minPlayers > 0 ? minPlayers : "Ø"}</span>
        </div>
>>>>>>> 71b8de911f1d2443538f8046ef2f60be057c4993
      </div>
    </>
  );
}

export default SortingTool;
