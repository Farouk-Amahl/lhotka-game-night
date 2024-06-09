import React from "react";
/*import clear from "../utils/clear";*/
import GameSpecs from "./GameSpecs";
import "../styles/GameCard.css";

const GameCard = ({ game, showPane, index, title, selection, gameId }) => {
  const addToSelection = () => {
    console.log("dookie!");
  };
  // console.log(game);
  return (
    <div id={index} className="gameBlock">
      <div className="gameImageBlock" onClick={() => addToSelection()}>
        <img src={game.thumbnail._text} alt={game.title} />
      </div>
      <div className="gameInfosBlock" onClick={() => showPane(index)}>
        <span>{title}</span>
        <br />
        <span className="viewMore to be styled">View more...</span>
        <GameSpecs game={game} />
      </div>
    </div>
  );
};

export default GameCard;
