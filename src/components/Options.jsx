import "../styles/Options.css";

function Options({label, sortByNbrPlayers}) {

  return (
    <div className="optionWrapper">
      <div className="Options">
        <span>0123456</span>
        <input type="range" id="nbrPlayers" min="0" max="6" step="1" onChange={(e) => sortByNbrPlayers(e.target.value)}/>
      </div>
      <div className="optionLabel">
        {label}
      </div>
    </div>
  );
}

export default Options;
