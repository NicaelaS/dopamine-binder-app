const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

async function lookupBookByQuery(query) {
  if (!query || !String(query).trim()) return [];

  const searchTerm = encodeURIComponent(String(query).trim());

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=10`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Books API request failed: ${response.status} ${text}`);
  }

  const payload = await response.json();
  const rawVolumes = Array.isArray(payload.items) ? payload.items : [];

  return rawVolumes
    .map((volume) => {
      const info = volume.volumeInfo || {};
      const isbn =
        (info.industryIdentifiers || []).find((id) => id.type === "ISBN_13")?.identifier ||
        (info.industryIdentifiers || []).find((id) => id.type === "ISBN_10")?.identifier ||
        "";

      return {
        title: info.title || "",
        type: "BOOK",
        bookDetails: {
          authors: Array.isArray(info.authors) ? info.authors : [],
          isbn,
          publisher: info.publisher || "",
          publishedDate: info.publishedDate || "",
          referenceCoverUrl: info.imageLinks?.thumbnail || "",
          condition: "",
          format: "",
          signed: false,
          printing: "",
        },
      };
    })
    .filter((item) => item.title);
}

module.exports = { lookupBookByQuery };