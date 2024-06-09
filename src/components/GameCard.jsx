import React from "react";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
/*import clear from "../utils/clear";*/
import GameSpecs from "./GameSpecs";
import "../styles/GameCard.css";

const GameCard = ({
  game,
  showPane,
  index,
  title,
  selection,
  updateSelection,
  gameId,
  gameImage,
  userName,
}) => {
  const visit = useLocation().pathname === "/visit" ? true : false;
  const addToSelection = () => {
    // console.log(`${userName}, ${gameId}, ${gameImage}`);
    !visit &&
      fetch("https://lhotka.simplicitas.net/selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, gameId, gameImage }),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          updateSelection(data);
        })
        .catch((err) => {
          console.log("caught it!", err);
        });
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
