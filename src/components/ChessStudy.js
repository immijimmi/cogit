import React from "react";
import { ChessStudyProvider } from "./providers/ChessStudyProvider";
import ChessBoard from "./ChessBoard";
import ChessGlossary from "./ChessGlossary";
import ChessMovesCommentary from "./ChessMovesCommentary";
import ChessNextMoveOptions from "./ChessNextMoveOptions";
import "./ChessStudy.css";

function ChessStudy(props) {
  return (
    <div className="study-container" style={props.style}>
      <ChessStudyProvider>
        <div className="study-subcolumn" style={{ maxWidth: "500px" }}>
          <div className="study-segment chessboard-container">
            <ChessBoard />
          </div>
          <div className="study-segment nextmoves-container">
            <ChessNextMoveOptions />
          </div>
        </div>
        <div className="study-subcolumn" style={{ maxWidth: "900px" }}>
          <div className="study-segment commentary-container">
            <ChessMovesCommentary />
          </div>
          <div className="study-segment glossary-container">
            <ChessGlossary />
          </div>
        </div>
      </ChessStudyProvider>
    </div>
  );
}

export default ChessStudy;
