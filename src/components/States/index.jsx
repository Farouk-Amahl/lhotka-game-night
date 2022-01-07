
function States({ jeu }) {

  return (
    <div className="blockStats">
        <div>
          <span>{jeu.minplayers.value === jeu.maxplayers.value ? jeu.minplayers.value : jeu.minplayers.value+"-"+jeu.maxplayers.value}😀</span>
          <span>{jeu.maxplaytime.value}⏱️</span>
        </div>
    </div>
  );
}

export default States;
