const WHATSAPP_NUMBER = "+31683216760";

const fields = [
  { id: "field-name", el: document.getElementById("field-name") },
  { id: "field-apple", el: document.getElementById("field-apple") },
  { id: "field-banana", el: document.getElementById("field-banana") },
  { id: "field-oliveoil", el: document.getElementById("field-oliveoil") },
  { id: "field-yoghurt", el: document.getElementById("field-yoghurt") },
];

const sendButton = document.getElementById("send-button");

const nameField = fields[0].el;
const otherFields = fields.slice(1).map((field) => field.el);

const hasText = (input) => input.value.trim().length > 0;

function refreshButtonState() {
  const nameFilled = hasText(nameField);
  const othersFilled = otherFields.some(hasText);
  sendButton.disabled = !(nameFilled && othersFilled);
}

fields.forEach(({ el }) => {
  el.addEventListener("input", refreshButtonState);
});

function buildPayload() {
  return fields.reduce((acc, field) => {
    const value = field.el.value.trim();
    if (value) {
      acc[field.id] = value;
    }
    return acc;
  }, {});
}

function createShareableUrl(payload) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const encoded = encodeURIComponent(JSON.stringify(payload));
  return `${base}?data=${encoded}`;
}

function sendViaWhatsapp(payloadUrl) {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    payloadUrl
  )}`;
  window.open(whatsappUrl, "_blank");
}

sendButton.addEventListener("click", () => {
  const payload = buildPayload();
  if (!payload["field-name"]) {
    return;
  }
  const shareUrl = createShareableUrl(payload);
  sendViaWhatsapp(shareUrl);
});

function hydrateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get("data");
  if (!dataParam) {
    return;
  }
  try {
    const decoded = decodeURIComponent(dataParam);
    const parsed = JSON.parse(decoded);
    Object.entries(parsed).forEach(([id, value]) => {
      const match = fields.find((field) => field.id === id);
      if (match) {
        match.el.value = value;
      }
    });
  } catch (error) {
    console.error("Failed to hydrate from URL", error);
  }
}

// Prefill fields when arriving through a shareable URL, then sync button state.
hydrateFromUrl();
refreshButtonState();
