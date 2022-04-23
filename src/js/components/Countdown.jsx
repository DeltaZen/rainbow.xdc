import countdownCss from '../../css/components/Countdown.scss'
import React from 'react'

export default ({timeLeft, totalTime}) => {
  timeLeft = totalTime ? timeLeft / totalTime : 0
  return (
    <div className={countdownCss.countdown}>
      <div className={countdownCss.remaining}
        style={{ width: `${timeLeft * 100}%` }}
      />
    </div>
  )
}
