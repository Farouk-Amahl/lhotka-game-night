import React, { useEffect, useState } from "react";
import "../../styles/selection.css";
import { useLocation } from "react-router-dom";

function Selection({ selection, updateSelection, userName }) {
  const visit = useLocation().pathname === "/visit" ? true : false;
  const [gamesSelected, setGameSelected] = useState([]);

  useEffect(() => {
    const tempArray = [];
    selection.forEach((selectedGame) => {
      if (
        tempArray.findIndex(
          (element) => element.gameId === selectedGame.gameId
        ) === -1
      ) {
        selectedGame.nbrChoise = 1;
        tempArray.push(selectedGame);
      } else {
        const moreThanOne = tempArray.at(
          tempArray.findIndex(
            (element) => element.gameId === selectedGame.gameId
          )
        );
        moreThanOne.nbrChoise++;
        moreThanOne.userName += ", " + selectedGame.userName;
      }
    });
    tempArray.sort(function compare(a, b) {
      if (a.nbrChoise > b.nbrChoise) return -1;
      if (a.nbrChoise < b.nbrChoise) return 1;
      return 0;
    });
    setGameSelected(tempArray);
    // console.log(selection);
  }, [selection]);

  function addToSelection(gameId, gameImage) {
    !visit &&
      fetch("https://lhotka.simplicitas.net/selection", {
        // fetch("http://localhost:8000/selection", {
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
        });
  }

  return (
    <div className="selection">
      {selection &&
        gamesSelected.map((game) => (
          <div
            className="blocSelection"
            key={game.id}
            onClick={() => addToSelection(game.gameId, game.gameImage)}
          >
            <div
              className={`blocSelectionImage ${
                game.userName.indexOf(userName) !== -1 && "select"
              }`}
            >
              <img src={game.gameImage} alt={game.id} />
            </div>
            <span className="blocSelectionCompte">{game.nbrChoise}</span>
            <span className="blocSelectionVoters">{game.userName}</span>
          </div>
        ))}
    </div>
  );
}

export default Selection;
