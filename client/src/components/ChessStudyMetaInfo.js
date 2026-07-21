import React from "react";
import { useChessStudyContext } from "./providers/ChessStudyProvider";

function ChessStudyMetaInfo() {
  const { setGlossaryTopic, isOfflineMode } = useChessStudyContext();

  return (
    <div
      style={{
        minHeight: "24px",
        display: "flex",
      }}
    >
      {isOfflineMode && <div className="meta-flag">{"Offline Mode"}</div>}
      <div className="meta-info-centre-bar minor-text">
        <span
          title="Topic: Welcome"
          className="minor-clickable-text"
          style={{ whiteSpace: "nowrap" }}
          onClick={() => setGlossaryTopic("welcome")}
        >
          {"What is all this?"}
        </span>
        <span style={{ whiteSpace: "preserve nowrap" }}>{"  •  "}</span>
        <span
          title="Topic: Privacy Notice"
          className="minor-clickable-text"
          onClick={() => setGlossaryTopic("privacy")}
        >
          {"Privacy"}
        </span>
        <span style={{ whiteSpace: "preserve nowrap" }}>{"  •  "}</span>
        <span
          title="Topic: Contact"
          className="minor-clickable-text"
          onClick={() => setGlossaryTopic("contact")}
        >
          {"Contact"}
        </span>
        <span style={{ whiteSpace: "preserve nowrap" }}>{"  •  "}</span>
        <span style={{ whiteSpace: "nowrap" }}>{"© 2025 Imran Hamid"}</span>
      </div>
    </div>
  );
}

export default ChessStudyMetaInfo;
