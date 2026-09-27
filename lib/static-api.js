/*
 * Form submissions (replaces the old Express server in server/routes.ts).
 * Endpoints come from /site-config.js so they can be changed without code.
 *
 *   Api.registerTeam(data)      -> Google Sheet (competition registrations)
 *   Api.registerPanel(data)     -> Google Sheet (panel discussion)
 *   Api.sendContact(data)       -> email via FormSubmit
 *
 * Each returns a Promise that rejects with an Error whose message is shown to the user.
 */
(function () {
  function cfg() {
    return window.STRATEGIA_CONFIG || {};
  }

  /* Google Apps Script web apps don't answer CORS preflights, so the request is
     sent as a plain-text POST in no-cors mode. The script still reads the JSON
     from e.postData.contents; the browser just can't read the reply. */
  function postToSheet(url, payload) {
    return fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  }

  function registerTeam(d) {
    var url = cfg().teamSheetUrl;
    if (!url) return Promise.reject(new Error("Registration is not available right now. Please try again later."));
    return postToSheet(url, {
      team_name: d.teamName,
      institution: d.institution,
      captain_name: d.captainName,
      captain_email: d.captainEmail,
      captain_phone: d.captainPhone,
      year_of_study: d.yearOfStudy,
      selected_events: d.selectedEvents,
      member2_name: d.member1Name,
      member2_email: d.member1Email,
      member2_phone: d.member1Phone,
      member2_year_of_study: d.member1YearOfStudy,
      member3_name: d.member2Name || "",
      member3_email: d.member2Email || "",
      member3_phone: d.member2Phone || "",
      member3_year_of_study: d.member2YearOfStudy || "",
    }).catch(function () {
      throw new Error("Could not submit your registration. Please check your connection and try again.");
    });
  }

  function registerPanel(d) {
    var url = cfg().panelSheetUrl;
    if (!url) return Promise.reject(new Error("Registration is not available right now. Please try again later."));
    return postToSheet(url, {
      salutation: d.salutation,
      name: d.name,
      gender: d.gender,
      age: d.age,
      institution: d.institution,
      profession: d.profession,
      qualification: d.qualification,
      email: d.email,
      phone: d.phone,
      timestamp: new Date().toISOString(),
    }).catch(function () {
      throw new Error("Registration failed. Please try again.");
    });
  }

  function sendContact(d) {
    var url = cfg().contactEndpoint;
    if (!url) return Promise.reject(new Error("Messaging is not available right now. Please email us directly."));
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: d.firstName + " " + d.lastName,
        email: d.email,
        _replyto: d.email,
        _subject: "New Contact Form Message: " + d.subject,
        _template: "table",
        _captcha: "false",
        subject: d.subject,
        message: d.message,
      }),
    }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
    }).catch(function () {
      throw new Error("Could not send your message. Please try again or email us directly.");
    });
  }

  window.Api = { registerTeam: registerTeam, registerPanel: registerPanel, sendContact: sendContact };
})();
