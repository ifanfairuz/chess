import { useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import Chess, { styles } from "../lib/chess";
import ModalPromotion from "./ModalPromotion";

function CvC() {
  const [game, setGame] = useState(new Chess());
  const [started, setStarted] = useState(false);
  const [premove, setPremove] = useState(null);
  const [promotion, setPromotion] = useState(null);
  const [orientation, setOrientation] = useState("white");
  const [delay, setDelay] = useState(1000);
  const [depthW, setDepthW] = useState(18);
  const [depthB, setDepthB] = useState(18);
  const [premoves, setPremoves] = useState({});
  const square_styles = useMemo(() => {
    let style = {
      [game.lastmove ? game.lastmove.from : null]: styles.from_last,
      [game.lastmove ? game.lastmove.to : null]: styles.to_last,
      ...premoves,
      [game.check ? game.kings_position[game.check] : null]: styles.check,
      [premove && premove.from ? premove.from : null]: styles.premove,
    };
    if (premove && premove.to && premove.to in style) {
      style[premove.to] = { ...style[premove.to], ...styles.target_premove };
    }
    return style;
  }, [premove, premoves, game]);
  const audio = useMemo(
    () => ({
      capture: new Audio("/sounds/Capture.ogg"),
      move: new Audio("/sounds/Move.ogg"),
    }),
    []
  );

  useEffect(() => {
    if (premove && premove.from) {
      const moves = game
        .moves({ square: premove.from, verbose: true })
        .map(({ to: square, flags }) => {
          const color = game.squareColor(square);
          if (flags === "c") {
            return [square, styles.can_move_capture];
          } else {
            if (color === "dark") return [square, styles.can_move_dark];
            else if (color === "light") return [square, styles.can_move_light];
          }
          return [null, null];
        });
      setPremoves(Object.fromEntries(moves));
    } else {
      setPremoves([]);
    }
  }, [premove, game]);

  const newGame = () => {
    setStarted(false);
    setPremove(null);
    setPromotion(null);
    setGame(new Chess());
  };

  const doNext = () => {
    setStarted(true);
    const start = Date.now();
    game.next(game.isMyTurn() ? depthW : depthB).then((g) => {
      if (g.check || g.lastmove.captured) audio.capture.play();
      else audio.move.play();
      const timeout = Date.now() - start;
      if (timeout < delay)
        setTimeout(() => {
          setGame(g);
          doNext();
        }, delay - timeout);
      else {
        setGame(g);
        doNext();
      }
    });
  };

  const doMove = (move) => {
    game
      .doMove(move)
      .then((g) => {
        if (g.check || g.lastmove.captured) audio.capture.play();
        else audio.move.play();
        setGame(g);
      })
      .finally(() => setPremove(null));
  };

  const onPieceDrop = (from, to) => doMove({ from, to });
  const onSquareClick = (square) => {
    if (premove && square === premove.from) {
      setPremove(null);
    } else if (
      game.isTurnPieceOnSquare(square) &&
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

  useEffect(() => {
    window.CHESSAPI = { move: (...args) => doMove(...args), next: doNext };
  }, []);

  return (
    <div className="container-board">
      <div className="row">
        <div className="column">
          <button className="button block" onClick={newGame}>
            New Game
          </button>
        </div>
        {!game.gameover && !started && (
          <div className="column">
            <button className="button block" onClick={doNext}>
              Start
            </button>
          </div>
        )}
      </div>
      <div className="row">
        <div className="column">
          <input
            type="number"
            min="0"
            placeholder="depth white"
            className="input-small"
            value={depthW}
            onChange={(e) => setDepthW(e.target.value)}
          />
        </div>
        <div className="column">
          <input
            type="number"
            min="0"
            placeholder="depth black"
            className="input-small input-black"
            value={depthB}
            onChange={(e) => setDepthB(e.target.value)}
          />
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
          <input
            type="number"
            min="1000"
            step="100"
            className="input-small"
            placeholder="delay (ms)"
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
          />
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
        animationDuration={150}
        position={game.position}
        boardOrientation={orientation}
        isDraggablePiece={({ piece }) => game.canDragPieceTurn(piece)}
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
  );
}

export default CvC;
