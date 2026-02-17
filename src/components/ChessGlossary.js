import React, { useMemo, useRef, useEffect } from "react";
import { useChessStudyContext } from "./providers/ChessStudyProvider";
import glossary from "../data/glossary.json";
import { ReactComponent as UnhideIcon } from "../res/Right Triangle (Faint).svg";
import { ReactComponent as HideIcon } from "../res/Left Triangle (Faint).svg";
import { ReactComponent as CloseIcon } from "../res/X (Faint).svg";
import "./ChessGlossary.css";

const GLOSSARY_CATEGORY_LOOKUP = {
  0: "Definitions",
  1: "Beginner Topics",
  2: "Novice Topics",
  3: "Intermediate Topics",
  4: "Miscellaneous",
};

const INNER_RADIUS_CALC =
  "calc(var(--border-radius-large) - var(--border-width-small))";

function ChessGlossary() {
  const {
    glossaryId,
    setGlossaryTopic,
    processDescriptionData,
    isGlossaryMarginHidden,
    setIsGlossaryMarginHidden,
  } = useChessStudyContext();

  // Scroll the glossary container into view each time the glossary topic changes to a non-null value
  const containerRef = useRef(null);
  useEffect(() => {
    if (!glossaryId) return;

    containerRef?.current?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [glossaryId]);

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

  /*
   * Scroll the glossary entry to its start (instantly) each time it changes.
   * Added to fix an intermittent bug in which a newly rendered entry is already partially scrolled down
   */
  const descriptionRef = useRef(null);
  useEffect(() => descriptionRef?.current?.scrollTo({ top: 0 }), [glossaryId]);

  // Organise titles by category and order
  const orderedTitles = useMemo(() => {
    const result = [];
    for (const categoryId in GLOSSARY_CATEGORY_LOOKUP) {
      result[categoryId] = [];
    }

    // Categorizes titles and orders them granularly within those categories
    const sortedGlossaryKeys = Object.keys(glossary).sort(
      (firstId, secondId) => {
        return glossary[firstId]["order"] - glossary[secondId]["order"];
      }
    );
    for (const currentId of sortedGlossaryKeys) {
      const topicData = glossary[currentId];
      const topicCategory = Math.floor(topicData["order"]);
      const categoryArray = result[topicCategory];

      categoryArray.push([topicData["title"] ?? currentId, currentId]);
    }

    return result;
  });

  // Generate JSX for clickable titles, and their respective category headers
  const marginTitles = [];

  // Category header
  for (const [categoryId, categoryArray] of orderedTitles.entries()) {
    marginTitles.push(
      <div
        key={`glossary_title_category_${categoryId}`}
        className="mini-header"
      >
        {GLOSSARY_CATEGORY_LOOKUP[categoryId]}
      </div>
    );

    // Titles for this category
    for (const [index, [currentTitle, currentId]] of categoryArray.entries()) {
      const isSelectedTitle = glossaryId === currentId;

      marginTitles.push(
        <div
          key={`glossary_title_${currentId}`}
          className={
            "clickable-box glossary-margin-title" +
            (isSelectedTitle ? " glossary-margin-title-selected" : "")
          }
          {...(isSelectedTitle
            ? { ref: selectedTitleRef }
            : {
                onMouseDown: (event) =>
                  event.button === 0 && setGlossaryTopic(currentId),
              })}
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
      <div className="minor-text">
        <i>Select a topic from the margin to the left.</i>
      </div>
    );
  }
  // No description found for glossary entry
  else if (!("description" in entryData)) {
    descriptionJsx = (
      <div className="minor-text">
        <i>No information found for this entry.</i>
      </div>
    );
  }
  // Glossary entry has a description
  else {
    descriptionJsx = processDescriptionData(entryData["description"]);
  }

  return (
    <div
      ref={containerRef}
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
            borderRadius: `${INNER_RADIUS_CALC} 0 0 ${INNER_RADIUS_CALC}`,
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
              height: "var(--line-height-medium)",

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
                onMouseDown={(event) =>
                  event.button === 0 &&
                  setIsGlossaryMarginHidden(!isGlossaryMarginHidden)
                }
                className="clickable-box centred-content"
                style={{
                  height: "100%",
                  aspectRatio: "1 / 1",
                  userSelect: "none",

                  ...(isGlossaryMarginHidden && {
                    borderRadius: `${INNER_RADIUS_CALC} 0 0 0`,
                  }),
                }}
              >
                {isGlossaryMarginHidden ? (
                  <UnhideIcon
                    style={{
                      height: "var(--inline-icon-height-very-small)",
                      width: "var(--inline-icon-height-very-small)",

                      marginLeft: "2px",
                    }}
                  />
                ) : (
                  <HideIcon
                    style={{
                      height: "var(--inline-icon-height-very-small)",
                      width: "var(--inline-icon-height-very-small)",

                      marginLeft: "-2px",
                    }}
                  />
                )}
              </div>
            </div>
            {/* Centre of header bar */}
            <div
              style={{
                display: "flex",
                flex: "1",
                justifyContent: "space-between",
              }}
            >
              {glossaryId && (
                <div className="section-header-2" style={{ flex: "1" }}>
                  {entryData["title"] ?? glossaryId}
                </div>
              )}
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
                  className="clickable-box centred-content"
                  style={{
                    height: "100%",
                    aspectRatio: "1 / 1",
                    userSelect: "none",
                    borderRadius: `0 ${INNER_RADIUS_CALC} 0 0`,
                  }}
                  onMouseDown={(event) =>
                    event.button === 0 && setGlossaryTopic(null)
                  }
                >
                  <CloseIcon
                    style={{
                      height: "var(--inline-icon-height-very-small)",
                      width: "var(--inline-icon-height-very-small)",
                    }}
                  />
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
