import "../styles/SortingTool.css";

function SortingTool({label, content, sortByNbrPlayers}) {

  return (
    <div className="sotingTool">

    <input type="range" id="nbrPlayersMin" min="1" max="7" step="1" defaultValue="1" onChange={(e) => sortByNbrPlayers(e.target.value, document.getElementById('nbrPlayersMax').value)}/>
      <div className="range">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7+</span>
      </div>
      <input type="range" id="nbrPlayersMax" min="1" max="7" step="1" defaultValue="7" onChange={(e) => sortByNbrPlayers(document.getElementById('nbrPlayersMin').value, e.target.value)}/>
    </div>
  );
}

export default SortingTool;
