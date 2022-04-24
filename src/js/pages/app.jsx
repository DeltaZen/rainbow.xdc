import "../../css/pages/app.scss";
import "../../css/components/Button.scss";
import "../../css/components/Question.scss";
import React, { Component } from "react";

import queryString from "query-string";

import Question from "../components/Question.jsx";
import Scoreboard from "../components/Scoreboard";

//import TelegramGameProxy from 'TelegramGameProxy'

const RAINBOW_REX_API =
  "https://pv2scddcoi.execute-api.ap-southeast-1.amazonaws.com/prod";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      score: 0,
      options: ["red", "blue", "green", "yellow"],
      question: {
        word: "",
        colour: "",
      },
      addTime: 0,
      readColourRound: true, // round types: read colour, see colour
      optionClicked: "",
      correctAnswer: "",
      outOfTime: false, // reasons for game end: out of time, wrong answer
      gameState: "playing", // 'waiting', 'playing', 'ended'
    };

    this.savedState = this.state;
    this.onTimeout = this.onTimeout.bind(this);
    this.onNewGame = this.onNewGame.bind(this);
    // added by me
    this.showScoreboard = false;
    this.player = window.webxdc.selfName;
    this.lastScore = 0;
    this.PLAYERS = {};
  }

  randomN(max, min = 0) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  componentDidMount() {
    window.webxdc.setUpdateListener((update) => {
      const player = update.payload;
      this.lastScore = player.score;
      this.PLAYERS[player.name] = player;
      this.updateHighscore(player.score);
    });

    this.setRound();
  }

  componentDidUpdate() {
    if (this.state.question.word === this.savedState.question.word)
      this.setRound();
  }

  updateHighscore(score) {
    if (this.lastScore < score) {
      this.lastScore = score;
      return true;
    }
    return false;
  }

  highscores() {
    return Object.keys(this.PLAYERS)
      .map((key) => {
        const player = this.PLAYERS[key];
        return player;
      })
      .sort((a, b) => b.score - a.score);
  }

  setRound(previousWord) {
    const decoyList = this.state.options;
    const decoy = decoyList[this.randomN(decoyList.length)];
    const answerList = decoyList.filter(
      (colour) => colour !== previousWord && colour !== decoy
    );
    const answer = answerList[this.randomN(answerList.length)];
    this.setState({
      readColourRound: !(
        this.state.score > 5 && !this.randomN(2 + 10 / this.state.score)
      ),
      question: {
        word: this.state.readColourRound ? answer : decoy,
        colour: this.state.readColourRound ? decoy : answer,
      },
    });
  }

  onButtonClick(e) {
    e.preventDefault();
    const chosen = e.target.value;
    const answer = this.state.readColourRound
      ? this.state.question.word
      : this.state.question.colour;
    if (chosen === answer) {
      this.setState(
        {
          score: this.state.score + 1,
          addTime: this.randomN(2000 + 5 * this.state.score, 1000),
        },
        this.setRound(this.state.question.word)
      );
    } else {
      this.handleGameEnd("wrong", {
        optionClicked: chosen,
        correctAnswer: answer,
      });
    }
  }

  handleGameEnd(reason, data = {}) {
    const parsed = queryString.parse(window.location.search);
    if (parsed) {
      let opts = {};
      if (parsed.userId && parsed.inlineMessageId) {
        const { userId, inlineMessageId } = parsed;
        opts = { userId, inlineMessageId };
      } else if (parsed.msgId && parsed.chatId && parsed.userId) {
        const { userId, chatId, msgId } = parsed;
        opts = { userId, chatId, msgId };
      }
      // FIXME: webxdc here
      // window.fetch(`${RAINBOW_REX_API}/score`, {
      //   method: 'POST',
      //   mode: 'cors',
      //   body: JSON.stringify(Object.assign(opts, {score: this.state.score}))
      // })
      // .then(data => console.log('✅  POST succeeded!', data))
      // .catch(error => console.error('❌  POST failed!', error))
      const player = window.webxdc.selfName;
      const payload = { name: player, score: this.state.score };
      const info = `${player} scored ${this.state.score} points in Rainbow Rex!`;
      if (this.updateHighscore(this.state.score)) {
        this.PLAYERS[player] = payload;
        window.webxdc.sendUpdate({ payload: payload, info: info }, info);
      }
    }
    switch (reason) {
      case "time":
        this.setState({
          gameState: "ended",
          outOfTime: true,
        });
        break;
      case "wrong":
        const { optionClicked, correctAnswer } = data;
        this.setState({
          optionClicked,
          correctAnswer,
          gameState: "ended",
        });
        break;
      default:
        return;
    }
  }

  onTimeout() {
    this.handleGameEnd("time");
  }

  onNewGame() {
    this.setState(this.savedState);
  }

  // async function updateLoader() {
  //   window.webxdc.setUpdateListener((update) => {
  //     const player = update.payload;
  //     updateHighscore(player.addr, player.name, player.score);
  //     if (update.serial === update.max_serial) {
  //       lugares.style.display = "flex";
  //     }
  //   });
  // }

  render() {
    return (
      <div key="game">
        {this.state.gameState === "playing" ? (
          <div className="body">
            <header>
              <h2 className="score">{this.state.score}</h2>
              <Question
                word={this.state.question.word}
                colour={this.state.question.colour}
                readColourRound={this.state.readColourRound}
                addTime={this.state.addTime}
                onTimeout={this.onTimeout}
              />
            </header>

            <section className="group">
              {this.state.options.map((option) => {
                return (
                  <button
                    value={option}
                    key={option}
                    onClick={(e) => this.onButtonClick(e)}
                    className={option}
                  />
                );
              })}
            </section>
          </div>
        ) : (
          <div className="body">
            <h1 className="title">Game Over</h1>

            <h2 className="finalScore">
              Score: {this.state.score} Best: {this.lastScore}
              {/* <button
                className="subtleButton"
                onClick={() => !this.showScoreboard}
                style={{ marginLeft: 15 }}
              >
                Share
              </button> */}
            </h2>
            <div style={{ display: this.showScoreboard ? "block" : "none" }}>
              <Scoreboard list={this.highscores()} />
            </div>
            {this.state.outOfTime ? (
              <p className="footer">You ran out of time.</p>
            ) : (
              <div className="smallCard">
                <Question
                  word={this.state.question.word}
                  colour={this.state.question.colour}
                  readColourRound={this.state.readColourRound}
                  totalTime={0}
                  addTime={this.state.addTime}
                  onTimeout={() => {}}
                />
                <p className="footer">
                  You clicked{" "}
                  <b className={`${this.state.optionClicked}_q`}>
                    {this.state.optionClicked}
                  </b>{" "}
                  instead of{" "}
                  <b className={`${this.state.correctAnswer}_q`}>
                    {this.state.correctAnswer}
                  </b>
                  .
                </p>
              </div>
            )}

            <button className="primaryButton" onClick={this.onNewGame}>
              Start new game
            </button>
          </div>
        )}
      </div>
    );
  }
}
