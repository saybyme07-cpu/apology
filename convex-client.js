// SayByMe – Convex Database Client (Dedicated Apologies Table)
const CONVEX_CLOUD_URL = "https://brazen-stoat-999.ap-southeast-2.convex.cloud";
const CONVEX_SITE_URL = "https://brazen-stoat-999.ap-southeast-2.convex.site";

/**
 * Save an apology entry to the dedicated "apologies" table in Convex
 * @param {Object} entry - { senderName, recipientName, whatHappened, message, theme, sticker }
 * @returns {Promise<{ slug: string, id: string } | null>}
 */
async function saveApologyToConvex(entry) {
  try {
    const payload = {
      path: "apologies:createApology",
      args: {
        senderName: (entry.senderName || "a").trim(),
        recipientName: (entry.recipientName || "b").trim(),
        whatHappened: (entry.whatHappened || entry.question || "What happened").trim(),
        message: (entry.message || "I am deeply sorry...").trim(),
        theme: (entry.theme || "kittens").trim(),
        sticker: (entry.sticker || "💖 100% Sincere").trim(),
        celebrations: [entry.theme || "kittens", entry.sticker || "💖 100% Sincere"]
      }
    };

    const response = await fetch(`${CONVEX_CLOUD_URL}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn("Convex mutation returned status:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.status === "success" && data.value) {
      console.log("Saved to Convex apologies table:", data.value);
      sessionStorage.setItem("saybyme_apology_slug", data.value.slug);
      return data.value;
    } else {
      console.warn("Convex apologies mutation error:", data.errorMessage);
      return null;
    }
  } catch (err) {
    console.error("Failed to connect to Convex apologies table:", err);
    return null;
  }
}

/**
 * Retrieve an apology from the dedicated "apologies" table by slug
 * @param {string} slug 
 * @returns {Promise<Object | null>}
 */
async function getApologyFromConvex(slug) {
  if (!slug) return null;
  try {
    const payload = {
      path: "apologies:getApologyBySlug",
      args: { slug: slug.trim() }
    };

    const response = await fetch(`${CONVEX_CLOUD_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn("Convex apologies query returned status:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.status === "success" && data.value) {
      console.log("Loaded entry from Convex apologies table:", data.value);
      return data.value;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch from Convex apologies table:", err);
    return null;
  }
}

/**
 * Mark apology as forgiven in the "apologies" table
 * @param {string} slug 
 */
async function markApologyForgivenInConvex(slug) {
  if (!slug) return;
  try {
    const payload = {
      path: "apologies:markForgiven",
      args: { slug: slug.trim() }
    };

    await fetch(`${CONVEX_CLOUD_URL}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log("Marked apology as forgiven in Convex:", slug);
  } catch (err) {
    console.error("Failed to mark forgiven in Convex:", err);
  }
}

// Backwards-compatible aliases
const saveProposalToConvex = saveApologyToConvex;
const getProposalFromConvex = getApologyFromConvex;
const markProposalAcceptedInConvex = markApologyForgivenInConvex;
