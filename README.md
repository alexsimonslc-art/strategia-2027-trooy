# STRATEGIA'26 — static website (HTML / CSS / JS)

Plain HTML, CSS and JavaScript version of the Replit React site. Same layout as the
Replit project: one file per page, shared pieces in `components/`.

```
index.html                  Home page            (was pages/home.tsx + mobile/MobileHome.tsx)
404.html                    Page not found
site-config.js              Form endpoints (Google Sheets, contact email)
vercel.json                 Old links like /about -> /pages/about.html
pages/
  about.html   about.js                 About
  events.html  events.js                Events
  events/strategiq.html ...             One page per competition (script: pages/event-detail.js)
  panel-discussion.html / .js           Panel Discussion
  startup-expo.html / .js               Startup Expo
  schedule.html / .js                   Schedule (Day 1 / Day 2)
  registration.html / .js               Registration (competitions + panel)
  panel-registration-form.html / .js    Mobile panel form
  registration-confirmation.html, panel-confirmation.html
  sponsors.html, gallery.html, contact.html (+ contact.js)
  privacy-policy.html, rules-regulations.html
components/
  layout/navigation.js, layout/footer.js     Desktop top bar and footer (edit links here)
  mobile/mobile-navigation.js                Mobile header + bottom tabs
  ui/toaster.js, ui/select.js                Pop-up messages, dropdowns
  carousels.js, countdown-timer.js, event-card.js, particles.js,
  video-modals.js, cursor-trail.js
lib/
  motion.js       Animation engine (replaces Framer Motion)
  states.js       Swaps tab/slide contents stored in <template> blocks
  constants.js    Events data (was the Replit database) + event date
  static-api.js   Form submissions (was the Express server)
  forms.js        Form validation messages
  utils.js, device.js, vendor/ogl.min.js
styles/
  index.css       All site styles (Tailwind output + custom CSS)
  site.css        Shows the desktop OR mobile layout
attached_assets/  Images and video
```

Each page contains a DESKTOP layout and a MOBILE layout (the React site showed different
components on phones). Edit both when you change text.
