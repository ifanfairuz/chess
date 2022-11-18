import { useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import Chess, { styles } from "../lib/chess";
import ModalPromotion from "./ModalPromotion";
import ColorSelector from "./ColorSelector";

function PvC() {
  const [game, setGame] = useState(new Chess());
  const [premove, setPremove] = useState(null);
  const [promotion, setPromotion] = useState(null);
  const [orientation, setOrientation] = useState("white");
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState(18);
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

  const doMove = (move, withNext = true) => {
    game
      .doMove(move)
      .then((g) => {
        if (g.check || g.lastmove.captured) audio.capture.play();
        else audio.move.play();
        setGame(g);
        if (!game.isMyTurn() && withNext) doNext();
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
        {!game.isMyTurn() && !loading && (
          <div className="column">
            <button className="button block" onClick={doNext}>
              Move
            </button>
          </div>
        )}
      </div>
      <div className="row">
        <div className="column">
          <input
            type="number"
            min="0"
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
  );
}

export default PvC;
