import PropTypes from "prop-types";
import "../../styles/jeux.css";
import States from "../States";

function Jeu({
  titre,
  idJeu,
  photo,
  jeu,
  selection,
  updateSelection,
  nomUser
}) {
function addToSelection() {
    fetch("https://lhotka-game-night.herokuapp.com/selection", {
    // fetch("http://localhost:8000/selection", {
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
    <div className={`blocJeu ${ selection.find( game => game.jeu === idJeu && game.user === nomUser) ? 'selected' : '' }`} onClick={() => addToSelection()}  >
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
