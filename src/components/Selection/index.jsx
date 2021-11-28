import "../../styles/selection.css";

function Selection({ selection, updateSelection, nomUser }) {
  /*const selectionDeJeux = selection && [
    ...new Map(selection.map(item => [item["jeu"], item])).values()
  ];*/

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
      if(game.user === nomUser){
        const rat = gamesSelected.findIndex(jeu => jeu.id === game.jeu)
        gamesSelected.splice( rat, 1)
        gamesSelected.push(item)
      }
    }

    return ''
  })

  gamesSelected.sort(function compare(a, b) {
    if (a.nbrChoise > b.nbrChoise) return -1;
    if (a.nbrChoise < b.nbrChoise) return 1;
    return 0;
  });

  return (
    <div className="selection">
      {selection &&
        gamesSelected.map(jeu => (
          <div className="blocSelection" key={jeu.id}>
            <div className={ `blocSelectionImage ${ jeu.user === nomUser && 'select' }` }>
              <img src={jeu.img} alt={jeu.jeu} />
            </div>
            <span className="blocSelectionCompte">
              {jeu.nbrChoise}
            </span>
          </div>
        ))}
    </div>
  );
}

export default Selection;
