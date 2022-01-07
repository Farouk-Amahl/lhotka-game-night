import "../styles/Options.css";

function Options({label, Content, contentAction}) {

  return (
    <div className="optionWrapper">
      <div className="Options">
        <div className="optionInner">
          <Content sortByNbrPlayers={contentAction}/>
        </div>
      </div>
      <div className="optionLabel">
        {label}
      </div>
    </div>
  );
}

export default Options;
