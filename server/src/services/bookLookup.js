const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

// Safe Google Books cover lookup for future item flows.
async function fetchBookCover(title, authors = []) {
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) return "";

  const cleanAuthors = Array.isArray(authors) ? authors.filter(Boolean) : [];
  const firstAuthor = cleanAuthors.length ? String(cleanAuthors[0]).trim() : "";

  const buildQuery = (step) => {
    if (step === "a" && firstAuthor) {
      return `intitle:"${cleanTitle}" inauthor:"${firstAuthor}"`;
    }

    if (step === "b") {
      return `intitle:"${cleanTitle}"`;
    }

    return cleanTitle;
  };

  const getFirstCover = (items = []) => {
    for (const item of items) {
      const imageUrl =
        item?.volumeInfo?.imageLinks?.thumbnail ||
        item?.volumeInfo?.imageLinks?.smallThumbnail;

      if (!imageUrl) continue;

      return imageUrl.startsWith("http://")
        ? imageUrl.replace(/^http:\/\//, "https://")
        : imageUrl;
    }

    return "";
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const steps = ["a", "b", "c"];

    for (const step of steps) {
      const query = buildQuery(step);
      const params = new URLSearchParams({
        q: query,
        maxResults: "5",
        printType: "books",
        fields: "items(volumeInfo(imageLinks))",
      });

      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      if (apiKey) {
        params.set("key", apiKey);
      }

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        console.warn(`Book cover lookup: status ${response.status} on query step ${step}`);

        if (response.status === 429 || response.status === 403) {
          break;
        }

        continue;
      }

      const data = await response.json();
      const imageUrl = getFirstCover(Array.isArray(data?.items) ? data.items : []);
      if (imageUrl) {
        return imageUrl;
      }
    }

    console.warn(`Book cover lookup: no cover found for "${cleanTitle}"`);
    return "";
  } catch (err) {
    if (err?.name === "AbortError") {
      console.warn("Book cover lookup: timed out");
    } else {
      console.warn(err?.message || "Book cover lookup failed");
    }
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

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

module.exports = { lookupBookByQuery, fetchBookCover };