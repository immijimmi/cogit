import React from "react";
import { ChessStudyProvider } from "./ChessStudyProvider";
import ChessBoard from "./ChessBoard";
import ChessGlossary from "./ChessGlossary";
import ChessMovesCommentary from "./ChessMovesCommentary";
import ChessNextMoveOptions from "./ChessNextMoveOptions";
import "./ChessStudy.css";

function ChessStudy() {
  return (
    <div className="study-container">
      <ChessStudyProvider>
        <div className="study-subcolumn" style={{ maxWidth: "450px" }}>
          <div className="study-segment chessboard-container">
            <ChessBoard />
          </div>
          <div className="study-segment nextmoves-container">
            <ChessNextMoveOptions />
          </div>
        </div>
        <div className="study-subcolumn" style={{ maxWidth: "750px" }}>
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
