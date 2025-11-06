import React from "react";
import { ChessStudyProvider } from "./ChessStudyProvider";
import ChessBoard from "./ChessBoard";
import ChessMoveCommentary from "./ChessMoveCommentary";
import "./ChessStudy.css";

function ChessStudy() {
  return (
    <div className="study-container">
      <ChessStudyProvider>
        <div className="study-subcolumn">
          <div className="study-segment chessboard-container">
            <ChessBoard />
          </div>
          <div className="study-segment"></div>
        </div>
        <div className="study-subcolumn">
          <div className="study-segment">
            <ChessMoveCommentary />
          </div>
          <div className="study-segment glossary-container"></div>
        </div>
      </ChessStudyProvider>
    </div>
  );
}

export default ChessStudy;
