import { useEffect, useState } from "react";
import { API_BASE_URL, createBinder, fetchBinders } from "../services/api";

const binderColorOptions = [
  { value: "white", label: "White" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
  { value: "yellow", label: "Yellow" },
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "black", label: "Black" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
];

const initialForm = {
  title: "",
  type: "TCG",
  quantity: 1,
  notes: "",
  tags: "",
  photos: [],
  favorite: false,
  binderId: "",
  cardDetails: {
    game: "pokemon",
    set: "",
    cardNumber: "",
    rarity: "",
    referenceImageUrl: "",
    marketPrice: 0,
    condition: "",
    graded: false,
    gradingCompany: "",
    grade: "",
    variant: "none",
    language: "English",
    edition: "",
  },
  bookDetails: {
    authors: [],
    isbn: "",
    publisher: "",
    publishedDate: "",
    referenceCoverUrl: "",
    condition: "",
    format: "",
    signed: false,
    printing: "",
  },
};

function AddItemForm({ binderId: propBinderId, folderId }) {
  const resolvedBinderId = propBinderId ?? folderId ?? "";

  const [form, setForm] = useState({
    ...initialForm,
    binderId: resolvedBinderId,
  });

  const [binders, setBinders] = useState([]);
  const [loadingBinders, setLoadingBinders] = useState(false);
  const [creatingBinder, setCreatingBinder] = useState(false);
  const [newBinderName, setNewBinderName] = useState("");
  const [newBinderColor, setNewBinderColor] = useState("blue");
  const [searching, setSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadBinders = async () => {
      setLoadingBinders(true);
      try {
        const data = await fetchBinders();
        setBinders(data);

        if (!resolvedBinderId && data.length > 0) {
          setForm((prev) => ({ ...prev, binderId: data[0]._id }));
        }
      } catch (err) {
        console.error("Failed to load binders:", err);
      } finally {
        setLoadingBinders(false);
      }
    };

    loadBinders();
  }, [resolvedBinderId]);

  const setValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setDetailValue = (group, field, value) => {
    setForm((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value,
      },
    }));
  };

  const handleTypeChange = (nextType) => {
    setForm((prev) => ({ ...prev, type: nextType }));
  };

  const handleCreateBinder = async () => {
    if (!newBinderName.trim()) {
      setError("Enter a binder name.");
      return;
    }

    setCreatingBinder(true);
    setError("");

    try {
      const newBinder = await createBinder({
        name: newBinderName.trim(),
        color: newBinderColor,
      });

      setBinders((prev) => [newBinder, ...prev]);
      setForm((prev) => ({ ...prev, binderId: newBinder._id }));
      setNewBinderName("");
      setNewBinderColor("blue");
      setSuccessMessage(`Binder "${newBinder.name}" created.`);
    } catch (err) {
      setError(err.message || "Failed to create binder.");
      setSuccessMessage("");
    } finally {
      setCreatingBinder(false);
    }
  };

  const handleSearch = async () => {
    if (!form.title.trim()) {
      setError("Enter a title first.");
      return;
    }

    setSearching(true);
    setError("");

    try {
      const endpoint =
        form.type === "TCG"
          ? `/api/search/tcg?query=${encodeURIComponent(form.title)}`
          : `/api/search/books?query=${encodeURIComponent(form.title)}`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Search failed.");

      const data = await response.json();
      const result = data.results?.[0];

      if (!result) {
        setError("No results found.");
        return;
      }

      if (form.type === "TCG") {
        setForm((prev) => ({
          ...prev,
          title: result.title || prev.title,
          cardDetails: {
            ...prev.cardDetails,
            ...result.cardDetails,
          },
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          title: result.title || prev.title,
          bookDetails: {
            ...prev.bookDetails,
            ...result.bookDetails,
          },
        }));
      }
    } catch (err) {
      setError(err.message || "Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const selectedBinderId = form.binderId || resolvedBinderId;

    if (!selectedBinderId) {
      setError("Select or create a binder before creating an item.");
      setSuccessMessage("");
      return;
    }

    if (!form.title.trim()) {
      setError("Title is required.");
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        ...form,
        binderId: selectedBinderId,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        quantity: Number(form.quantity || 1),
        notes: form.notes || "",
        photos: Array.isArray(form.photos) ? form.photos : [],
        favorite: Boolean(form.favorite),
      };

      if (form.type === "TCG") {
        delete payload.bookDetails;
      } else {
        delete payload.cardDetails;
      }

      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create item.");
      }

      setSuccessMessage(`${payload.title} saved successfully.`);
      setForm((prev) => ({
        ...initialForm,
        type: prev.type,
        binderId: selectedBinderId,
      }));
    } catch (err) {
      setError(err.message || "Failed to create item.");
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          <input
            type="radio"
            checked={form.type === "TCG"}
            onChange={() => handleTypeChange("TCG")}
          />
          TCG
        </label>

        <label>
          <input
            type="radio"
            checked={form.type === "BOOK"}
            onChange={() => handleTypeChange("BOOK")}
          />
          Book
        </label>
      </div>

      <div
        style={{
          marginBottom: "20px",
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          Select Binder
        </label>

        {loadingBinders ? (
          <p>Loading binders...</p>
        ) : binders.length > 0 ? (
          <select
            value={form.binderId || ""}
            onChange={(e) => setValue("binderId", e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
          >
            <option value="">-- Choose a binder --</option>
            {binders.map((binder) => (
              <option key={binder._id} value={binder._id}>
                {binder.name}
              </option>
            ))}
          </select>
        ) : (
          <p style={{ color: "#666" }}>No binders yet. Create one below.</p>
        )}

        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #ddd",
          }}
        >
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Or create a new binder
          </label>

          <input
            type="text"
            placeholder="Binder name"
            value={newBinderName}
            onChange={(e) => setNewBinderName(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
            disabled={creatingBinder}
          />

          <select
            value={newBinderColor}
            onChange={(e) => setNewBinderColor(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
            disabled={creatingBinder}
          >
            {binderColorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCreateBinder}
            disabled={creatingBinder || !newBinderName.trim()}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#0969da",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: creatingBinder || !newBinderName.trim() ? "not-allowed" : "pointer",
            }}
          >
            {creatingBinder ? "Creating..." : "Create Binder"}
          </button>
        </div>
      </div>

      {!form.binderId && (
        <p style={{ color: "#b42318", marginBottom: "12px" }}>
          Select or create a binder before creating an item.
        </p>
      )}

      <div>
        <label>Title</label>
        <input
          value={form.title}
          onChange={(e) => setValue("title", e.target.value)}
        />
      </div>

      <button type="button" onClick={handleSearch} disabled={searching}>
        {searching ? "Searching..." : "Search"}
      </button>

      {error && <p style={{ color: "#b42318" }}>{error}</p>}
      {successMessage && <p style={{ color: "#067647" }}>{successMessage}</p>}

      <div>
        <label>Quantity</label>
        <input
          type="number"
          min="1"
          value={form.quantity}
          onChange={(e) => setValue("quantity", Number(e.target.value))}
        />
      </div>

      <div>
        <label>Tags</label>
        <input
          value={form.tags}
          onChange={(e) => setValue("tags", e.target.value)}
        />
      </div>

      <div>
        <label>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setValue("notes", e.target.value)}
        />
      </div>

      {form.type === "TCG" && (
        <div>
          <h3>Card Details</h3>

          <label>Game</label>
          <select
            value={form.cardDetails.game}
            onChange={(e) => setDetailValue("cardDetails", "game", e.target.value)}
          >
            <option value="pokemon">Pokemon</option>
            <option value="onepiece">One Piece</option>
            <option value="magic">Magic</option>
          </select>

          <label>Set</label>
          <input
            value={form.cardDetails.set}
            onChange={(e) => setDetailValue("cardDetails", "set", e.target.value)}
          />

          <label>Card Number</label>
          <input
            value={form.cardDetails.cardNumber}
            onChange={(e) =>
              setDetailValue("cardDetails", "cardNumber", e.target.value)
            }
          />

          <label>Rarity</label>
          <input
            value={form.cardDetails.rarity}
            onChange={(e) => setDetailValue("cardDetails", "rarity", e.target.value)}
          />

          <label>Condition</label>
          <select
            value={form.cardDetails.condition}
            onChange={(e) =>
              setDetailValue("cardDetails", "condition", e.target.value)
            }
          >
            <option value="">Select</option>
            <option value="Mint">Mint</option>
            <option value="Near Mint">Near Mint</option>
            <option value="Lightly Played">Lightly Played</option>
            <option value="Moderately Played">Moderately Played</option>
            <option value="Heavily Played">Heavily Played</option>
            <option value="Damaged">Damaged</option>
          </select>

          <label>Graded</label>
          <input
            type="checkbox"
            checked={form.cardDetails.graded}
            onChange={(e) =>
              setDetailValue("cardDetails", "graded", e.target.checked)
            }
          />

          <label>Variant</label>
          <select
            value={form.cardDetails.variant}
            onChange={(e) =>
              setDetailValue("cardDetails", "variant", e.target.value)
            }
          >
            <option value="none">none</option>
            <option value="holo">holo</option>
            <option value="reverse holo">reverse holo</option>
            <option value="foil">foil</option>
            <option value="parallel">parallel</option>
          </select>

          <label>Language</label>
          <input
            value={form.cardDetails.language}
            onChange={(e) =>
              setDetailValue("cardDetails", "language", e.target.value)
            }
          />

          <label>Edition</label>
          <select
            value={form.cardDetails.edition || ""}
            onChange={(e) =>
              setDetailValue("cardDetails", "edition", e.target.value || null)
            }
          >
            <option value="">None</option>
            <option value="1st Edition">1st Edition</option>
            <option value="Unlimited">Unlimited</option>
          </select>
        </div>
      )}

      {form.type === "BOOK" && (
        <div>
          <h3>Book Details</h3>

          <label>Authors</label>
          <input
            value={form.bookDetails.authors.join(", ")}
            onChange={(e) =>
              setDetailValue(
                "bookDetails",
                "authors",
                e.target.value.split(",").map((v) => v.trim()).filter(Boolean)
              )
            }
          />

          <label>ISBN</label>
          <input
            value={form.bookDetails.isbn}
            onChange={(e) => setDetailValue("bookDetails", "isbn", e.target.value)}
          />

          <label>Publisher</label>
          <input
            value={form.bookDetails.publisher}
            onChange={(e) =>
              setDetailValue("bookDetails", "publisher", e.target.value)
            }
          />

          <label>Published Date</label>
          <input
            value={form.bookDetails.publishedDate}
            onChange={(e) =>
              setDetailValue("bookDetails", "publishedDate", e.target.value)
            }
          />

          <label>Condition</label>
          <select
            value={form.bookDetails.condition}
            onChange={(e) =>
              setDetailValue("bookDetails", "condition", e.target.value)
            }
          >
            <option value="">Select</option>
            <option value="Like New">Like New</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Acceptable">Acceptable</option>
            <option value="Poor">Poor</option>
          </select>

          <label>Format</label>
          <select
            value={form.bookDetails.format}
            onChange={(e) =>
              setDetailValue("bookDetails", "format", e.target.value)
            }
          >
            <option value="">Select</option>
            <option value="Hardcover">Hardcover</option>
            <option value="Paperback">Paperback</option>
            <option value="Mass Market">Mass Market</option>
            <option value="Other">Other</option>
          </select>

          <label>Signed</label>
          <input
            type="checkbox"
            checked={form.bookDetails.signed}
            onChange={(e) =>
              setDetailValue("bookDetails", "signed", e.target.checked)
            }
          />

          <label>Printing</label>
          <input
            value={form.bookDetails.printing}
            onChange={(e) =>
              setDetailValue("bookDetails", "printing", e.target.value)
            }
          />
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Item"}
      </button>
    </form>
  );
}

export default AddItemForm;