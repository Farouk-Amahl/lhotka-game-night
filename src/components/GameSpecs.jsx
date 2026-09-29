import Meeple from "./meeple";

const GameSpecs = ({ game }) => {
  return (
    <div className="blockSpecs">
      <span className="numberOfPlayers">
        {game.minplayers._attributes.value ===
        game.maxplayers._attributes.value ? (
          Array.from(
            { length: game.minplayers._attributes.value },
            (_, index) => (
              <Meeple key={index} fillColor="blueViolet" size="15px" />
            ),
          )
        ) : (
          <>
            {" "}
            {game.minplayers._attributes.value}-
            {game.maxplayers._attributes.value}{" "}
            <Meeple fillColor="blueViolet" size="15px" />{" "}
          </>
        )}
      </span>
      <span className="playTime">{game.maxplaytime._attributes.value} ⏱️</span>
    </div>
  );
};

export default GameSpecs;
