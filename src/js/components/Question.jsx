import questionCss from '../../css/components/Question.scss'
import Countdown from './Countdown'
import React, { Component } from 'react'

class Question extends Component {
  constructor (props) {
    super(props)

    this.state = {
      timeLeft: props.totalTime,
      addTime: props.addTime,
      addedTime: 0
    }
    this.timeout = {}
  }

  componentDidUpdate () {
    const { addTime, onTimeout } = this.props
    if (this.state.addTime !== addTime) {
      let cappedTime = Math.min(Question.defaultProps.totalTime, this.state.timeLeft + addTime)
      this.setState({
        addTime,
        timeLeft: cappedTime
      })
    }
    if (this.state.timeLeft <= 0) {
      onTimeout()
    }
  }

  componentDidMount () {
    const loop = () => {
      if (this.state.timeLeft <= 0) return
      this.setState({ timeLeft: this.state.timeLeft - 100 })
      this.timeout = setTimeout(loop, 100)
    }
    loop()
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)
  }

  render () {
    const { word, colour, readColourRound, totalTime } = this.props
    return (
      <section className={questionCss.card}>
        {readColourRound
          ? (<span className={questionCss.highlight}>📖 read</span>)
          : (<span className={questionCss.highlightAlt}>see 👀</span>)}
        <Countdown timeLeft={this.state.timeLeft} totalTime={totalTime} />
        <h2 className={`${questionCss[colour]} ${questionCss.question}`}>{word}</h2>
      </section>
    )
  }
}

Question.defaultProps = {
  totalTime: 10000,
  timeLeft: 10000,
  addTime: 0
}

export default Question
