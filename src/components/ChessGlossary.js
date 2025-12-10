import React, { useMemo, useRef, useEffect } from "react";
import { useChessStudyContext } from "./ChessStudyProvider";
import glossary from "../data/glossary.json";
import "./ChessGlossary.css";

const GLOSSARY_DIFFICULTY_LOOKUP = {
  0: "Definitions",
  1: "Beginner Topics",
  2: "Novice Topics",
  3: "Intermediate Topics",
};

function ChessGlossary() {
  const {
    glossaryId,
    setGlossaryTopic,
    generateRichDescription,
    isGlossaryMarginHidden,
    setIsGlossaryMarginHidden,
  } = useChessStudyContext();

  // Scroll the glossary entry to its start (instantly) each time it changes
  // Added to fix an intermittent bug in which a newly rendered entry is already partially scrolled down
  const descriptionRef = useRef(null);
  useEffect(() => descriptionRef?.current?.scrollTo({ top: 0 }), [glossaryId]);

  // Scroll the selected title to the top of the margin each time it or the margin changes
  const marginRef = useRef(null);
  const selectedTitleRef = useRef(null);
  useEffect(() => {
    if (!selectedTitleRef?.current) return;

    marginRef?.current?.scrollTo({
      top: selectedTitleRef.current.offsetTop,
      behavior: "smooth",
    });
  }, [glossaryId, isGlossaryMarginHidden]);

  const orderedTitles = useMemo(() => {
    const result = [];
    for (const difficultyId in GLOSSARY_DIFFICULTY_LOOKUP) {
      result[difficultyId] = [];
    }

    // Categorizes titles by broad difficulty level, and orders them granularly within those categories
    const sortedGlossaryKeys = Object.keys(glossary).sort(
      (firstId, secondId) => {
        return (
          glossary[firstId]["difficulty"] - glossary[secondId]["difficulty"]
        );
      }
    );
    for (const currentId of sortedGlossaryKeys) {
      const topicData = glossary[currentId];
      const topicDifficultyCategory = Math.floor(topicData["difficulty"]);
      const categoryArray = result[topicDifficultyCategory];

      categoryArray.push([topicData["title"] ?? currentId, currentId]);
    }

    return result;
  });

  // Generate JSX for clickable titles, and their respective difficulty section headers
  const marginTitles = [];

  // Difficulty section header
  for (const [difficultyId, difficultyArray] of orderedTitles.entries()) {
    marginTitles.push(
      <div className="mini-header">
        {GLOSSARY_DIFFICULTY_LOOKUP[difficultyId]}
      </div>
    );

    // Titles for this difficulty section
    for (const [
      index,
      [currentTitle, currentId],
    ] of difficultyArray.entries()) {
      const isLastMarginItem =
        difficultyId == orderedTitles.length - 1 &&
        index == difficultyArray.length - 1;
      const isSelectedTitle = glossaryId == currentId;

      marginTitles.push(
        <div
          className={
            "clickable-box glossary-margin-title" +
            (isSelectedTitle ? " glossary-margin-title-selected" : "")
          }
          style={
            isLastMarginItem
              ? {
                  borderRadius:
                    "0 0 0 calc(var(--border-radius-large) - var(--border-width-small))",
                }
              : {}
          }
          {...(isSelectedTitle
            ? { ref: selectedTitleRef }
            : { onMouseDown: () => setGlossaryTopic(currentId) })}
        >
          {currentTitle}
        </div>
      );
    }
  }

  // Convert glossary entry data into JSX elements
  let descriptionJsx;
  let entryData = glossary[glossaryId] ?? {};

  // No glossary entry selected
  if (glossaryId === null) {
    descriptionJsx = (
      <div className="faint-text">
        <i>Select a topic from the margin to the left.</i>
      </div>
    );
  }
  // No description found for glossary entry
  else if (!("description" in entryData)) {
    descriptionJsx = (
      <div className="faint-text">
        <i>No information found for this entry.</i>
      </div>
    );
  }
  // Glossary entry has a description
  else {
    descriptionJsx = generateRichDescription(entryData["description"]);
  }

  return (
    <div
      style={{
        maxHeight: "360px",
        display: "flex",
      }}
    >
      {/* Margin */}
      {isGlossaryMarginHidden ? null : (
        <div
          ref={marginRef}
          className="y-scrollbar"
          style={{
            minWidth: "180px",
            maxWidth: "180px",
            borderRight:
              "var(--border-width-small) solid color-mix(in srgb, var(--glossary-accent-color) 100%, var(--translucent-mixin))",
          }}
        >
          {marginTitles}
        </div>
      )}
      {/* Main Section */}
      <div
        style={{
          display: "flex",
          flex: "1", // Fill the remaining width in the glossary segment
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* Header Bar */}
        {
          <div
            style={{
              height: "26px",

              display: "flex",
              justifyContent: "space-between",

              borderBottom:
                "var(--border-width-small) solid var(--light-shade-color)",
            }}
          >
            {/* Left side of header bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "left",
              }}
            >
              {/* Toggle Glossary Margin Button */}
              <div
                onMouseDown={() =>
                  setIsGlossaryMarginHidden(!isGlossaryMarginHidden)
                }
                className="faint-text clickable-box centred-content"
                style={{
                  height: "100%",
                  aspectRatio: "1 / 1",
                  userSelect: "none",

                  ...(isGlossaryMarginHidden && {
                    borderRadius:
                      "calc(var(--border-radius-large) - var(--border-width-small)) 0 0 0",
                  }),
                }}
              >
                {isGlossaryMarginHidden ? (
                  <span style={{ marginLeft: "3px", marginTop: "1px" }}>
                    {"▶"}
                  </span>
                ) : (
                  <span style={{ marginLeft: "-3px", marginTop: "1px" }}>
                    {"◀"}
                  </span>
                )}
              </div>
            </div>
            {/* Right side of header bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "right",
              }}
            >
              {/* Clear Glossary ID Button */}
              {glossaryId === null ? null : (
                <div
                  className="faint-text clickable-box centred-content"
                  style={{
                    height: "100%",
                    aspectRatio: "1 / 1",
                    userSelect: "none",
                    borderRadius:
                      "0 calc(var(--border-radius-large) - var(--border-width-small)) 0 0",
                  }}
                  onMouseDown={() => setGlossaryTopic(null)}
                >
                  {"✖"}
                </div>
              )}
            </div>
          </div>
        }
        {/* Description Box */}
        <div
          style={{
            display: "flex",
            flex: "1",
            // Ensures that this flex item shrinks to fit the available space and the scrollbar appears correctly
            // Necessitated by the fixed height sibling
            minHeight: "0",

            padding: "var(--spacing-medium)",
          }}
        >
          <div
            ref={descriptionRef}
            className="y-scrollbar"
            style={{ padding: "var(--glossary-section-padding)" }}
          >
            {descriptionJsx}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChessGlossary;
