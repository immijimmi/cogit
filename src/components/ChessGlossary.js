import React, { useMemo } from "react";
import { useChessStudyContext } from "./ChessStudyProvider";
import glossary from "../data/glossary.json";
import "./ChessGlossary.css";

function ChessGlossary() {
  const { glossaryId, setGlossaryId, generateRichDescriptionElement } =
    useChessStudyContext();

  const orderedTitles = useMemo(() => {
    const result = [];
    for (const currentId of Object.keys(glossary).sort()) {
      result.push([glossary[currentId]["title"] ?? currentId, currentId]);
    }
    return result;
  });

  // Generate JSX for clickable titles
  const marginTitles = [];

  for (const [currentTitle, currentId] of orderedTitles) {
    marginTitles.push(
      <div
        className={
          "clickable-div glossary-margin-title" +
          (glossaryId == currentId ? " glossary-margin-title-selected" : "")
        }
        onMouseDown={() => setGlossaryId(currentId)}
      >
        {currentTitle}
      </div>
    );
  }

  // Convert glossary entry data into JSX elements
  let entryData = glossary[glossaryId] ?? {};
  const descriptionElements = [];

  // No description found for glossary entry
  if (!("description" in entryData)) {
    descriptionElements.push(
      <div className="faint-text">
        <i>No information found for this entry.</i>
      </div>
    );
  }
  // Glossary entry has a description
  else {
    for (const descriptionFragment of entryData["description"]) {
      descriptionElements.push(
        generateRichDescriptionElement(descriptionFragment)
      );
    }
  }

  return (
    <div
      style={{
        maxHeight: "400px",
        maxWidth: "800px",
        display: "flex",
      }}
    >
      <div
        className="y-scrollbar"
        style={{
          maxWidth: "180px",
          borderRight:
            "var(--border-width-small) solid color-mix(in srgb, var(--glossary-accent-color) 100%, var(--translucent-mixin))",
        }}
      >
        {marginTitles}
      </div>
      <div style={{ padding: "var(--spacing-medium)" }} className="y-scrollbar">
        {descriptionElements}
      </div>
    </div>
  );
}

export default ChessGlossary;
