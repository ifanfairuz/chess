import axios from "axios";
import { Chess as ChessJS } from "chess.js";

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
    return axios(config).then((response) => {
      const mv = response.data;
      return {
        from: mv.substring(0, 2),
        to: mv.substring(2, 4),
        promotion: mv.length > 4 ? mv.charAt(mv.length - 1) : undefined,
      };
    });
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

  async doMove(move) {
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

  next(depth) {
    if (this.gameover) {
      return Promise.reject();
    } else {
      return ChessRequest.find(this.position, depth).then((move) =>
        this.doMove(move)
      );
    }
  }
}
