/*
 * STRATEGIA'26 — site settings
 * These replace the old Replit server. Edit a value and publish; no rebuild needed.
 */
window.STRATEGIA_CONFIG = {
  // Competition registrations -> Google Sheet (the same Apps Script the Replit server used)
  teamSheetUrl: "https://script.google.com/macros/s/AKfycbxCjHIjl3D_5lIFs6fLxhJzU569pc-4kiqqwBRPERHRS_p6BZXOWeXmdLtYDaR6nBcA/exec",

  // Panel discussion registrations -> Google Sheet.
  // Paste the value of PANEL_DISCUSSION_SHEET_URL from Replit > Secrets here.
  panelSheetUrl: "",

  // Contact form -> email. FormSubmit forwards each message to the address below.
  // The first message sends a one-time "Activate" email to that inbox; click it once.
  contactEndpoint: "https://formsubmit.co/ajax/support@strategiaevent.com"
};
