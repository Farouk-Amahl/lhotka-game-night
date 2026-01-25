import useSwipe from "../../utils/useSwipe";
import GameCard from "../../components/GameCard";
import { useState, useEffect, useRef, useCallback } from "react";
import Selection from "../../components/Selection";
import Options from "../../components/Options";
import SortingTool from "../../components/SortingTool";
import "../../styles/session.css";
import convert from "xml-js";
import NiceList from "../../components/NiceList";

export const BACKEND_URL = "https://lhotka.simplicitas.net/";
const API_URL = "https://boardgamegeek.com/xmlapi2/";
const API_KEY = process.env.REACT_APP_BGG_API_KEY;
const PREFIXES = ["The ", "A "];
const CACHE_FRESHNESS_HOURS = 24;

function Session({ user, setUser }) {
  const [gameOwnersList, setGameOwnersList] = useState([]);
  const [gamesOwned, setGamesOwned] = useState([]);
  const [completeListOfGames, setCompleteListOfGames] = useState([]);
  const [displayedListOfGames, setDisplayedListOfGames] = useState([]);
  const [selection, updateSelection] = useState([]);
  const [gameWithInfo, setGameWithInfo] = useState({});
  const [twoPlayersClicked, setTwoPlayersClicked] = useState(false);
  const [soloGameClicked, setSoloGameClicked] = useState(false);
  const [cacheMetadata, setCacheMetadata] = useState(null);

  const ownedGames = useRef([]);
  const infoPane = useRef(HTMLDivElement);
  const currentUser = sessionStorage.getItem("userName");
  const cacheLoadAttempted = useRef(false);
  const isUpdatingCache = useRef(false);

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

  // Helper function to check if cache is fresh
  const isCacheFresh = useCallback((timestamp) => {
    if (!timestamp) return false;
    const cacheTime = new Date(timestamp).getTime();
    const now = Date.now();
    const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
    return hoursDiff < CACHE_FRESHNESS_HOURS;
  }, []);

  // Helper function to generate hash from games owned list
  const generateGamesOwnedHash = useCallback((gamesOwned) => {
    if (!gamesOwned || gamesOwned.length === 0) return "";
    let stringOfGamesIds = [];
    gamesOwned.forEach((playerGamesList) => {
      if (playerGamesList && Array.isArray(playerGamesList)) {
        playerGamesList.forEach((game) => {
          if (game && game._attributes && game._attributes.objectid) {
            stringOfGamesIds.push(game._attributes.objectid);
          }
        });
      }
    });
    stringOfGamesIds.sort((a, b) => a - b);
    return stringOfGamesIds.join(",");
  }, []);

  // Helper function to normalize items from BGG API (single object or array)
  const normalizeItems = useCallback((items) => {
    if (!items || !items.item) return [];
    return Array.isArray(items.item) ? items.item : [items.item];
  }, []);

  // Helper function to add owners to games (optimized with Map for O(1) lookups)
  const addOwnersToGames = useCallback((games, ownedGamesList) => {
    if (!ownedGamesList || ownedGamesList.length === 0) {
      // Just ensure all games have owners array
      games.forEach((game) => {
        if (!game._attributes.owners) {
          game._attributes.owners = [];
        }
      });
      return;
    }

    // Create a map of gameId -> owners for O(1) lookup
    const ownersMap = new Map();
    ownedGamesList.forEach((player) => {
      player.forEach((gameOwned) => {
        const gameId = gameOwned._attributes?.objectid;
        const owner = gameOwned._attributes?.owner;
        if (gameId && owner) {
          if (!ownersMap.has(gameId)) {
            ownersMap.set(gameId, []);
          }
          if (!ownersMap.get(gameId).includes(owner)) {
            ownersMap.get(gameId).push(owner);
          }
        }
      });
    });

    // Add owners to games using the map
    games.forEach((game) => {
      const gameId = game._attributes?.id;
      if (gameId && ownersMap.has(gameId)) {
        game._attributes.owners = ownersMap.get(gameId);
      } else if (!game._attributes.owners) {
        game._attributes.owners = [];
      }
    });
  }, []);

  // Helper function to check if we should fetch in background
  const shouldFetchInBackground = useCallback(() => {
    // If cache is loaded and fresh, don't fetch
    if (cacheMetadata && completeListOfGames.length > 0 && isCacheFresh(cacheMetadata.timestamp)) {
      return false;
    }
    // If cache is loaded but stale, fetch in background
    if (cacheMetadata && completeListOfGames.length > 0 && !isCacheFresh(cacheMetadata.timestamp)) {
      return true;
    }
    // If no cache at all (cache load attempted but no cache found), fetch
    if (cacheLoadAttempted.current && (!cacheMetadata || !completeListOfGames.length)) {
      return true;
    }
    return false;
  }, [cacheMetadata, completeListOfGames, isCacheFresh]);

  // Load cache first (primary source)
  useEffect(() => {
    (async () => {
      const label = "Light speed from cache !!!!";
      console.time(label);
      try {
        const rawResponse = await fetch(BACKEND_URL + "?action=cached");
        const content = await rawResponse.json();
        if (content && content.timestamp && content.gamesOwnedHash && content.data) {
          setCacheMetadata({
            timestamp: content.timestamp,
            gamesOwnedHash: content.gamesOwnedHash
          });
          setCompleteListOfGames(Array.isArray(content.data) ? content.data : []);
        } else {
          // No cache or invalid format
          setCacheMetadata(null);
          setCompleteListOfGames([]);
        }
      } catch (error) {
        console.error("Error loading cache:", error);
        setCacheMetadata(null);
        setCompleteListOfGames([]);
      } finally {
        cacheLoadAttempted.current = true; // Mark cache loading as complete
      }
      console.timeEnd(label);
    })();
  }, []);

  // setting the list of game owners
  useEffect(() => {
    setGameOwnersList(["mcxii", "Scrobs", "Ruhtro", "MarkoHighlander"]);
  }, []);

  // Background fetch: Only fetch if cache is stale or missing (non-blocking)
  // Wait for cache to load before deciding whether to fetch
  useEffect(() => {
    if (gameOwnersList.length === 0) {
      return;
    }
    // Wait for cache to finish loading
    if (!cacheLoadAttempted.current) {
      return;
    }
    // Don't fetch if we're currently updating the cache
    if (isUpdatingCache.current) {
      return;
    }
    // Now check if we need to fetch
    if (!shouldFetchInBackground()) {
      console.log("Cache is fresh, skipping background fetch");
      setGamesOwned([]); // Use cached data
      return;
    }

    // Fetch in background (non-blocking)
    console.log("Cache is stale or missing, fetching in background...");
    const fetchAllPlayersLists = async () => {
      const requests = gameOwnersList.map(async (player) => {
          try {
            const response = await fetch(`${API_URL}collection?username=${player}`, {
              method: "GET",
              withCredentials: true,
              headers: { "Authorization": `Bearer ${API_KEY}` }
            });
            if (!response.ok) {
              console.error(`HTTP error ${response.status} for player ${player}`);
              return null;
            }
            const data = await response.text();
            const clearJson = convert.xml2js(data, { compact: true, spaces: 2 });
            return clearJson;
          } catch (error) {
            console.error(`Error fetching collection for player ${player}:`, error);
            return null;
          }
      });

      try {
        const responses = await Promise.all(requests);
        const namesAndGames = [];
        let allSuccessful = true;
        
        responses.forEach((playerList, index) => {
          if (!playerList) {
            allSuccessful = false;
            return;
          }
          if (playerList.items !== undefined && playerList.items.item !== undefined) {
            const items = normalizeItems(playerList.items);
            
            items.forEach((game) => {
              game._attributes.owner = gameOwnersList[index];
            });
            const onlyOwned = items.filter((game) => {
              return game.status && game.status._attributes && game.status._attributes.own === "1";
            });
            namesAndGames.push(onlyOwned);
          } else {
            allSuccessful = false;
          }
        });

        // Only proceed if all collections were fetched successfully
        if (allSuccessful && namesAndGames.length === gameOwnersList.length) {
          setGamesOwned(namesAndGames);
        } else {
          console.warn("Some collections failed to fetch, not updating cache");
          // Keep using existing cache
        }
      } catch (error) {
        console.error("Error fetching players' collections:", error);
        // Keep using existing cache
      }
    };
    fetchAllPlayersLists();
  }, [gameOwnersList, cacheMetadata, completeListOfGames, shouldFetchInBackground, normalizeItems]);

  // Handle cache usage - always use cache first (even if stale)
  useEffect(() => {
    // If we have cached data, use it immediately (even if stale)
    if (cacheMetadata && completeListOfGames.length > 0) {
      console.log("Using cached data (fresh or stale) for immediate display");
      // Set empty ownedGames since we're using cached data
      // Owners should already be in cached games from previous fetch
      ownedGames.current = [];
      // Ensure localStorage is updated with cached hash
      if (cacheMetadata.gamesOwnedHash) {
        localStorage.setItem("gamesOwned", cacheMetadata.gamesOwnedHash);
      }
    }
  }, [cacheMetadata, completeListOfGames]);

  // Background fetch: Get full game details and update cache only if successful
  useEffect(() => {
    // Skip if gamesOwned is empty (using cached data, no background fetch needed)
    if (gamesOwned.length === 0) {
      return;
    }

    // Don't fetch if cache is fresh and has the data we need
    const currentGamesOwnedHash = generateGamesOwnedHash(gamesOwned);
    if (cacheMetadata && 
        cacheMetadata.gamesOwnedHash === currentGamesOwnedHash &&
        completeListOfGames.length > 0 &&
        isCacheFresh(cacheMetadata.timestamp)) {
      console.log("Cache is fresh and has this data, skipping game details fetch");
      ownedGames.current = gamesOwned;
      if (currentGamesOwnedHash) {
        localStorage.setItem("gamesOwned", currentGamesOwnedHash);
      }
      return;
    }

    ownedGames.current = gamesOwned;
    const fetchMoreCompleteListOfGames = async () => {
        // Check if cache already has this data (even if stale, we might not need to fetch)
        if (cacheMetadata && 
            cacheMetadata.gamesOwnedHash === currentGamesOwnedHash &&
            completeListOfGames.length > 0) {
          console.log("Cache already has this data, skipping fetch");
          if (currentGamesOwnedHash) {
            localStorage.setItem("gamesOwned", currentGamesOwnedHash);
          }
          return;
        }

        // Fetch from BGG in background (cache is stale or missing)
        console.log("Fetching game details in background to update cache...");
        let stringOfGamesIds = [];
        gamesOwned.forEach((playerGamesList) => {
          playerGamesList.forEach((game) => {
            stringOfGamesIds.push(game._attributes.objectid);
          });
        });
        // to make sure that the list is always the same
        stringOfGamesIds.sort((a, b) => a - b);
        stringOfGamesIds = [...new Set(stringOfGamesIds)];
        
        // Store the expected number of games before chunking
        const expectedGameCount = stringOfGamesIds.length;
        
        if (stringOfGamesIds.length > 0) {
          let chunks = [];
          const chunkSize = 20;
          const numChunks = Math.ceil(stringOfGamesIds.length / chunkSize);
          for (let i = 0; i < numChunks; i++) {
            chunks[i] = stringOfGamesIds.slice(i * chunkSize, i * chunkSize + chunkSize);
          }
          stringOfGamesIds = chunks;
          chunks = [];
          try {
            let fetchSuccess = true;
            
            for (let i = 0; i < stringOfGamesIds.length; i++) {
              const chunk = stringOfGamesIds[i];
              const chunkString = chunk.join(",");
              const request = new Request(`${API_URL}thing?id=${chunkString}`);
              
              try {
                const response = await fetch(request, {
                  method: "GET",
                  withCredentials: true,
                  headers: { "Authorization": `Bearer ${API_KEY}` }
                });
                
                // Check for HTTP errors (429, 500, etc.)
                if (!response.ok) {
                  console.error(`HTTP error ${response.status} for chunk ${i + 1}/${stringOfGamesIds.length}`);
                  if (response.status === 429) {
                    console.error("Rate limit exceeded (429). Stopping fetch to preserve cache.");
                    fetchSuccess = false;
                    break; // Stop fetching to avoid more rate limit issues
                  }
                  fetchSuccess = false;
                  continue; // Skip this chunk but continue with others
                }
                
                const data = await response.text();
                const clearJson = convert.xml2js(data, {
                  compact: true,
                  spaces: 2,
                });
                const items = normalizeItems(clearJson.items);
                chunks = chunks.concat(items);
              } catch (chunkError) {
                console.error(`Error fetching chunk ${i + 1}/${stringOfGamesIds.length}:`, chunkError);
                fetchSuccess = false;
                // Continue with other chunks, but mark as incomplete
              }
            }

            // Only write to cache if we successfully fetched all chunks
            // Verify we got data for all expected games
            const actualGameCount = chunks.length;
            const isComplete = fetchSuccess && actualGameCount >= expectedGameCount * 0.9; // Allow 10% tolerance for edge cases
            
            if (isComplete) {
              // Add owners to chunks before saving to cache
              addOwnersToGames(chunks, ownedGames.current);
              
              // Update cache with metadata
              const cachePayload = {
                timestamp: new Date().toISOString(),
                gamesOwnedHash: currentGamesOwnedHash,
                data: chunks
              };

              // Before writing cache, verify it hasn't been updated by another session
              const verifyCache = async () => {
                try {
                  const checkResponse = await fetch(BACKEND_URL + "?action=cached");
                  const existingCache = await checkResponse.json();
                  
                  if (existingCache && existingCache.timestamp) {
                    const existingTime = new Date(existingCache.timestamp).getTime();
                    const newTime = new Date(cachePayload.timestamp).getTime();
                    
                    // If existing cache is newer, don't overwrite
                    if (existingTime > newTime) {
                      console.log("Cache was updated by another session, skipping write");
                      return false;
                    }
                    
                    // If existing cache is fresh and we had errors, don't overwrite with incomplete data
                    if (!fetchSuccess && isCacheFresh(existingCache.timestamp)) {
                      console.log("Fetch incomplete but existing cache is fresh, preserving it");
                      return false;
                    }
                  }
                  return true;
                } catch (error) {
                  console.error("Error verifying cache:", error);
                  // If we had fetch errors, don't overwrite existing cache
                  return fetchSuccess;
                }
              };

              const shouldWrite = await verifyCache();
              if (shouldWrite) {
                isUpdatingCache.current = true; // Mark that we're updating cache
                try {
                  const rawResponse = await fetch(
                    BACKEND_URL + "?action=cache",
                    {
                      method: "POST",
                      headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(cachePayload),
                    }
                  );
                  const content = await rawResponse.json();
                  
                  // Only update display and metadata if cache write was successful
                  if (content && !content.error) {
                    console.log("Cache updated successfully, updating display");
                    setCompleteListOfGames(chunks);
                    setCacheMetadata({
                      timestamp: cachePayload.timestamp,
                      gamesOwnedHash: currentGamesOwnedHash
                    });
                    if (currentGamesOwnedHash) {
                      localStorage.setItem("gamesOwned", currentGamesOwnedHash);
                    }
                    // Clear the flag after a short delay to allow useEffect to settle
                    setTimeout(() => {
                      isUpdatingCache.current = false;
                    }, 1000);
                  } else {
                    console.warn("Cache write failed, preserving existing cache");
                    isUpdatingCache.current = false;
                    // Keep using existing cache
                  }
                } catch (writeError) {
                  console.error("Error writing to cache:", writeError);
                  isUpdatingCache.current = false;
                  // Keep using existing cache
                }
              } else {
                console.log("Skipping cache write - preserving existing cache");
                // Keep using existing cache, don't update display
              }
            } else {
              console.warn(`Fetch incomplete: got ${actualGameCount} games, expected ~${expectedGameCount}. Not updating cache or display.`);
              // Don't overwrite cache or display with incomplete data
              // Keep using existing cache
            }
          } catch (error) {
            console.error(
              "Error fetching full list of games:",
              error
            );
            // On error, preserve existing cache - don't update anything
            console.log("Error occurred, preserving existing cache and display");
          }
        }
    };
    fetchMoreCompleteListOfGames();
  }, [gamesOwned, cacheMetadata, completeListOfGames, isCacheFresh, generateGamesOwnedHash, normalizeItems, addOwnersToGames]);

  // cleaning the final list threw filters
  useEffect(() => {
    if (completeListOfGames.length !== 0) {
      // put the owners in the complete list of games
      try {
        // Add owners to games (only if we have gamesOwned data from fresh fetch)
        // If using cached data, owners should already be in the cached games
        addOwnersToGames(completeListOfGames, ownedGames.current);
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
            if (!parentGame) {
              console.warn("Parent game not found for ", game);
              return;
            }
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
          }
        );
        const filtered = completeListOfGames.filter(
          (game) => game._attributes.type !== "boardgameexpansion"
        );
        sortByTitles(filtered);
        setDisplayedListOfGames(filtered);
      } catch (error) {
        console.error("The to be displayed list of games : ", error);
      }
    }
  }, [completeListOfGames, sortByTitles, addOwnersToGames]);

  // ongoing selection of games
  useEffect(() => {
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
      <Selection
        selection={selection}
        updateSelection={updateSelection}
        userName={currentUser}
      />
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
            <h3 className="slide-pane__title">
              {gameWithInfo._attributes.owners && gameWithInfo._attributes.owners.length > 0
                ? `by ${gameWithInfo._attributes.owners.join(", ")}`
                : ""}
            </h3>
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
