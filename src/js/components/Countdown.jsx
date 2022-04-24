import "../../css/components/Countdown.scss";
import React from "react";

export default ({ timeLeft, totalTime }) => {
  timeLeft = totalTime ? timeLeft / totalTime : 0;
  return (
    <div className="countdown">
      <div className="remaining" style={{ width: `${timeLeft * 100}%` }} />
    </div>
  );
};
