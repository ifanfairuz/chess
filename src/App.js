import { useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import Chess from "./lib/chess";
import ModalPromotion from "./components/ModalPromotion";
import "./App.css";

const styles = {
  premove: {
    backgroundColor: "rgba(84, 180, 53, 0.7)",
  },
  from_last: {
    backgroundColor: "rgba(84, 180, 53, 0.3)",
  },
  to_last: {
    backgroundColor: "rgba(84, 180, 53, 0.5)",
  },
  check: {
    backgroundColor: "rgba(224, 20, 76, 0.6)",
  },
};

function App() {
  const [game, setGame] = useState(new Chess());
  const [premove, setPremove] = useState(null);
  const [promotion, setPromotion] = useState(null);
  const [orientation, setOrientation] = useState("white");
  const [depth, setDepth] = useState(18);
  const square_styles = useMemo(
    () => ({
      [game.lastmove ? game.lastmove.from : null]: styles.from_last,
      [game.lastmove ? game.lastmove.to : null]: styles.to_last,
      [!!game.check ? game.kings_position[game.check] : null]: styles.check,
      [premove]: styles.premove,
    }),
    [premove, game]
  );

  const newGame = () => {
    setPremove(null);
    setPromotion(null);
    setGame(new Chess());
  };

  const selectColor = (c) => {
    setGame((g) => g.setMyColor(c));
  };

  const askPromotion = (color) => {
    return new Promise((res) => {
      const onSelect = (piece) => {
        setPromotion(null);
        res(piece);
      };
      setPromotion({
        color: color === "w" ? "white" : "black",
        onSelect,
      });
    });
  };

  const doNext = () => game.next(depth).then((gg) => setGame(gg));
  // .then(() => setTimeout(doNext, 0));

  const doMove = (move) => {
    game
      .doMove(move)
      .then((g) => {
        setGame(g);
        if (!game.isMyTurn()) doNext();
        // doNext();
      })
      .catch(async (err) => {
        if (err.message === "need_promotion") {
          return game.doMove({
            ...move,
            promotion: await askPromotion(game.my_color),
          });
        }
        return Promise.reject(err);
      })
      .finally(() => setPremove(null));
  };

  const onPieceDrop = (from, to) => doMove({ from, to });
  const onSquareClick = (square) => {
    if (game.gameover) {
      return;
    } else if (square === premove) {
      setPremove(null);
    } else if (game.isMyTurn() && game.isMyPieceOnSquare(square) && !premove) {
      setPremove(square);
    } else if (premove) {
      doMove({ from: premove, to: square });
    }
  };

  return (
    <main className="container playground">
      <div className="container-control">
        <button className="button" onClick={newGame}>
          New Game
        </button>
        {game.my_color === "b" && !game.lastmove && (
          <button className="button" onClick={doNext}>
            Start
          </button>
        )}
      </div>
      <div className="container-board">
        <div className="row">
          <div className="column">
            <input
              type="text"
              placeholder="depth"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
            />
          </div>
          <div className="column">
            <div className="row">
              <div className="column">
                <div className="controls">
                  <label
                    htmlFor="color-white"
                    className="control button button-outline"
                  >
                    <input
                      className="hidden"
                      type="radio"
                      name="myColor"
                      onChange={() => selectColor("w")}
                      checked={game.my_color === "w"}
                      id="color-white"
                    />
                    <span>White</span>
                    {game.my_color === "w" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.5em"
                        height="1.5em"
                        preserveAspectRatio="xMidYMid meet"
                        viewBox="0 0 512 512"
                      >
                        <g transform="translate(512 0) scale(-1 1)">
                          id=&quot;defs4976&quot; /&gt;
                          <path
                            fill="currentColor"
                            d="M60.81 476.91h300v-60h-300v60zm233.79-347.3l13.94 7.39c31.88-43.62 61.34-31.85 61.34-31.85l-21.62 53l35.64 19l2.87 33l64.42 108.75l-43.55 29.37s-26.82-36.39-39.65-43.66c-10.66-6-41.22-10.25-56.17-12l-67.54-76.91l-12 10.56l37.15 42.31c-.13.18-.25.37-.38.57c-35.78 58.17 23 105.69 68.49 131.78H84.14C93 85 294.6 129.61 294.6 129.61z"
                          />
                        </g>
                      </svg>
                    )}
                  </label>
                  <label htmlFor="color-black" className="control button">
                    <input
                      className="hidden"
                      type="radio"
                      name="myColor"
                      onChange={() => selectColor("b")}
                      checked={game.my_color === "b"}
                      id="color-black"
                    />
                    <span>Black</span>
                    {game.my_color === "b" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.5em"
                        height="1.5em"
                        preserveAspectRatio="xMidYMid meet"
                        viewBox="0 0 512 512"
                      >
                        <g transform="translate(512 0) scale(-1 1)">
                          id=&quot;defs4976&quot; /&gt;
                          <path
                            fill="currentColor"
                            d="M60.81 476.91h300v-60h-300v60zm233.79-347.3l13.94 7.39c31.88-43.62 61.34-31.85 61.34-31.85l-21.62 53l35.64 19l2.87 33l64.42 108.75l-43.55 29.37s-26.82-36.39-39.65-43.66c-10.66-6-41.22-10.25-56.17-12l-67.54-76.91l-12 10.56l37.15 42.31c-.13.18-.25.37-.38.57c-35.78 58.17 23 105.69 68.49 131.78H84.14C93 85 294.6 129.61 294.6 129.61z"
                          />
                        </g>
                      </svg>
                    )}
                  </label>
                </div>
              </div>
              <div className="column">
                <button
                  className="button block"
                  onClick={() =>
                    setOrientation((o) => (o === "white" ? "black" : "white"))
                  }
                >
                  rotate
                </button>
              </div>
            </div>
          </div>
        </div>
        {!!game.gameover && (
          <label className={game.winner ? "winner-label" : ""}>
            {game.winner
              ? `${game.winner === "w" ? "White" : "Black"} Win!!`
              : "Draw!!"}
          </label>
        )}
        <Chessboard
          id="chess-board"
          animationDuration={100}
          position={game.position}
          isDraggablePiece={({ piece }) => game.canDragPiece(piece)}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          customSquareStyles={square_styles}
          boardOrientation={orientation}
        />
        <p className="fen">
          <strong>FEN:</strong> <span>{game.position}</span>
        </p>
        <ModalPromotion promotion={promotion} />
      </div>
    </main>
  );
}

export default App;
