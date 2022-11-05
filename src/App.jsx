import { useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import Chess from "./lib/chess";
import ModalPromotion from "./components/ModalPromotion";
import "./App.css";
import ColorSelector from "./components/ColorSelector";

const styles = {
  premove: {
    backgroundColor: "rgba(84, 180, 53, 0.6)",
  },
  target_premove: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  drop_premove: {
    opacity: "0.4",
  },
  can_move_dark: {
    border: "solid 25px rgb(181, 136, 99)",
    borderRadius: "100%",
    backgroundColor: "rgba(84, 180, 53, 0.6)",
  },
  can_move_light: {
    border: "solid 25px rgb(240, 217, 181)",
    borderRadius: "100%",
    backgroundColor: "rgba(84, 180, 53, 0.6)",
  },
  from_last: {
    backgroundColor: "rgba(84, 180, 53, 0.3)",
  },
  to_last: {
    backgroundColor: "rgba(84, 180, 53, 0.5)",
  },
  check: {
    backgroundColor: "rgba(224, 20, 76, 0.5)",
  },
};

function App() {
  const [game, setGame] = useState(new Chess());
  const [premove, setPremove] = useState(null);
  const [promotion, setPromotion] = useState(null);
  const [orientation, setOrientation] = useState("white");
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState(18);
  const [premoves, setPremoves] = useState({});
  const square_styles = useMemo(() => {
    return {
      [game.lastmove ? game.lastmove.from : null]: styles.from_last,
      [game.lastmove ? game.lastmove.to : null]: styles.to_last,
      ...premoves,
      [game.check ? game.kings_position[game.check] : null]: styles.check,
      [premove && premove.from ? premove.from : null]: styles.premove,
      [premove && premove.to ? premove.to : null]: styles.target_premove,
    };
  }, [premove, premoves, game]);

  useEffect(() => {
    if (premove && premove.from) {
      const moves = game.moves({ square: premove.from }).map((square) => {
        const color = game.squareColor(square);
        if (color === "dark") return [square, styles.can_move_dark];
        if (color === "light") return [square, styles.can_move_light];
        return [null, null];
      });
      setPremoves(Object.fromEntries(moves));
    } else {
      setPremoves([]);
    }
  }, [premove, game]);

  const newGame = () => {
    setPremove(null);
    setPromotion(null);
    setLoading(false);
    setGame(new Chess());
  };

  const selectColor = (c) => {
    setPremove(null);
    setPromotion(null);
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

  const doNext = () => {
    setLoading(true);
    game
      .next(depth)
      .then((gg) => setGame(gg))
      .finally(() => setLoading(false));
  };

  const doMove = (move) => {
    game
      .doMove(move)
      .then((g) => {
        setGame(g);
        if (!game.isMyTurn()) doNext();
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

  const doUndo = () => {
    game
      .undo()
      .then((g) => setGame(g))
      .finally(() => setPremove(null));
  };

  const onPieceDrop = (from, to) => doMove({ from, to });
  const onSquareClick = (square) => {
    if (game.gameover) {
      return;
    } else if (premove && square === premove.from) {
      setPremove(null);
    } else if (
      game.isMyTurn() &&
      game.isMyPieceOnSquare(square) &&
      (!premove || premove.from !== square)
    ) {
      setPremove({ from: square });
    } else if (premove) {
      doMove({ from: premove.from, to: square });
    }
  };
  const onMouseOverSquare = (square) => {
    if (premove) {
      if (premove.from === square) {
        setPremove((premove) => ({ ...premove, to: null }));
      } else {
        setPremove((premove) => ({ ...premove, to: square }));
      }
    }
  };

  return (
    <main className="container playground">
      <div className="container-control">
        <button className="button" onClick={newGame}>
          New Game
        </button>
        {!game.isMyTurn() && !loading && (
          <button className="button" onClick={doNext}>
            Move
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
            <ColorSelector selected={game.my_color} onSelect={selectColor} />
          </div>
          <div className="column">
            <button
              className="button fluid block"
              onClick={() =>
                setOrientation((o) => (o === "white" ? "black" : "white"))
              }
            >
              Rotate
            </button>
          </div>
          <div className="column">
            <button className="button fluid block" onClick={doUndo}>
              Undo
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
          boardOrientation={orientation}
          isDraggablePiece={({ piece }) => game.canDragPiece(piece)}
          customDropSquareStyle={styles.drop_premove}
          customSquareStyles={square_styles}
          onMouseOverSquare={onMouseOverSquare}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
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
