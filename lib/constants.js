/*
 * Site data (was the Replit database "events" table + lib/constants.ts).
 * Edit an event here and every page that lists it updates.
 */
window.EVENTS = [
  {
    "id": "final-showdown",
    "name": "Final Showdown",
    "description": "The ultimate finale where winners from the four main competitions compete for the championship title.",
    "prizePool": 100000,
    "registrationFee": 0,
    "rounds": [
      "Qualification Round",
      "Semi-Finals",
      "Championship Round",
      "Grand Finale"
    ],
    "judging": "Overall strategic excellence, leadership demonstration, and championship performance",
    "skills": [
      "Strategic Excellence",
      "Leadership",
      "Championship Performance",
      "Elite Competition"
    ],
    "imageUrl": "/attached_assets/Final-Showdown_1756909315819.png",
    "gradient": "from-purple-700 to-purple-900",
    "eventType": "final",
    "isRegisterable": false,
    "orderIndex": 0
  },
  {
    "id": "strategiq",
    "name": "StrategIQ",
    "description": "The ultimate business and finance quiz where intellect meets speed and strategy.",
    "prizePool": 50000,
    "registrationFee": 300,
    "rounds": [
      "Preliminary Screening",
      "Case Analysis",
      "Strategy Presentation",
      "Final Round"
    ],
    "judging": "Analytical thinking, strategic planning, presentation skills, and decision-making under pressure",
    "skills": [
      "Strategic Analysis",
      "Problem Solving",
      "Decision Making",
      "Presentation"
    ],
    "imageUrl": "/attached_assets/StrategIQ_1756909440871.png",
    "gradient": "from-strategia-navy to-blue-900",
    "eventType": "main",
    "isRegisterable": true,
    "orderIndex": 1
  },
  {
    "id": "market-masters",
    "name": "Market Masters",
    "description": "Test your market acumen through live trading and portfolio strategy presentations.",
    "prizePool": 50000,
    "registrationFee": 300,
    "rounds": [
      "Market Analysis",
      "Portfolio Construction",
      "Risk Assessment",
      "Performance Review"
    ],
    "judging": "Portfolio performance, risk management, market understanding, and investment rationale",
    "skills": [
      "Investment Analysis",
      "Risk Management",
      "Market Research",
      "Financial Modeling"
    ],
    "imageUrl": "/attached_assets/Market-Masters_1756909440872.jpg",
    "gradient": "from-strategia-red to-red-700",
    "eventType": "main",
    "isRegisterable": true,
    "orderIndex": 2
  },
  {
    "id": "venturex",
    "name": "VentureX",
    "description": "Pitch bold ideas in a high-stakes arena of innovation.",
    "prizePool": 50000,
    "registrationFee": 300,
    "rounds": [
      "Corporate Simulation",
      "Crisis Management",
      "Stakeholder Negotiation",
      "Board Presentation"
    ],
    "judging": "Leadership skills, crisis management, negotiation ability, and executive presence",
    "skills": [
      "Leadership",
      "Crisis Management",
      "Negotiation",
      "Executive Communication"
    ],
    "imageUrl": "/attached_assets/VentureX_1756909440869.png",
    "gradient": "from-gray-800 to-gray-900",
    "eventType": "main",
    "isRegisterable": true,
    "orderIndex": 3
  },
  {
    "id": "case-quest",
    "name": "Case Quest",
    "description": "A consulting challenge to crack real-world business problems with sharp solutions.",
    "prizePool": 50000,
    "registrationFee": 300,
    "rounds": [
      "Case Analysis",
      "Solution Design",
      "Implementation Plan",
      "Case Defense"
    ],
    "judging": "Case analysis depth, solution creativity, implementation feasibility, and defense quality",
    "skills": [
      "Case Analysis",
      "Strategic Thinking",
      "Solution Design",
      "Critical Reasoning"
    ],
    "imageUrl": "/attached_assets/Case-Quest-2-_1756909440874.jpg",
    "gradient": "from-green-700 to-green-800",
    "eventType": "main",
    "isRegisterable": true,
    "orderIndex": 4
  }
];

// Competitions shown in lists / registration (eventType "main"), in display order
window.MAIN_EVENTS = window.EVENTS.filter(function (e) { return e.eventType === "main"; })
  .sort(function (a, b) { return a.orderIndex - b.orderIndex; });

// The championship round
window.FINAL_EVENT = window.EVENTS.filter(function (e) { return e.eventType === "final"; })[0];

// Countdown target used on the home page
window.EVENT_DATE = new Date("2026-02-02T09:00:00");
