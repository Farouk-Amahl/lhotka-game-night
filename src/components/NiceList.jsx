import React from "react";
import "../styles/NiceList.css";

const NiceList = ({ list }) => {
  const myNiceList = list.filter((game) => {
    return game._attributes.type === "boardgamemechanic";
  });
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
