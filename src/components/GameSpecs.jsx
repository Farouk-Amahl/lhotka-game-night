import React from "react";
import Meeple from "./meeple";

const GameSpecs = ({ game }) => {
  return (
    <div className="blockSpecs">
      <span className="numberOfPlayers">
        <span className="numberOfPlayersText">
          {game.minplayers._attributes.value ===
          game.maxplayers._attributes.value
            ? game.minplayers._attributes.value
            : game.minplayers._attributes.value +
              "-" +
              game.maxplayers._attributes.value}
        </span>
        <span className="numberOfPlayersIcon icon">
          <Meeple fillColor="blueViolet" size="15px" />
        </span>
      </span>
      <span className="playTime">
        <span className="playTimeText">
          {game.maxplaytime._attributes.value}
        </span>
        <span className="playTimeIcon icon">⏱️</span>
      </span>
    </div>
  );
};

export default GameSpecs;
