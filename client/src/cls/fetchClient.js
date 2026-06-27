const FETCH_ATTEMPT_COOLDOWN_MS = 1000 * 60 * 5; // 5 seconds
const FETCH_COOLDOWN_MS = 1000 * 60 * 15; // 15 minutes

class FetchClient {
  static PAGE_LOADED_EPOCH_MS = new Date().getTime();

  static lastMetadataFetchAttempt = null;
  static lastMetadataFetch = null;
  static isFetchingMetadata = false;

  static async onChessGameRender() {
    if (isFetchingMetadata) return; // Prevents overlaps in requests

    const isFetchedRecently =
      lastMetadataFetch !== null &&
      new Date() - lastMetadataFetch.getTime() < FETCH_COOLDOWN_MS;
    const isAttemptedRecently =
      lastMetadataFetchAttempt !== null &&
      new Date() - lastMetadataFetchAttempt.getTime() <
        FETCH_ATTEMPT_COOLDOWN_MS;

    if (!isFetchedRecently && !isAttemptedRecently) {
      isFetchingMetadata = true;
      lastMetadataFetchAttempt = new Date();
      const metadata = await EventHandler._tryBackendGet("/metadata");
      isFetchingMetadata = false;

      if (metadata) {
        lastMetadataFetch = new Date();

        const updated = new Date(metadata.updated);
        if (updated.getTime() >= PAGE_LOADED_EPOCH_MS) window.location.reload();
      }
    }
  }

  static async _tryBackendGet(endpoint) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}${endpoint}`
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
