import React from "react";
import Meeple from "./meeple";

const GameSpecs = ({ game }) => {
  return (
    <div className="blockSpecs">
      <span className="numberOfPlayers">
          {game.minplayers._attributes.value ===
          game.maxplayers._attributes.value
            ? game.minplayers._attributes.value
            : game.minplayers._attributes.value +
              "-" +
              game.maxplayers._attributes.value}
        {" "}
        <Meeple fillColor="blueViolet" size="15px" />
      </span>
      <span className="playTime">
          {game.maxplaytime._attributes.value}
          {" "}
          ⏱️
      </span>
    </div>
  );
};

export default GameSpecs;
