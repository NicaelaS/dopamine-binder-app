const TCGAPI_KEY = process.env.TCGAPI_KEY;

async function lookupCardByQuery(query) {
  if (!query || !String(query).trim()) return [];

  const searchTerm = encodeURIComponent(String(query).trim());

  const response = await fetch(
    `https://api.tcgapi.dev/v2/public/cards?search=${searchTerm}`,
    {
      headers: {
        Accept: "application/json",
        ...(TCGAPI_KEY ? { Authorization: `Bearer ${TCGAPI_KEY}` } : {}),
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TCG API request failed: ${response.status} ${text}`);
  }

  const payload = await response.json();
  const rawCards = Array.isArray(payload) ? payload : payload.data || [];

  return rawCards
    .map((card) => ({
      title: card.name || card.title || "",
      type: "TCG",
      cardDetails: {
        game: "pokemon",
        set: card.set?.name || card.set || "",
        cardNumber: card.number || "",
        rarity: card.rarity || "",
        referenceImageUrl:
          card.images?.small ||
          card.images?.large ||
          card.image ||
          card.imageUrl ||
          "",
        marketPrice: Number(card.marketPrice || 0) || 0,
        condition: "",
        graded: false,
        gradingCompany: null,
        grade: null,
        variant: "none",
        language: "English",
        edition: null,
      },
    }))
    .filter((item) => item.title);
}

module.exports = { lookupCardByQuery };