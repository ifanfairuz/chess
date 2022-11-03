import { Piece } from "@chessire/pieces";

function ModalPromotion({ promotion }) {
  const onSelectPiece = (piece) =>
    !!promotion && !!promotion.onSelect && promotion.onSelect(piece);

  if (!promotion) return null;
  return (
    <div className="modal modal-pieces">
      <div className="modal-content">
        <h4>Select Promotion</h4>
        <div className="row">
          <div className="column">
            <button className="piece-btn" onClick={() => onSelectPiece("r")}>
              <Piece color={promotion.color} piece="R" width="45" />
            </button>
          </div>
          <div className="column">
            <button className="piece-btn" onClick={() => onSelectPiece("n")}>
              <Piece color={promotion.color} piece="N" width="45" />
            </button>
          </div>
          <div className="column">
            <button className="piece-btn" onClick={() => onSelectPiece("b")}>
              <Piece color={promotion.color} piece="B" width="45" />
            </button>
          </div>
          <div className="column">
            <button className="piece-btn" onClick={() => onSelectPiece("q")}>
              <Piece color={promotion.color} piece="Q" width="45" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalPromotion;
