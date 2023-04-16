import "../../styles/selection.css";
import { useLocation } from "react-router-dom";

function Selection({ selection, updateSelection, nomUser }) {
  /*const selectionDeJeux = selection && [
    ...new Map(selection.map(item => [item["jeu"], item])).values()
  ];*/
  const visit = useLocation().pathname === '/visit' ? true : false;

  const gamesSelected = [];
  const passage = []

  selection && selection.map( game => {
    const nbrChoise = selection.filter(x => x.jeu === game.jeu).length
    const item = {
      id: game.jeu,
      img: game.imgJeu,
      user: game.user,
      nbrChoise: nbrChoise
    }
    if(passage.indexOf(game.jeu) === -1){
      const num = game.jeu
      passage.push(num)
      gamesSelected.push(item)
    }else{
      const rat = gamesSelected.findIndex(jeu => jeu.id === game.jeu)
      let user = gamesSelected[rat].user
      item.user = user+', '+game.user
      gamesSelected.splice( rat, 1)
      gamesSelected.push(item)
    }
    return ''
  })

  gamesSelected.sort(function compare(a, b) {
    if (a.nbrChoise > b.nbrChoise) return -1;
    if (a.nbrChoise < b.nbrChoise) return 1;
    return 0;
  });

  function addToSelection(idJeu, photo) {
    !visit &&
      fetch("http://lhotka.simplicitas.net/selection", {
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

  return (
    <div className="selection">
      {selection &&
        gamesSelected.map(jeu => (
          <div className="blocSelection" key={jeu.id} onClick={() => addToSelection(jeu.id, jeu.img)}>
            <div className={ `blocSelectionImage ${ jeu.user.indexOf(nomUser) !== -1 && 'select' }` }>
              <img src={jeu.img} alt={jeu.jeu} />
            </div>
            <span className="blocSelectionCompte">
              {jeu.nbrChoise}
            </span>
            <span  className="blocSelectionVoters">{ jeu.user }</span>
          </div>
        ))}
    </div>
  );
}

export default Selection;
