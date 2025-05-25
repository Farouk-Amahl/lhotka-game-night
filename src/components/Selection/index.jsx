import { useEffect, useState } from "react";
import "../../styles/selection.css";
import { useLocation } from "react-router-dom";

function Selection({ selection, updateSelection, userName }) {
  const visit = useLocation().pathname === "/visit" ? true : false;
  const [gamesSelected, setGameSelected] = useState([]);
  const [visibleSelection, setVisibleSelection] = useState(true);

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
    console.log("Selection", tempArray);
    if (tempArray.length === 0) {
      tempArray[0] = {
        id: 0,
        gameImage: "https://makak.space/gamenightbackend/img/default.jpg",
        userName: "",
        nbrChoise: 0,
      };
    }
  }, [selection]);

  function addToSelection(gameId, gameImage) {
    !visit &&
      fetch("https://makak.space/gamenightbackend/?action=selection", {
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

  function toggleVisibiltySelection() {
    console.log("Dookie!");
    setVisibleSelection(!visibleSelection);
  }

  return (
    <div
      className={`selectionContainer ${
        visibleSelection ? "visibleSelection" : ""
      }`}
    >
      <div className="selection">
        {selection &&
          gamesSelected.map((game, index) => (
            <div
              className="blocSelection"
              key={game.gameId + index}
              onClick={() => addToSelection(game.gameId, game.gameImage)}
            >
              <div
                className={`blocSelectionImage ${
                  game.userName.indexOf(userName) !== -1 && "select"
                }`}
              >
                <img src={game.gameImage} alt={game.id} />
              </div>

              {game.nbrChoise > 1 && (
                <span className="blocSelectionCompte">{game.nbrChoise}</span>
              )}
              <span className="blocSelectionVoters">{game.userName}</span>
            </div>
          ))}
        <div
          onClick={() => toggleVisibiltySelection()}
          className="blocSelectionButton"
        >
          Selection
        </div>
      </div>
    </div>
  );
}

export default Selection;
