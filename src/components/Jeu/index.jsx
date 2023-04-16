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
  nomUser
}) {

  const visit = useLocation().pathname === '/visit' ? true : false;

function addToSelection() {
  !visit &&
    fetch("https://lhotka.simplicitas.net/selection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nomUser, idJeu, photo })
    })
    .then(res => {return res.json();})
    .then(data => {updateSelection(data);})
  }

  function htmlDecode(input) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }

  return (
    <div className={`blocJeu ${ selection && selection.find( game => game.jeu === idJeu && game.user === nomUser) ? 'selected' : '' }`} onClick={() => addToSelection()}  >
      <div className="blocJeuImage">
        <img src={photo} alt={titre} />
      </div>
      <div className="blocJeuInfo">
        <span>{htmlDecode(titre)}</span>
        <States jeu={jeu} />
      </div>
    </div>
  );
}

Jeu.propTypes = {
  titre: PropTypes.string,
  nbrJoueurs: PropTypes.number,
  photo: PropTypes.string
};

Jeu.defaultProps = {
  titre: "Un jeu"
};

export default Jeu;
