import React from "react";

const Scoreboard = ({ list }) => {
  console.log("hit hit");
  console.log(list);
  return (
    <div>
      <div className="scoreboard">
        <h1>Highscores</h1>
        <ul>
          {list.map((item, index) => {
            return (
              <li key={index}>
                {index} - {item.name} - {item.score}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Scoreboard;
