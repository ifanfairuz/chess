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

  const doNext = () => game.next().then((gg) => setGame(gg));
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
            AYO WOI
          </button>
        )}
      </div>
      <div className="container-board">
        <div className="row">
          <div className="column">
            <label htmlFor="color-white">
              <input
                type="radio"
                name="myColor"
                onChange={() => selectColor("w")}
                checked={game.my_color === "w"}
                id="color-white"
              />
              {" White"}
            </label>
          </div>
          <div className="column">
            <label htmlFor="color-black">
              <input
                type="radio"
                name="myColor"
                onChange={() => selectColor("b")}
                checked={game.my_color === "b"}
                id="color-black"
              />
              {" Black"}
            </label>
          </div>
          <div className="column">
            <button
              onClick={() =>
                setOrientation((o) => (o === "white" ? "black" : "white"))
              }
            >
              rotate
            </button>
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
        <p>{game.position}</p>
        <ModalPromotion promotion={promotion} />
      </div>
    </main>
  );
}

export default App;
