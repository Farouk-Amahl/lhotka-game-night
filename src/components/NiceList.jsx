import "../styles/NiceList.css";

const NiceList = ({ list, type = "boardgamemechanic"}) => {
  const myNiceList = list.filter(game => game._attributes.type === type);
  return (
    <div className="niceListContainer">
      <div className="niceList">
        {myNiceList.map((game, index) => (
          <span
            key={index}
            className="niceListItem"
          >{`${game._attributes.value}`}</span>
        ))}
      </div>
    </div>
  );
};

export default NiceList;
