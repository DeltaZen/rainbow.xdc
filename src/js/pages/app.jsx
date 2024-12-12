import "../../css/pages/app.scss";
import "../../css/components/Button.scss";
import "../../css/components/Question.scss";
import React, { Component } from "react";

import Question from "../components/Question.jsx";

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
      gameState: "waiting", // 'waiting', 'playing', 'ended'
    };

    this.savedState = this.state;
    this.onTimeout = this.onTimeout.bind(this);
    this.onNewGame = this.onNewGame.bind(this);
  }

  randomN(max, min = 0) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  componentDidMount() {
    window.onHighscoresChanged = () => this.setState({});  // refresh scoreboard
  }

  parseName(name) {
    return name.length > 9 ? name.substring(0, 8) + "..." : name;
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
    window.highscores.setScore(this.state.score);

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
    this.setState({ ...this.savedState, gameState: "playing" }, () => this.setRound());
  }

  render() {
    const scores = window.highscores.getHighScores();
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
            <h1 className="title">Scoreboard</h1>
            <ul className="scoreboardlist" style={{ position: "relative" }}>
              {scores.length > 0 ? (
                <li
                  className="record"
                  style={{
                    fontWeight: "bold",
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#383b4a",
                    marginTop: "0",
                    paddingTop: "5px",
                  }}
                >
                  <span>Rank</span>
                  <span>Player</span>
                  <span>Score</span>
                </li>
              ) : (
                <p>No records yet</p>
              )}
              {scores.length > 0 &&
               scores.map((player) => (
                    <li
                      key={player.pos}
                      className="record"
                      style={{
                        fontWeight:
                          player.current ? "bold" : "normal",
                      }}
                    >
                      <span>{player.pos}</span>
                      <span>{this.parseName(player.name)}</span>
                      <span>{player.score}</span>
                    </li>
                  ))}
            </ul>
            {this.state.gameState === "ended" && (
              <h2 className="finalScore">Score: {this.state.score}</h2>
            )}
            {this.state.outOfTime ? (
              <p className="footer">You ran out of time.</p>
            ) : (
              <div className="smallCard">
                {this.state.optionClicked && (
                  <>
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
                  </>
                )}
              </div>
            )}

            <button className="primaryButton" onClick={this.onNewGame}>
              {this.state.gameState === "ended" ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>
    );
  }
}
