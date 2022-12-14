import axios from "axios";
import { Chess as ChessJS } from "chess.js";

export const styles = {
  premove: {
    backgroundColor: "rgba(84, 180, 53, 0.6)",
  },
  target_premove: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  drop_premove: {
    opacity: "0.4",
  },
  can_move_capture: {
    border: "solid 5px rgba(84, 180, 53, 0.6)",
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

function uciToMove(uci) {
  return {
    from: uci.substring(0, 2),
    to: uci.substring(2, 4),
    promotion: uci.length > 4 ? uci.charAt(uci.length - 1) : undefined,
  };
}

const ChessRequest = {
  find(fen, depth = 18) {
    const data = JSON.stringify({ fen, depth });
    const config = {
      method: "post",
      url: "/find",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    return axios(config).then((res) => res.data);
  },
};

export default class Chess extends ChessJS {
  my_color = "w";
  kings_position = { w: "e1", b: "e8" };
  check = null;
  winner = null;

  get gameover() {
    return this.isGameOver();
  }
  get lastmove() {
    return this.history({ verbose: true }).pop();
  }
  get position() {
    return this.fen();
  }

  setMyColor(color) {
    this.my_color = color;
    return Object.create(this);
  }

  setKingPosition(color, position) {
    this.kings_position = { ...this.kings_position, [color]: position };
  }

  _checkCheck() {
    if (this.isCheck()) {
      if (this._isKingAttacked("w")) {
        this.check = "w";
      } else if (this._isKingAttacked("b")) {
        this.check = "b";
      }
    } else {
      this.check = null;
    }
  }

  _checkGameOver() {
    if (this.gameover) {
      if (this.isCheckmate()) {
        this.winner = this.check === "w" ? "b" : "w";
      } else if (this.isDraw()) {
        this.winner = null;
      }
    }
  }

  _needPromotionMove(move) {
    const piece = this.get(move.from);
    if (!move.promotion && piece && piece.type === "p") {
      const black_promotion = piece.color === "b" && move.to.charAt(1) === "1";
      const white_promotion = piece.color === "w" && move.to.charAt(1) === "8";
      if (black_promotion || white_promotion) return true;
    }
    return false;
  }

  async doMove(param) {
    const move = typeof param === "string" ? uciToMove(param) : param;
    if (this.gameover) return;
    if (this._needPromotionMove(move)) throw new Error("need_promotion");

    const mv = this.move(move);
    if (mv) {
      if (mv.piece === "k") this.setKingPosition(mv.color, mv.to);
      this._checkCheck();
      this._checkGameOver();
      return Promise.resolve(Object.create(this));
    }
    return Promise.reject();
  }

  isTurnPieceOnSquare(square) {
    const piece = this.get(square);
    return piece && piece.color === this.turn();
  }

  isMyPieceOnSquare(square) {
    const piece = this.get(square);
    return piece && piece.color === this.my_color;
  }

  isMyPiece(piece) {
    return piece.charAt(0) === this.my_color;
  }

  isMyTurn() {
    return this.turn() === this.my_color;
  }

  canDragPiece(piece) {
    return this.isMyTurn() && this.isMyPiece(piece);
  }

  canDragPieceTurn(piece) {
    return this.turn() === piece.charAt(0);
  }

  next(depth) {
    if (this.gameover) {
      return Promise.reject();
    } else {
      return ChessRequest.find(this.position, depth).then((move) =>
        this.doMove(move)
      );
    }
  }

  undo() {
    if (this.gameover) {
      return Promise.reject();
    } else {
      const mv = super.undo();
      if (mv) {
        if (mv.piece === "k") this.setKingPosition(mv.color, mv.from);
        this._checkCheck();
        this._checkGameOver();
      }
      return Promise.resolve(Object.create(this));
    }
  }
}
