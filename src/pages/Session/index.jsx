import Jeu from "../../components/Jeu";
import { useState, useEffect, useRef } from "react";
import Selection from "../../components/Selection";
import "../../styles/session.css";
import bggXmlApiClient from "bgg-xml-api-client";

function Session({ user, setUser }) {
  const [jeuxList, setJeux] = useState([]);
  const userListJeux = useRef([]);
  const [games, setGames] = useState([]);
  const [sauve, setSauve] = useState([]);
  const nomUser = sessionStorage.getItem("userName");
  const [selection, updateSelection] = useState(null);

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

  function triParJoueurs(nbrJoueurs) {
    nbrJoueurs === "all" ?
      setGames(sauve.filter(jeu => jeu.maxplayers.value !== nbrJoueurs))
      :
      nbrJoueurs === "6" ?
        setGames(sauve.filter(jeu => parseInt(jeu.maxplayers.value) > 5))
      :
        setGames(sauve.filter(jeu => jeu.maxplayers.value === nbrJoueurs))
  }

  function cleanTitle(x) {
    const titre = x.name[0] ? x.name[0].value : x.name.value
    let nouvTitre = "";
    titre.indexOf('The ') === 0 ?  nouvTitre = titre.slice(4) : nouvTitre = titre
    return nouvTitre
  }

  games &&
    games.sort(function compare(a, b) {
      if (cleanTitle(a) < cleanTitle(b))
        return -1;
      if (
        (cleanTitle(a) > cleanTitle(b))
      )
        return 1;
      return 0;
    });

  // games && console.log(games);

  return (
    <div>
      <div>
        <Selection
          selection={selection}
          updateSelection={updateSelection}
          nomUser={nomUser}
        />
      </div>
      <div className="sessionContainer">
        <div>
          <div className="choixNbrJoueurs">
            <button onClick={() => triParJoueurs("all")}>all</button>
            <button onClick={() => triParJoueurs("2")}>2</button>
            <button onClick={() => triParJoueurs("4")}>4</button>
            <button onClick={() => triParJoueurs("5")}>5</button>
            <button onClick={() => triParJoueurs("6")}>6+</button>
          </div>
          {games &&
            games.map(
              (jeu, index) => (
                // jeu.name.find(truc => truc.type === "primary").value.indexOf("Expansion") === -1 && (
                <Jeu
                  key={jeu.id}
                  titre={jeu.name[0] ? jeu.name[0].value : jeu.name.value}
                  idJeu={jeu.id}
                  photo={jeu.thumbnail}
                  jeu={jeu}
                  selection={selection}
                  updateSelection={updateSelection}
                  nomUser={nomUser}
                />
              )
              // )
            )}
        </div>
      </div>
    </div>
  );
}

export default Session;
