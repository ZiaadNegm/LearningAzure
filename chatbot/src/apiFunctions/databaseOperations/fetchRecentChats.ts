import type { GETUserData } from "../../types/chat";
const fetchRawResponse = async (oid: string) => {
  const url = `/api/userData/${encodeURIComponent(oid)}`;
  return fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
};

const validateAndExtract = async (rawResponse: Response) => {
  if (!rawResponse.ok) {
    throw new Error(
      `RawResponse is not ok HTTP ${rawResponse.status} : ${rawResponse.statusText}`
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
    if (!data.metaData) {
      throw new Error(`No meta data given in response ${JSON.stringify(data)}`);
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
    const rawResponse = await fetchRawResponse(oid); // Await ensures headers arive.
    const validatedResponse = await validateAndExtract(rawResponse);
    const filteredResponse = filterAndCheckResponse(validatedResponse);

    const metaDataList = filteredResponse.metaData;
    return metaDataList;
  } catch (e) {
    console.error("fetchRecentChats error:", e);
    throw e;
  }
};
