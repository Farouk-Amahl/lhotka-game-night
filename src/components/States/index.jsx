
function States({ jeu }) {

  return (
    <div className="blockStats">
        <div>
          <span>{jeu.maxplayers.value}😀</span>
          <span>{jeu.maxplaytime.value}⏱️</span>
        </div>
    </div>
  );
}

export default States;
