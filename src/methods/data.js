export function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeJson(destinationData, addedData, depthBreadcrumb = null) {
  depthBreadcrumb = depthBreadcrumb ?? [];

  for (const addedKey in addedData) {
    if (addedKey in destinationData) {
      const destinationEntry = destinationData[addedKey];
      const addedEntry = addedData[addedKey];

      if (destinationEntry === addedEntry) {
        continue;
      } else if (isObject(destinationEntry) && isObject(addedEntry)) {
        mergeJson(
          destinationEntry,
          addedEntry,
          depthBreadcrumb.concat([addedKey])
        );
      } else {
        throw new Error(
          `Unable to merge JSON objects; a shared key has conflicting values. Breadcrumb: ${depthBreadcrumb.concat(
            [addedKey]
          )}`
        );
      }
    } else {
      destinationData[addedKey] = addedData[addedKey];
    }
  }
}

export function compileJsonFiles(folder_context) {
  const result = {};

  // folder_context must be a require.context object containing only entries for JSON files,
  // as would be returned from (for example) `require.context(<folder path>, true, /\.json$/)`
  const filesDataList = folder_context
    .keys()
    .map((fileKey) => folder_context(fileKey));

  for (const jsonData of filesDataList) {
    mergeJson(result, jsonData);
  }

  return result;
}

// Calculate cutoff for what is considered 'recent'
const currentDate = new Date(); // Date used for cutoff will not change until page refresh
const recentDurationMs = 14 * (24 * 60 * 60 * 1000); // 2 weeks
const recentCutoff = new Date(currentDate.getTime() - recentDurationMs);
/*
 * Receives an object representing an entry of site content, and uses its 'created' and 'updated' properties
 * to determine whether the entry should be tagged as 'new' or (recently) 'updated
 */
export function tagEntryRecency(entry) {
  let result = null;

  if (entry["created"] && new Date(entry["created"]) >= recentCutoff)
    result = "NEW";
  // Updated takes priority over new, hence overwriting 'created' if 'updated' is present
  if (entry["updated"] && new Date(entry["updated"]) >= recentCutoff)
    result = "UPDATED";

  return result;
}
