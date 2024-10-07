// @ts-nocheck
import React from "react";
import GameCard from "../../components/GameCard";
import { useState, useEffect, useRef, useCallback } from "react";
import Selection from "../../components/Selection";
import Options from "../../components/Options";
import SortingTool from "../../components/SortingTool";
import "../../styles/session.css";
import convert from "xml-js";
import SlidingPane from "react-sliding-pane";
import NiceList from "../../components/NiceList";
/* import ExpandableText from "../../components/ExpandableText";*/
// import "react-sliding-pane/dist/react-sliding-pane.css";
// import "../../styles/customSlidingPane.css";

function Session({ user, setUser }) {
  const [gameOwnersList, setGameOwnersList] = useState([]);
  const [gamesOwned, setGamesOwned] = useState([]);
  const ownedGames = useRef([]);
  const [completeListOfGames, setCompleteListOfGames] = useState([]);
  const [displayedListOfGames, setDisplayedListOfGames] = useState([]);

  const currentUser = sessionStorage.getItem("userName");
  const [selection, updateSelection] = useState([]);
  const [paneState, setPaneState] = useState(false);
  const [gameWithInfo, setGameWithInfo] = useState({});

  const [twoPlayersClicked, setTwoPlayersClicked] = useState(false);
  const [soloGameClicked, setSoloGameClicked] = useState(false);

  const sortByTitles = useCallback((list) => {
    list.sort(function compare(a, b) {
      if (cleanTitle(a) < cleanTitle(b)) return -1;
      if (cleanTitle(a) > cleanTitle(b)) return 1;
      return 0;
    });
  }, []);

  useEffect(() => {
    (async () => {
      const rawResponse = await fetch(
        "https://gamenightbackend.makak.space//?action=cached"
      );
      let content = await rawResponse.json();
      content = JSON.parse(content);
      setCompleteListOfGames(content);
      console.log("Light speed !!!!");
    })();
  }, []);

  // setting the list of game owners
  useEffect(() => {
    setGameOwnersList(["mcxii", "Scrobs", "Ruhtro", "MarkoHighlander"]);
    console.log("1.setting the list of game owners, going to next step");
  }, []);

  // getting exaustive list of games but missing information, more complete list on the next useEffect
  useEffect(() => {
    if (gameOwnersList.length !== 0) {
      const fetchAllPlayersLists = async () => {
        const requests = gameOwnersList.map(async (player) => {
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
            if (playerList.items !== undefined) {
              playerList.items.item.forEach((game) => {
                game._attributes.owner = gameOwnersList[index];
              });
              const onlyOwned = playerList.items.item.filter((game) => {
                return game.status._attributes.own === "1";
              });
              namesAndGames.push(onlyOwned);
            }
          });
          setGamesOwned(namesAndGames);
          console.log(
            "2.Loop on games owners putting in place the list of games owned"
          );
        } catch (error) {
          console.error("Trying to fetch every players's lists :", error);
        }
      };
      fetchAllPlayersLists();
    }
  }, [gameOwnersList]);

  // now getting the real list of games with all the information we need
  useEffect(() => {
    if (gamesOwned.length !== 0) {
      ownedGames.current = gamesOwned;
      const fetchMoreCompleteListOfGames = async () => {
        let stringOfGamesIds = [];
        gamesOwned.forEach((playerGamesList) => {
          playerGamesList.forEach((game) => {
            stringOfGamesIds.push(game._attributes.objectid);
          });
        });
        // to make sure that the list is always the same
        stringOfGamesIds.sort((a, b) => a - b);
        if (localStorage.getItem("gamesOwned") !== undefined) {
          const storedGamesOwned = localStorage.getItem("gamesOwned");
          const currentGamesOwned = stringOfGamesIds.join(",");
          if (storedGamesOwned === currentGamesOwned) {
            console.log(
              "2,1.checking if the data is already loaded the response is yes"
            );
            (async () => {
              const rawResponse = await fetch(
                "https://gamenightbackend.makak.space//?action=cached"
              );
              let content = await rawResponse.json();
              content = JSON.parse(content);
              setCompleteListOfGames(content);
            })();
          } else {
            if (currentGamesOwned) {
              console.log(
                "There's some changes so let's reload things from bgg"
              );
              stringOfGamesIds = [...new Set(stringOfGamesIds)];
              let chunks = [];
              for (let i = 0; i < stringOfGamesIds.length / 20; i++) {
                chunks[i] = stringOfGamesIds.slice(i * 20, i * 20 + 20);
              }
              stringOfGamesIds = chunks;
              chunks = [];
              try {
                for (let i = 0; i < stringOfGamesIds.length; i++) {
                  const chunk = stringOfGamesIds[i];
                  chunk.join(",");
                  const response = await fetch(
                    `https://api.geekdo.com/xmlapi2/thing?id=` + chunk
                  );
                  const data = await response.text();
                  const clearJson = convert.xml2js(data, {
                    compact: true,
                    spaces: 4,
                  });
                  chunks = chunks.concat(clearJson.items.item);
                }

                (async () => {
                  const rawResponse = await fetch(
                    "https://gamenightbackend.makak.space/?action=cache",
                    {
                      method: "POST",
                      headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(chunks),
                    }
                  );
                  const content = await rawResponse.json();
                  console.log(content);
                })();
                setCompleteListOfGames(chunks);
                localStorage.setItem("gamesOwned", currentGamesOwned);
              } catch (error) {
                console.error(
                  "Getting full list of games by theire ids :",
                  error
                );
              }
            }
          }
        } else {
          if (stringOfGamesIds.join(",")) {
            localStorage.setItem("gamesOwned", stringOfGamesIds.join(","));
          }
        }
        console.log("3.complete list of games");
      };
      fetchMoreCompleteListOfGames();
    }
  }, [gamesOwned]);

  // cleaning the final list threw filters
  useEffect(() => {
    if (completeListOfGames.length !== 0) {
      // put the owners in the complete list of games
      try {
        ownedGames.current.forEach((player) => {
          player.forEach((gameOwned) => {
            const targetedGame = completeListOfGames.find(
              (item) => item._attributes.id === gameOwned._attributes.objectid
            );
            if (targetedGame !== undefined) {
              if (targetedGame._attributes.owners === undefined) {
                targetedGame._attributes.owners = [];
              } else {
                targetedGame._attributes.owners.push(
                  gameOwned._attributes.owner
                );
              }
            }
          });
        });
        completeListOfGames.forEach((game) => {
          if (game._attributes.type === "boardgameexpansion") {
            const infos = game.link;
            const parentGameInfo = infos.find(
              (info) => info._attributes.inbound === "true"
            );
            const parentGame = completeListOfGames.find(
              (parent) =>
                parent._attributes.id === parentGameInfo._attributes.id
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
        sortByTitles(filtered);
        setDisplayedListOfGames(filtered);
      } catch (error) {
        console.error("The to be displayed list of games : ", error);
      }
    }
  }, [completeListOfGames, sortByTitles]);

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
    sortByTitles(sorted);
    console.log("4.list to display");
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
    console.log(gameWithInfo);
  };

  const htmlDecode = (input) => {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  };

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
          userName={currentUser}
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
              <GameCard
                game={game}
                key={game._attributes.id}
                title={
                  game.name[0]
                    ? game.name[0]._attributes.value
                    : game.name._attributes.value
                }
                gameId={game._attributes.id}
                gameImage={game.thumbnail._text}
                selection={selection}
                updateSelection={updateSelection}
                showPane={setThePane}
                userName={currentUser}
                index={index}
              />
            ))}
        </div>
      </div>
      <SlidingPane
        className="theSlidingPane"
        overlayClassName="some-custom-overlay-class"
        width="100%"
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
        <NiceList list={gameWithInfo.link} />
        {/*<ExpandableText
          textToDisplay={htmlDecode(gameWithInfo.description._text)}
        />*/}
      </SlidingPane>
    </>
  );
}

export default Session;
