import appCss from '../../css/pages/app.scss'
import buttonCss from '../../css/components/Button.scss'
import questionCss from '../../css/components/Question.scss'
import React, { Component } from 'react'

import queryString from 'query-string'

import Question from '../components/Question'

import TelegramGameProxy from 'TelegramGameProxy'

const RAINBOW_REX_API = 'https://pv2scddcoi.execute-api.ap-southeast-1.amazonaws.com/prod'

export default class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      score: 0,
      options: ['red', 'blue', 'green', 'yellow'],
      question: {
        word: '',
        colour: ''
      },
      addTime: 0,
      readColourRound: true, // round types: read colour, see colour
      optionClicked: '',
      correctAnswer: '',
      outOfTime: false, // reasons for game end: out of time, wrong answer
      gameState: 'playing' // 'waiting', 'playing', 'ended'
    }

    this.savedState = this.state
    this.onTimeout = this.onTimeout.bind(this)
    this.onNewGame = this.onNewGame.bind(this)
  }

  randomN (max, min = 0) {
    return Math.floor(Math.random() * (max - min) + min)
  }

  componentDidMount () {
    this.setRound()
  }

  componentDidUpdate () {
    if (this.state.question.word === this.savedState.question.word) this.setRound()
  }

  setRound (previousWord) {
    const decoyList = this.state.options
    const decoy = decoyList[this.randomN(decoyList.length)]
    const answerList = decoyList.filter(colour => colour !== previousWord && colour !== decoy)
    const answer = answerList[this.randomN(answerList.length)]
    this.setState({
      readColourRound: !(this.state.score > 5 && !this.randomN(2 + 10 / this.state.score)),
      question: {
        word: this.state.readColourRound ? answer : decoy,
        colour: this.state.readColourRound ? decoy : answer
      }
    })
  }

  onButtonClick (e) {
    e.preventDefault()
    const chosen = e.target.value
    const answer = this.state.readColourRound
    ? this.state.question.word
    : this.state.question.colour
    if (chosen === answer) {
      this.setState({
        score: this.state.score + 1,
        addTime: this.randomN(2000 + 5 * this.state.score, 1000)
      }, this.setRound(this.state.question.word))
    } else {
      this.handleGameEnd('wrong', {optionClicked: chosen, correctAnswer: answer})
    }
  }

  handleGameEnd (reason, data = {}) {
    const parsed = queryString.parse(window.location.search)
    if (parsed) {
      let opts = {}
      if (parsed.userId && parsed.inlineMessageId) {
        const { userId, inlineMessageId } = parsed
        opts = { userId, inlineMessageId }
      } else if (parsed.msgId && parsed.chatId && parsed.userId) {
        const { userId, chatId, msgId } = parsed
        opts = { userId, chatId, msgId }
      }
      window.fetch(`${RAINBOW_REX_API}/score`, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(Object.assign(opts, {score: this.state.score}))
      })
      .then(data => console.log('✅  POST succeeded!', data))
      .catch(error => console.error('❌  POST failed!', error))
    }
    switch (reason) {
      case 'time':
        this.setState({
          gameState: 'ended',
          outOfTime: true
        })
        break
      case 'wrong':
        const { optionClicked, correctAnswer } = data
        this.setState({
          optionClicked,
          correctAnswer,
          gameState: 'ended'
        })
        break
      default:
        return
    }
  }

  onTimeout () {
    this.handleGameEnd('time')
  }

  onNewGame () {
    this.setState(this.savedState)
  }

  render () {
    return (
      <div key='game'>
        {this.state.gameState === 'playing'
           ? (<div className={appCss.body}>
             <header>
               <h2 className={appCss.score}>{this.state.score}</h2>
               <Question
                 word={this.state.question.word}
                 colour={this.state.question.colour}
                 readColourRound={this.state.readColourRound}
                 addTime={this.state.addTime}
                 onTimeout={this.onTimeout}
                />
             </header>

             <section className={buttonCss.group}>
               {this.state.options.map(option => {
                 return (
                   <button
                     value={option}
                     key={option}
                     onClick={e => this.onButtonClick(e)}
                     className={buttonCss[option]}
                    />
                 )
               })}
             </section>
           </div>)
           : (<div className={appCss.body}>
             <h1 className={appCss.title}>Game Over</h1>

             <h2 className={appCss.finalScore}>
               Score: {this.state.score}
               <button
                 className={buttonCss.subtleButton}
                 onClick={() => TelegramGameProxy.shareScore()}
                 style={{marginLeft: 15}}
               >Share</button>
             </h2>

             {this.state.outOfTime
                ? <p className={appCss.footer}>You ran out of time.</p>
                : (<div className={appCss.smallCard}>
                  <Question
                    word={this.state.question.word}
                    colour={this.state.question.colour}
                    readColourRound={this.state.readColourRound}
                    totalTime={0}
                    addTime={this.state.addTime}
                    onTimeout={() => {}}
                  />
                  <p className={appCss.footer}>
                    You clicked{' '}
                    <b className={questionCss[this.state.optionClicked]}>
                      {this.state.optionClicked}
                    </b> instead of{' '}
                    <b className={questionCss[this.state.correctAnswer]}>
                      {this.state.correctAnswer}
                    </b>.
                  </p>
                </div>)
              }

             <button className={buttonCss.primaryButton} onClick={this.onNewGame}>Start new game</button>
           </div>)
        }
      </div>
    )
  }
}
