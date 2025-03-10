import useSwipe from "../../utils/useSwipe";
import GameCard from "../../components/GameCard";
/*import { useState, useEffect, useMemo, useRef, useCallback } from "react";*/
import { useState, useEffect, useRef, useCallback } from "react";
import Selection from "../../components/Selection";
import Options from "../../components/Options";
import SortingTool from "../../components/SortingTool";
import "../../styles/session.css";
import convert from "xml-js";
import NiceList from "../../components/NiceList";

const BACKEND_URL = "https://makak.space/gamenightbackend/";
const API_URL = "https://api.geekdo.com/xmlapi2";
const PREFIXES = ["The ", "A "];

function Session({ user, setUser }) {
  const [gameOwnersList, setGameOwnersList] = useState([]);
  const [gamesOwned, setGamesOwned] = useState([]);
  const [completeListOfGames, setCompleteListOfGames] = useState([]);
  const [displayedListOfGames, setDisplayedListOfGames] = useState([]);
  const [selection, updateSelection] = useState([]);
  const [gameWithInfo, setGameWithInfo] = useState({});
  const [twoPlayersClicked, setTwoPlayersClicked] = useState(false);
  const [soloGameClicked, setSoloGameClicked] = useState(false);

  const ownedGames = useRef([]);
  const infoPane = useRef(HTMLDivElement);
  /*const currentUser = useMemo(() => sessionStorage.getItem("userName"), []);*/
  const currentUser = sessionStorage.getItem("userName");

  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {},
    onSwipedRight: () => closePane(),
    onSwiping: (e) => {
      if (infoPane.current && e.dir === "Right") {
        const translateX = Math.min(e.absX, window.innerWidth);
        infoPane.current.style.transform = `translateX(${translateX}px)`;
        infoPane.current.style.transition = "none";
      }
    },
    onSwipeEnd: () => {
      if (infoPane.current) {
        infoPane.current.style.transform = "";
        infoPane.current.style.transition = "";
      }
    },
  });

  const sortByTitles = useCallback(
    (list) => list.sort((a, b) => cleanTitle(a).localeCompare(cleanTitle(b))),
    []
  );

  console.log("session: ", currentUser);

  useEffect(() => {
    (async () => {
      const label = "Light speed !!!!";
      console.time(label);
      const rawResponse = await fetch(BACKEND_URL + "?action=cached");
      let content = await rawResponse.json();
      content = JSON.parse(content);
      setCompleteListOfGames(content);
      console.timeEnd(label);
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
            `${API_URL}/collection?username=${player}`
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
              const rawResponse = await fetch(BACKEND_URL + "?action=cached");
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
                  const response = await fetch(`${API_URL}/thing?id=${chunk}`);
                  const data = await response.text();
                  const clearJson = convert.xml2js(data, {
                    compact: true,
                    spaces: 4,
                  });
                  chunks = chunks.concat(clearJson.items.item);
                }

                (async () => {
                  const rawResponse = await fetch(
                    BACKEND_URL + "?action=cache",
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
          (game) => game._attributes.type !== "boardgameexpansion"
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
    console.log("selected games");
    fetch(`${BACKEND_URL}?action=select`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        updateSelection(data);
      })
      .catch((err) => {
        console.log("caught it!", err);
      });
  }, []);

  const sortingGames = useCallback(
    (sort) => {
      let sorted = [];
      const list = [...completeListOfGames].filter(
        (game) => game._attributes.type !== "boardgameexpansion"
      );

      switch (sort) {
        case "solo":
          soloGameClicked
            ? (sorted = list)
            : (sorted = list.filter(
                (game) => game.minplayers._attributes.value * 1 === 1
              ));
          break;
        case "two players":
          twoPlayersClicked
            ? (sorted = list)
            : (sorted = list.filter(
                (game) =>
                  game.minplayers._attributes.value * 1 <= 2 &&
                  game.maxplayers._attributes.value * 1 >= 2
              ));
          break;
        case "number":
          break;
        case "":
        default:
          sorted = list.filter(
            (game) => game.maxplayers._attributes.value * 1 >= sort
          );
      }
      sortByTitles(sorted);
      console.log("4.list to display");
      setDisplayedListOfGames(sorted);
      twoPlayersClicked && setTwoPlayersClicked(false);
      soloGameClicked && setSoloGameClicked(false);
    },
    [completeListOfGames, soloGameClicked, sortByTitles, twoPlayersClicked]
  );

  const cleanTitle = (x) => {
    const title = x.name[0]?._attributes.value || x.name._attributes.value;
    const matchingPrefix = PREFIXES.find((prefix) => title.startsWith(prefix));
    return matchingPrefix ? title.slice(matchingPrefix.length) : title;
  };

  const setThePane = (gameIndex) => {
    const gameInfo = displayedListOfGames.at(gameIndex);
    setGameWithInfo(gameInfo);
    console.log(gameInfo);
  };

  const htmlDecode = (input) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  };

  const closePane = () => {
    infoPane.current.style.transition = "transform 200ms ease-out";
    infoPane.current.style.transform = `translateX(100%)`;
    setTimeout(() => setGameWithInfo({}), 400);
  };

  const firstInList = (elem, pathToValue) => {
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
        <Options
          label="Sorting"
          Content={SortingTool}
          contentAction={sortingGames}
          setTwoPlayers={setTwoPlayersClicked}
          setSoloGames={setSoloGameClicked}
        />
        <div className="sessionInner">
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
        <p className="bonz">
          {displayedListOfGames.length > 0
            ? `Displaying ${displayedListOfGames.length} of ${completeListOfGames.length} total fetched games and expansions.`
            : "Loading..."}
        </p>
      </div>

      {gameWithInfo?.name && (
        <div
          ref={infoPane}
          className="slide-pane__overlay"
          onClick={closePane}
          {...swipeHandlers}
        >
          <div className="slide-pane" onClick={(e) => e.stopPropagation()}>
            <div
              className="slide-pane__close"
              role="button"
              tabIndex="0"
              onClick={closePane}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 22">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M4 11l8 8c.6.5.6 1.5 0 2-.5.6-1.5.6-2 0l-9-9c-.6-.5-.6-1.5 0-2l9-9c.5-.6 1.5-.6 2 0 .6.5.6 1.5 0 2l-8 8z"
                ></path>
              </svg>
            </div>
            <h2 className="slide-pane__title">
              {htmlDecode(
                gameWithInfo.name &&
                  firstInList(gameWithInfo.name, "_attributes.value")
              )}
            </h2>
            {/* gameWithInfo._attributes.id */}
            <img
              src={gameWithInfo?.image?._text}
              alt=""
              style={{ maxWidth: "100%" }}
            />
            <em>
              <NiceList list={gameWithInfo.link} type="boardgamecategory" />
            </em>
            <div className="slide-pane__description">
              {htmlDecode(gameWithInfo?.description?._text)}
            </div>
            <NiceList list={gameWithInfo.link} type="boardgamemechanic" />
          </div>
        </div>
      )}
    </>
  );
}

export default Session;
