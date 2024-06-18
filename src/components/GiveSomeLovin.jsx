import React from "react";

const GiveSomeLovin = ({ sayMyName, things }) => {
  return (
    <>
      <span className={`${sayMyName}`}>
        {things &&
          things.map((element, index) => {
            const classType = index % 2 ? "designation" : "number";
            return (
              <span key={index} className={`${classType}`}>{`${element}`}</span>
            );
          })}
      </span>
    </>
  );
};

export default GiveSomeLovin;
