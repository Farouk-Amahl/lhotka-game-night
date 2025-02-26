import PropTypes from "prop-types";
import "../../styles/jeux.css";
import States from "../States";
import { useLocation } from "react-router-dom";

function Jeu({
  titre,
  idJeu,
  photo,
  jeu,
  selection,
  updateSelection,
  showPane,
  nomUser,
  index,
}) {
  const visit = useLocation().pathname === "/visit" ? true : false;

  function addToSelection() {
    !visit &&
      fetch("https://lhotka.simplicitas.net/selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nomUser, idJeu, photo }),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          updateSelection(data);
        });
  }

  function htmlDecode(input) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }

  return (
    <div
      id={index}
      className={`blocJeu ${
        selection &&
        selection.find((game) => game.jeu === idJeu && game.user === nomUser)
          ? "selected"
          : ""
      }`}
    >
      <div className="blocJeuImage" onClick={() => addToSelection()}>
        <img src={photo} alt={titre} />
      </div>
      <div className="blocJeuInfo" onClick={() => showPane(index)}>
        <span>{htmlDecode(titre)}</span>
        <br />
        <span className="viewMore">View more...</span>
        <States jeu={jeu} />
      </div>
    </div>
  );
}

Jeu.propTypes = {
  titre: PropTypes.string,
  nbrJoueurs: PropTypes.number,
  photo: PropTypes.string,
};

Jeu.defaultProps = {
  titre: "Un jeu",
};

export default Jeu;
