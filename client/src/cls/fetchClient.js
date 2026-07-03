const FETCH_ATTEMPT_COOLDOWN_MS = 1000 * 5; // 5 seconds
const FETCH_COOLDOWN_MS = 1000 * 60 * 15; // 15 minutes

const INTERVAL_MS = 1000 * 15; // 15 seconds

class FetchClient {
  static PAGE_LOADED = new Date();

  static intervalId = null;

  static postEvents = [];

  static lastMetadataFetchAttempt = null;
  static lastMetadataFetch = null;
  static isFetchingMetadata = false;

  static async onChessStudyMounted() {
    if (FetchClient.intervalId === null) {
      FetchClient.intervalId = setInterval(FetchClient.onInterval, INTERVAL_MS);
    }
  }

  static async onInterval() {
    if (postEvents.length === 0) return;

    // TODO: Send events via POST request to backend
  }

  static async onChessGameRender() {
    if (FetchClient.isFetchingMetadata) return; // Prevents overlaps in requests

    const isFetchedRecently =
      FetchClient.lastMetadataFetch !== null &&
      new Date().getTime() - FetchClient.lastMetadataFetch.getTime() <
        FETCH_COOLDOWN_MS;
    const isAttemptedRecently =
      FetchClient.lastMetadataFetchAttempt !== null &&
      new Date().getTime() - FetchClient.lastMetadataFetchAttempt.getTime() <
        FETCH_ATTEMPT_COOLDOWN_MS;

    if (!isFetchedRecently && !isAttemptedRecently) {
      FetchClient.isFetchingMetadata = true;
      FetchClient.lastMetadataFetchAttempt = new Date();
      const metadata = await FetchClient._tryBackendGet("/metadata");
      FetchClient.isFetchingMetadata = false;

      if (metadata) {
        console.log("Fetched up-to-date metadata from backend.");
        FetchClient.lastMetadataFetch = new Date();

        const updated = new Date(metadata.data.updated);
        if (updated > new Date()) {
          // Sense check to prevent perma-reloading if a future date is received
          console.log(
            "The 'updated' value received from the backend is in the future; disregarding."
          );
          return;
        }

        if (updated.getTime() > FetchClient.PAGE_LOADED.getTime())
          window.location.reload();
      }
    }
  }

  static async _tryBackendGet(endpoint) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE}${endpoint}`
      );

      if (response.status === 200) {
        return await response.json();
      } else {
        throw new Error(`unexpected response status ${response.status}`);
      }
    } catch (err) {
      console.log("GET request to backend failed:", err);
      return false;
    }
  }
}

export default FetchClient;
