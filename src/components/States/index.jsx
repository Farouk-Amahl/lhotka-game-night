
function States({ jeu }) {

  return (
    <div className="blockStats">
        <div>
          <span>{jeu.minplayers._attributes.value === jeu.maxplayers._attributes.value ? jeu.minplayers._attributes.value : jeu.minplayers._attributes.value+"-"+jeu.maxplayers._attributes.value}😀</span>
          <span>{jeu.maxplaytime._attributes.value}⏱️</span>
        </div>
    </div>
  );
}

export default States;
