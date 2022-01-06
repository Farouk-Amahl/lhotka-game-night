import Jeu from "../../components/Jeu";
import { useState, useEffect, useRef } from "react";
import Selection from "../../components/Selection";
import Options from "../../components/Options";
import "../../styles/session.css";
import bggXmlApiClient from "bgg-xml-api-client";

function Session({ user, setUser }) {
  const [jeuxList, setJeux] = useState([]);
  const userListJeux = useRef([]);
  const [games, setGames] = useState([]);
  const [sauve, setSauve] = useState([]);
  const nomUser = sessionStorage.getItem("userName");
  const [selection, updateSelection] = useState(null);
  const [gamesNoDuplicate, setGamesNoDuplicate] = useState(null);

  useEffect(() => {
    fetch(`https://lhotka-game-night.herokuapp.com/listeselection`)
      .then(res => {
        return res.json();
      })
      .then(data => {
        updateSelection(data);
      });
  }, []);

  useEffect(() => {
    async function fetchCollection() {
      const { data } = await bggXmlApiClient.get("collection", {
        username: "mcxii"
      });
      userListJeux.current = userListJeux.current.concat(data.item);
      setJeux(userListJeux.current);
    }
    fetchCollection();
  }, []);

  useEffect(() => {
    async function fetchCollection() {
      const { data } = await bggXmlApiClient.get("collection", {
        username: "Ruhtro"
      });
      userListJeux.current = userListJeux.current.concat(data.item);
      setJeux(userListJeux.current);
    }
    fetchCollection();
  }, []);

  useEffect(() => {
    async function fetchCollection() {
      const { data } = await bggXmlApiClient.get("collection", {
        username: "Scrobs"
      });
      userListJeux.current = userListJeux.current.concat(data.item);
      setJeux(userListJeux.current);
    }
    fetchCollection();
  }, []);

  useEffect(() => {
    async function fetchCollection() {
      const listeThings = jeuxList
        .map(jeu => {
          return jeu.objectid;
        })
        .join();
      const { data } = await bggXmlApiClient.get("thing", { id: listeThings });
      setGames(data.item);
      setSauve(data.item);
    }
    fetchCollection();
  }, [jeuxList]);

  function sortByNbrPlayers(nbrPlayers) {
    console.log(nbrPlayers);
      setGames(sauve.filter(jeu => parseInt(jeu.maxplayers.value) > nbrPlayers))
  }

  function cleanTitle(x) {
    const titre = x.name[0] ? x.name[0].value : x.name.value;
    let nouvTitre = "";
    titre.indexOf("The ") === 0
      ? (nouvTitre = titre.slice(4))
      : (nouvTitre = titre);
    return nouvTitre;
  }

  games &&
    games
      .sort(function compare(a, b) {
        if (cleanTitle(a) < cleanTitle(b)) return -1;
        if (cleanTitle(a) > cleanTitle(b)) return 1;
        return 0;
      });

  useEffect(() => {
    var uniq = games && [...new Map(games.map(item => [item["id"], item])).values()];
    setGamesNoDuplicate(uniq);
  }, [games]);


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
          <Options label="Sorting" sortByNbrPlayers={sortByNbrPlayers} />
          {gamesNoDuplicate &&
            gamesNoDuplicate.map((game, index) => (
              <Jeu
                key={game.id}
                titre={game.name[0] ? game.name[0].value : game.name.value}
                idJeu={game.id}
                photo={game.thumbnail}
                jeu={game}
                selection={selection}
                updateSelection={updateSelection}
                nomUser={nomUser}
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default Session;
