import "../styles/Options.css";

function Options({label, sortByNbrPlayers}) {

  return (
    <div className="optionWrapper">
      <div className="Options">
        <div className="optionInner">
          <input type="range" id="nbrPlayers" min="0" max="6" step="1" onChange={(e) => sortByNbrPlayers(e.target.value)}/>
          <div className="range">
            <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
          </div>
        </div>
      </div>
      <div className="optionLabel">
        {label}
      </div>
    </div>
  );
}

export default Options;
