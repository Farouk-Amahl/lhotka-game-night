// doit changer de nom pour devenir gameCard
import React from "react";
import Jeu from "../../components/Jeu";
import { useState, useEffect } from "react";
import Selection from "../../components/Selection";
import Options from "../../components/Options";
import SortingTool from "../../components/SortingTool";
import "../../styles/session.css";
import convert from "xml-js";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

function Session({ user, setUser }) {
  const [gamesOwned, setGamesOwned] = useState([]);
  const [completeListOfGames, setCompleteListOfGames] = useState([]);
  const [displayedListOfGames, setDisplayedListOfGames] = useState([]);

  const nomUser = sessionStorage.getItem("userName");
  const [selection, updateSelection] = useState(null);
  const [paneState, setPaneState] = useState(false);
  const [gameWithInfo, setGameWithInfo] = useState({});

  const [twoPlayersClicked, setTwoPlayersClicked] = useState(false);
  const [soloGameClicked, setSoloGameClicked] = useState(false);

  // getting exaustive list of games but missing information, more complete list on the next useEffect
  useEffect(() => {
    const fetchAllPlayersLists = async () => {
      const listOfPlayers = ["mcxii", "Scrobs", "Ruhtro", "MarkoHighlander"];
      const requests = listOfPlayers.map(async (player) => {
        const response = await fetch(
          `https://api.geekdo.com/xmlapi2/collection?username=${player}`
        );
        const data = await response.text();
        const clearJson = convert.xml2js(data, { compact: true, spaces: 4 });
        return clearJson;
      });

      try {
        const responses = await Promise.all(requests);
        const namesAndGames = [];
        responses.forEach((playerList, index) => {
          playerList.items.item.forEach((game) => {
            game._attributes.owner = listOfPlayers[index];
          });
          namesAndGames.push(playerList.items.item);
        });
        setGamesOwned(namesAndGames);
      } catch (error) {
        console.error("Something went funcky :", error);
      }
    };
    fetchAllPlayersLists();
  }, []);

  useEffect(() => {
    const fetchMoreCompleteListOfGames = async () => {
      let stringOfGamesIds = [];
      gamesOwned &&
        gamesOwned.forEach((playerGamesList) => {
          playerGamesList.forEach((game) => {
            stringOfGamesIds.push(game._attributes.objectid);
          });
        });
      try {
        stringOfGamesIds = [...new Set(stringOfGamesIds)];
        stringOfGamesIds.join(",");
        const response = await fetch(
          `https://api.geekdo.com/xmlapi2/thing?id=` + stringOfGamesIds
        );
        const data = await response.text();
        const clearJson = convert.xml2js(data, { compact: true, spaces: 4 });
        setCompleteListOfGames(clearJson.items.item);
      } catch (error) {
        console.error("That's bad, this doesn't fit :", error);
      }
    };
    fetchMoreCompleteListOfGames();
  }, [gamesOwned]);

  // cleaning the final list threw filters
  useEffect(() => {
    // put the owners in the complete list of games
    try {
      gamesOwned.forEach((player) => {
        player.forEach((gameOwned) => {
          const targetedGame = completeListOfGames.find(
            (item) => item._attributes.id === gameOwned._attributes.objectid
          );
          if (!targetedGame._attributes.owners) {
            targetedGame._attributes.owners = [];
          }
          targetedGame._attributes.owners.push(gameOwned._attributes.owner);
        });
      });
      completeListOfGames.forEach((game) => {
        if (game._attributes.type === "boardgameexpansion") {
          const infos = game.link;
          const parentGameInfo = infos.find(
            (info) => info._attributes.inbound === "true"
          );
          const parentGame = completeListOfGames.find(
            (parent) => parent._attributes.id === parentGameInfo._attributes.id
          );
          if (
            parentGame.minplayers._attributes.value >
            game.minplayers._attributes.value
          ) {
            parentGame.minplayers._attributes.value =
              game.minplayers._attributes.value;
          }
          parentGame.maxplayers._attributes.value =
            game.maxplayers._attributes.value;
        }
      });
      const filtered = completeListOfGames.filter(
        (game) =>
          game._attributes.type !== "boardgameexpansion" &&
          game.maxplayers._attributes.value > 3
      );
      setDisplayedListOfGames(filtered);
    } catch (error) {
      console.error("Aie, Aie, Aie : ", error);
    }
  }, [completeListOfGames, gamesOwned]);

  // ongoing selection of games
  useEffect(() => {
    fetch(`https://lhotka.simplicitas.net/select`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        updateSelection(data);
      });
  }, []);

  const sortingGames = (sort) => {
    let sorted = [];
    switch (sort) {
      case "solo":
        soloGameClicked
          ? (sorted = completeListOfGames.filter(
              (game) =>
                game.minplayers._attributes.value * 1 === 1 &&
                game.maxplayers._attributes.value * 1 === 1 &&
                game._attributes.type !== "boardgameexpansion"
            ))
          : (sorted = completeListOfGames.filter(
              (game) =>
                game.minplayers._attributes.value * 1 === 1 &&
                game._attributes.type !== "boardgameexpansion"
            ));
        break;
      case "two players":
        twoPlayersClicked
          ? (sorted = completeListOfGames.filter(
              (game) =>
                game.minplayers._attributes.value * 1 === 2 &&
                game.maxplayers._attributes.value * 1 === 2 &&
                game._attributes.type !== "boardgameexpansion"
            ))
          : (sorted = completeListOfGames.filter(
              (game) =>
                game.minplayers._attributes.value * 1 < 3 &&
                game.maxplayers._attributes.value * 1 > 1 &&
                game._attributes.type !== "boardgameexpansion"
            ));
        break;
      case "number":
        break;
      default:
        sorted = completeListOfGames.filter(
          (game) =>
            game.minplayers._attributes.value * 1 <= sort &&
            game.maxplayers._attributes.value * 1 >= sort &&
            game._attributes.type !== "boardgameexpansion"
        );
    }
    setDisplayedListOfGames(sorted);
    twoPlayersClicked && setTwoPlayersClicked(false);
    soloGameClicked && setSoloGameClicked(false);
  };

  const cleanTitle = (x) => {
    const titre = x.name[0]
      ? x.name[0]._attributes.value
      : x.name._attributes.value;
    let newTitle = "";
    titre.indexOf("The ") === 0
      ? (newTitle = titre.slice(4))
      : titre.indexOf("A ") === 0
      ? (newTitle = titre.slice(2))
      : (newTitle = titre);
    return newTitle;
  };

  const setThePane = (gameIndex) => {
    setGameWithInfo(displayedListOfGames.at(gameIndex));
    setPaneState(true);
  };

  const htmlDecode = (input) => {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  };

  completeListOfGames &&
    completeListOfGames.sort(function compare(a, b) {
      if (cleanTitle(a) < cleanTitle(b)) return -1;
      if (cleanTitle(a) > cleanTitle(b)) return 1;
      return 0;
    });

  const firtInList = (elem, pathToValue) => {
    const pathArray = pathToValue.split(".");
    return pathArray.reduce(
      (acc, curr) => acc && acc[curr],
      elem[0] ? elem[0] : elem
    );
  };

  return (
    <>
      <div className="selectionContainer">
        <Selection
          selection={selection}
          updateSelection={updateSelection}
          nomUser={nomUser}
        />
      </div>
      <div className="sessionContainer">
        <div className="sessionInner">
          <Options
            label="Sorting"
            Content={SortingTool}
            contentAction={sortingGames}
            setTwoPlayers={setTwoPlayersClicked}
            setSoloGames={setSoloGameClicked}
          />
          {displayedListOfGames &&
            displayedListOfGames.map((game, index) => (
              <Jeu
                key={game._attributes.id}
                titre={
                  game.name[0]
                    ? game.name[game.name.length - 1]._attributes.value
                    : game.name._attributes.value
                }
                idJeu={game._attributes.id}
                photo={game.thumbnail._text}
                jeu={game}
                selection={selection}
                updateSelection={updateSelection}
                showPane={setThePane}
                nomUser={nomUser}
                index={index}
              />
            ))}
        </div>
      </div>
      <SlidingPane
        className="some-custom-class"
        overlayClassName="some-custom-overlay-class"
        isOpen={paneState}
        title={htmlDecode(
          gameWithInfo.name &&
            firtInList(gameWithInfo.name, "_attributes.value")
        )}
        subtitle="Optional subtitle."
        onRequestClose={() => {
          // triggered on "<" on left top click or on outside click
          setPaneState(false);
        }}
      >
        <div>
          {gameWithInfo.description &&
            htmlDecode(gameWithInfo.description._text)}
        </div>
        <br />
        <img
          src={gameWithInfo.description && htmlDecode(gameWithInfo.image._text)}
          alt={
            gameWithInfo.name &&
            firtInList(gameWithInfo.name, "_attributes.value")
          }
        />
      </SlidingPane>
    </>
  );
}

export default Session;
