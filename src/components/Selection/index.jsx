import React from "react";
import "../../styles/selection.css";
import { useLocation } from "react-router-dom";

function Selection({ selection, updateSelection, userName }) {
  console.log(selection);
  const visit = useLocation().pathname === "/visit" ? true : false;

  const gamesSelected = [];
  const passage = [];

  selection &&
    selection.forEach((game) => {
      let nbrChoise = 0;
      const item = {
        id: game.gameId,
        img: game.gameImage,
        user: game.userName,
        nbrChoise: nbrChoise,
      };
      if (gamesSelected.indexOf(game.gameId) === -1) {
        passage.push(game.gameId);
        item.nbrChoise++;
        gamesSelected.push(item);
      } else {
        const moreThanOne = gamesSelected.at(game.gameId);
        moreThanOne.nbrChoise++;
        moreThanOne.user += ", " + game.user;
        /*const rat = gamesSelected.findIndex(
          (foo) => foo.gameId === game.gameId
        );
        let user = gamesSelected[rat].user;
        item.user = user + ", " + game.user;
        gamesSelected.splice(rat, 1);
        gamesSelected.push(item);*/
      }
    });

  gamesSelected.sort(function compare(a, b) {
    if (a.nbrChoise > b.nbrChoise) return -1;
    if (a.nbrChoise < b.nbrChoise) return 1;
    return 0;
  });

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
            onClick={() => addToSelection(game.id, game.img)}
          >
            <div
              className={`blocSelectionImage ${
                game.user.indexOf(userName) !== -1 && "select"
              }`}
            >
              <img src={game.img} alt={game.id} />
            </div>
            <span className="blocSelectionCompte">{game.nbrChoise}</span>
            <span className="blocSelectionVoters">{game.user}</span>
          </div>
        ))}
    </div>
  );
}

export default Selection;
