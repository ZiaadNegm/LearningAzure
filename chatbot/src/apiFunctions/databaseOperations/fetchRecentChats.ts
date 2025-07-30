import type { GETUserData } from "../../types/chat";
const fetchRawResponse = async (oid: string) => {
  const url = `/api/userMetaData/fetch/${encodeURIComponent(oid)}`;
  return fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
};

const validateAndExtract = async (rawResponse: Response) => {
  if (!rawResponse.ok) {
    throw new Error(
      `Fetch request to ${rawResponse.url} went wrong\n
      RawResponse is not ok HTTP ${rawResponse.status} : ${rawResponse.statusText}`
    );
  }
  const rawText = await rawResponse.text(); // Ensure data arrives
  if (!rawText.trim()) {
    throw new Error(`RawResponse contained no text`);
  }
  return rawText;
};

const filterAndCheckResponse = (unfilteredResponse: string) => {
  let data: GETUserData;
  try {
    data = JSON.parse(unfilteredResponse);

    // Check if response has the expected structure
    if (typeof data !== "object" || data === null) {
      throw new Error(
        `Invalid response format: expected object, got ${typeof data}`
      );
    }

    if (!data.oid) {
      throw new Error(`Missing oid in response: ${JSON.stringify(data)}`);
    }

    // metaData can be undefined, null, or an empty array - all are valid
    // We'll ensure it's always an array for consistency
    if (!Array.isArray(data.metaData)) {
      data.metaData = []; // Default to empty array if missing/invalid
    }

    return data;
  } catch (e) {
    console.error("JSON parse error:", e);
    console.error("Raw text failed to parse:", unfilteredResponse);
    throw e;
  }
};

export const fetchRecentChats = async (oid: string | null) => {
  if (!oid) {
    throw new Error("FetchRecentChats requires a non-null oid");
  }
  try {
    const rawResponse = await fetchRawResponse(oid); // Await ensures headers arrive.
    const validatedResponse = await validateAndExtract(rawResponse);
    const filteredResponse = filterAndCheckResponse(validatedResponse);

    const metaDataList = filteredResponse.metaData || []; // Ensure we always return an array
    return metaDataList;
  } catch (e) {
    console.error("fetchRecentChats error:", e);

    // Return empty array instead of throwing for UI resilience
    // The UI can handle empty arrays gracefully
    if (e instanceof Error) {
      console.error("Error details:", e.message);
    }

    // For now, re-throw to maintain current behavior
    // but you might want to return [] for better UX
    throw e;
  }
};
