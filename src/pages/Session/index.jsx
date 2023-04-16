import Jeu from "../../components/Jeu";
import { useState, useEffect, useRef } from "react";
import Selection from "../../components/Selection";
import Options from "../../components/Options";
import SortingTool from "../../components/SortingTool";
import "../../styles/session.css";
import convert from 'xml-js';

function Session({ user, setUser }) {
  const [jeuxList, setJeux] = useState([]);
  const userListJeux = useRef([]);
  const [games, setGames] = useState([]);
  const [sauve, setSauve] = useState([]);
  const nomUser = sessionStorage.getItem("userName");
  const [selection, updateSelection] = useState(null);
  const [gamesNoDuplicate, setGamesNoDuplicate] = useState(null);

  useEffect(() => {
    fetch(`http://lhotka.simplicitas.net/select`)
      .then(res => {
        return res.json();
      })
      .then(data => {
        updateSelection(data);
      });
  }, []);

  useEffect(() => {
    fetch(`https://api.geekdo.com/xmlapi2/collection?username=mcxii`)
      .then( response => response.text())
      .then(data => {
        var gamesJson = convert.xml2js(data, {compact: true, spaces: 4});
        userListJeux.current = userListJeux.current.concat(gamesJson.items.item);
        setJeux(userListJeux.current);
      });
  }, []);

  useEffect(() => {
    fetch(`https://api.geekdo.com/xmlapi2/collection?username=Scrobs`)
      .then( response => response.text())
      .then(data => {
        var gamesJson = convert.xml2js(data, {compact: true, spaces: 4});
        userListJeux.current = userListJeux.current.concat(gamesJson.items.item);
        setJeux(userListJeux.current);
      });
  }, []);

  useEffect(() => {
    fetch(`https://api.geekdo.com/xmlapi2/collection?username=Ruhtro`)
      .then( response => response.text())
      .then(data => {
        var gamesJson = convert.xml2js(data, {compact: true, spaces: 4});
        userListJeux.current = userListJeux.current.concat(gamesJson.items.item);
        setJeux(userListJeux.current);
      });
  }, []);

  useEffect(() => {
      const listeThings = jeuxList
        .map(gameId => {
          return gameId._attributes.objectid;
        })
        .join();
        fetch(`https://api.geekdo.com/xmlapi2/thing?id=` + listeThings)
          .then( response => response.text())
          .then(data => {
            var listGamesJson = JSON.parse(convert.xml2json(data, {compact: true, spaces: 4}));
            setGames(listGamesJson.items.item);
            setSauve(listGamesJson.items.item);
          });
  }, [jeuxList]);

  function sortByNbrPlayers(nbrPlayersMin, nbrPlayersMax) {
    setGames(
      sauve.filter(
        jeu =>
          parseInt(jeu.minplayers._attributes.value) >= nbrPlayersMin &&
          (nbrPlayersMax > 6
            ? parseInt(jeu.maxplayers._attributes.value) > 6
            : parseInt(jeu.maxplayers._attributes.value) >= nbrPlayersMax)

          )
    )
  }

  function cleanTitle(x) {
    const titre = x.name[0] ? x.name[0]._attributes.value : x.name._attributes.value;
    let nouvTitre = "";
    titre.indexOf("The ") === 0
      ? (nouvTitre = titre.slice(4))
      : titre.indexOf("A ") === 0
        ? (nouvTitre = titre.slice(2))
        : (nouvTitre = titre);
    return nouvTitre;
  }

  games &&
    games.sort(function compare(a, b) {
      if (cleanTitle(a) < cleanTitle(b)) return -1;
      if (cleanTitle(a) > cleanTitle(b)) return 1;
      return 0;
    });

  useEffect(() => {
    var uniq = games && [
      ...new Map(games.map(item => [item._attributes["id"], item])).values()
    ];
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
          <Options label="Sorting" Content={SortingTool} contentAction={sortByNbrPlayers} />
          {gamesNoDuplicate &&
            gamesNoDuplicate.map((game, index) => (
              <Jeu
                key={game._attributes.id}
                titre={game.name[0] ? game.name[0]._attributes.value : game.name._attributes.value}
                idJeu={game._attributes.id}
                photo={game.thumbnail._text}
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
