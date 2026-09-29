// GENERATED from src/tools/cost-of-inaction.jsx by scripts/build-tools.mjs — do not edit.
// Edit the .jsx and run: node scripts/build-tools.mjs
(() => {
  const { useState, useEffect, useMemo } = React;
  const T = {
    da: {
      title: "Hvad koster det IKKE at handle?",
      subtitle: "Beregn din organisations risiko ved at vente med AI governance og EU AI Act-compliance",
      time: "3 minutter",
      freeLabel: "Gratis",
      startBtn: "Start beregning",
      nextBtn: "N\xE6ste",
      prevBtn: "Tilbage",
      calcBtn: "Beregn min risiko",
      step: "Trin",
      of: "af",
      // Questions
      q1_title: "Branche",
      q1_sub: "Hvilken branche opererer din organisation prim\xE6rt i?",
      q1_options: ["Finans & Forsikring", "Sundhed & Pharma", "Offentlig sektor", "Produktion & Industri", "IT & Tech", "Retail & E-commerce", "Transport & Logistik", "Andet"],
      q2_title: "\xC5rlig oms\xE6tning",
      q2_sub: "Hvad er din organisations omtrentlige \xE5rlige oms\xE6tning?",
      q2_options: ["< 10 mio. DKK", "10-50 mio. DKK", "50-200 mio. DKK", "200-500 mio. DKK", "500 mio. - 1 mia. DKK", "> 1 mia. DKK"],
      q3_title: "Antal medarbejdere",
      q3_sub: "Hvor mange medarbejdere har organisationen?",
      q3_options: ["1-49", "50-249", "250-999", "1.000-4.999", "5.000+"],
      q4_title: "AI-systemer i brug",
      q4_sub: "Hvor mange AI-systemer bruger I i dag? (inkl. ChatGPT, Copilot, automationer)",
      q4_options: ["0 \u2014 vi bruger ikke AI endnu", "1-5 systemer", "6-15 systemer", "16-50 systemer", "50+ systemer"],
      q5_title: "AI governance-niveau",
      q5_sub: "Hvordan vil du beskrive jeres nuv\xE6rende AI governance?",
      q5_options: ["Ingen \u2014 vi har ikke taget stilling", "Ad hoc \u2014 enkelte initiativer, ingen struktur", "Delvis \u2014 nogle politikker, men ikke d\xE6kkende", "Moden \u2014 systematisk governance, men ikke EU AI Act-klar"],
      q6_title: "Konkurrenternes AI-adoption",
      q6_sub: "I hvor h\xF8j grad bruger jeres konkurrenter AI?",
      q6_options: ["Ingen vi kender til", "Nogle f\xE5 eksperimenterer", "De fleste er i gang", "Alle \u2014 vi er bagud"],
      // Results
      resTitle: "Din organisations risikoprofil",
      resSubtitle: "Estimeret \xE5rlig cost of inaction",
      fineSectionTitle: "Regulatorisk eksponering",
      fineDesc: "Potentiel b\xF8de under EU AI Act (op til 7% af global oms\xE6tning eller \u20AC35M)",
      prodSectionTitle: "Produktivitetstab",
      prodDesc: "Tabt effektivitet vs. AI-adopterende konkurrenter",
      compSectionTitle: "Compliance-omkostning ved forsinkelse",
      compDesc: "Prisen stiger jo t\xE6ttere p\xE5 high-risk-deadline i december 2027",
      riskSectionTitle: "Risiko for AI-incident",
      riskDesc: "Potentielt tab ved ukontrolleret AI (fejl, bias, dataleaks)",
      totalLabel: "Samlet estimeret \xE5rlig risiko",
      timelineTitle: "Tidspres",
      timelineDesc: "m\xE5neder til EU AI Act high-risk deadline",
      timelineSub: "December 2027 \u2014 forberedelsen b\xF8r starte nu",
      urgencyHigh: "KRITISK: Ingen governance + mange AI-systemer = h\xF8j eksponering",
      urgencyMed: "ADVARSEL: Delvis governance d\xE6kker ikke EU AI Act-krav",
      urgencyLow: "OPM\xC6RKSOMHED: Selv med moden governance kr\xE6ver EU AI Act specifik forberedelse",
      ctaTitle: "Hvad nu?",
      ctaText: "F\xE5 en gratis gennemgang af din specifikke situation. Ingen binding.",
      ctaBtn: "Book et gratis 30-min m\xF8de",
      downloadBtn: "Download PDF-rapport",
      assessBtn: "Tag den fulde AI Governance Assessment",
      disclaimer: "Alle tal er estimater baseret p\xE5 markedsdata og EU AI Act-rammev\xE6rk. Faktiske bel\xF8b afh\xE6nger af specifikke omst\xE6ndigheder.",
      // Nav
      langToggle: "EN",
      byLine: "Steven Wensley \u2014 AI Advisory & EU AI Act Compliance",
      privacy: "Ingen data gemmes i browseren. ",
      privacyLink: "Privatlivspolitik"
    },
    en: {
      title: "What does inaction cost you?",
      subtitle: "Calculate your organisation's risk of delaying AI governance and EU AI Act compliance",
      time: "3 minutes",
      freeLabel: "Free",
      startBtn: "Start calculation",
      nextBtn: "Next",
      prevBtn: "Back",
      calcBtn: "Calculate my risk",
      step: "Step",
      of: "of",
      q1_title: "Industry",
      q1_sub: "Which industry does your organisation primarily operate in?",
      q1_options: ["Finance & Insurance", "Healthcare & Pharma", "Public Sector", "Manufacturing & Industry", "IT & Tech", "Retail & E-commerce", "Transport & Logistics", "Other"],
      q2_title: "Annual revenue",
      q2_sub: "What is your organisation's approximate annual revenue?",
      q2_options: ["< \u20AC1.3M", "\u20AC1.3M - \u20AC6.7M", "\u20AC6.7M - \u20AC27M", "\u20AC27M - \u20AC67M", "\u20AC67M - \u20AC134M", "> \u20AC134M"],
      q3_title: "Number of employees",
      q3_sub: "How many employees does the organisation have?",
      q3_options: ["1-49", "50-249", "250-999", "1,000-4,999", "5,000+"],
      q4_title: "AI systems in use",
      q4_sub: "How many AI systems do you use today? (incl. ChatGPT, Copilot, automations)",
      q4_options: ["0 \u2014 we don't use AI yet", "1-5 systems", "6-15 systems", "16-50 systems", "50+ systems"],
      q5_title: "AI governance level",
      q5_sub: "How would you describe your current AI governance?",
      q5_options: ["None \u2014 we haven't addressed it", "Ad hoc \u2014 isolated initiatives, no structure", "Partial \u2014 some policies, but not comprehensive", "Mature \u2014 systematic governance, but not EU AI Act-ready"],
      q6_title: "Competitor AI adoption",
      q6_sub: "To what extent are your competitors using AI?",
      q6_options: ["None that we know of", "A few are experimenting", "Most are underway", "All of them \u2014 we're behind"],
      resTitle: "Your organisation's risk profile",
      resSubtitle: "Estimated annual cost of inaction",
      fineSectionTitle: "Regulatory exposure",
      fineDesc: "Potential fine under EU AI Act (up to 7% of global turnover or \u20AC35M)",
      prodSectionTitle: "Productivity loss",
      prodDesc: "Lost efficiency vs. AI-adopting competitors",
      compSectionTitle: "Compliance cost of delay",
      compDesc: "Cost increases the closer to the December 2027 high-risk deadline",
      riskSectionTitle: "AI incident risk",
      riskDesc: "Potential loss from uncontrolled AI (errors, bias, data leaks)",
      totalLabel: "Total estimated annual risk",
      timelineTitle: "Time pressure",
      timelineDesc: "months until EU AI Act high-risk deadline",
      timelineSub: "December 2027 \u2014 preparation should start now",
      urgencyHigh: "CRITICAL: No governance + many AI systems = high exposure",
      urgencyMed: "WARNING: Partial governance does not meet EU AI Act requirements",
      urgencyLow: "ATTENTION: Even with mature governance, EU AI Act requires specific preparation",
      ctaTitle: "What now?",
      ctaText: "Get a free walkthrough of your specific situation. No commitment.",
      ctaBtn: "Book a free 30-min meeting",
      downloadBtn: "Download PDF report",
      assessBtn: "Take the full AI Governance Assessment",
      disclaimer: "All figures are estimates based on market data and the EU AI Act framework. Actual amounts depend on specific circumstances.",
      langToggle: "DA",
      byLine: "Steven Wensley \u2014 AI Advisory & EU AI Act Compliance",
      privacy: "No data stored in browser. ",
      privacyLink: "Privacy policy"
    }
  };
  const REVENUE_VALUES_DKK = [5e6, 3e7, 125e6, 35e7, 75e7, 15e8];
  const REVENUE_VALUES_EUR = [67e4, 4e6, 167e5, 47e6, 1e8, 2e8];
  const EMPLOYEE_MID = [25, 150, 625, 3e3, 7500];
  const AI_SYSTEMS_MID = [0, 3, 10, 33, 75];
  const INDUSTRY_RISK = {
    0: 1.4,
    // Finance
    1: 1.3,
    // Healthcare
    2: 1.2,
    // Public
    3: 1.1,
    // Manufacturing
    4: 1,
    // IT
    5: 0.9,
    // Retail
    6: 1,
    // Transport
    7: 0.8
    // Other
  };
  const GOVERNANCE_MULT = [1, 0.7, 0.4, 0.15];
  const COMPETITOR_PROD = [0.02, 0.05, 0.1, 0.18];
  function calcResults(answers, lang) {
    const revIdx = answers[1] || 0;
    const empIdx = answers[2] || 0;
    const aiIdx = answers[3] || 0;
    const govIdx = answers[4] || 0;
    const compIdx = answers[5] || 0;
    const indIdx = answers[0] || 0;
    const isEUR = lang === "en";
    const rev = isEUR ? REVENUE_VALUES_EUR[revIdx] : REVENUE_VALUES_DKK[revIdx];
    const employees = EMPLOYEE_MID[empIdx];
    const aiSystems = AI_SYSTEMS_MID[aiIdx];
    const industryMult = INDUSTRY_RISK[indIdx];
    const govMult = GOVERNANCE_MULT[govIdx];
    const compProdLoss = COMPETITOR_PROD[compIdx];
    const maxFine = Math.min(rev * 0.07, isEUR ? 35e6 : 26e7);
    const fineProbability = Math.min(0.35, (aiSystems > 0 ? 0.08 : 0.02) * industryMult * (govMult + 0.1));
    const fineExposure = Math.round(maxFine * fineProbability);
    const avgSalary = isEUR ? 65e3 : 48e4;
    const prodLoss = Math.round(employees * avgSalary * compProdLoss * (govMult * 0.5 + 0.5));
    const now = /* @__PURE__ */ new Date();
    const deadline = new Date(2027, 11, 2);
    const monthsLeft = Math.max(1, Math.round((deadline - now) / (30.44 * 24 * 60 * 60 * 1e3)));
    const urgencyMult = Math.max(1, 2.5 - monthsLeft / 24);
    const baseCost = isEUR ? employees * 120 : employees * 900;
    const complianceCost = Math.round(baseCost * govMult * urgencyMult);
    const incidentBase = aiSystems > 0 ? rev * 5e-3 * industryMult : 0;
    const incidentRisk = Math.round(incidentBase * govMult);
    const total = fineExposure + prodLoss + complianceCost + incidentRisk;
    return {
      fineExposure,
      prodLoss,
      complianceCost,
      incidentRisk,
      total,
      monthsLeft,
      maxFine,
      urgencyLevel: govIdx === 0 && aiSystems > 0 ? "high" : govIdx <= 1 ? "med" : "low",
      currency: isEUR ? "\u20AC" : "DKK"
    };
  }
  function formatNum(n, currency) {
    if (currency === "\u20AC") {
      if (n >= 1e6) return "\u20AC" + (n / 1e6).toFixed(1) + "M";
      if (n >= 1e3) return "\u20AC" + Math.round(n / 1e3) + "K";
      return "\u20AC" + n;
    }
    if (n >= 1e6) return (n / 1e6).toFixed(1) + " mio. DKK";
    if (n >= 1e3) return Math.round(n / 1e3) + ".000 DKK";
    return n + " DKK";
  }
  function generatePDF(results, answers, t, lang) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const gold = [201, 169, 110];
    const dark = [12, 12, 18];
    const white = [232, 232, 237];
    const gray = [130, 130, 155];
    doc.setFillColor(...dark);
    doc.rect(0, 0, 210, 297, "F");
    doc.setFillColor(...gold);
    doc.rect(0, 0, 210, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...white);
    doc.text(t.resTitle, 20, 28);
    doc.setFontSize(11);
    doc.setTextColor(...gray);
    const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString(lang === "da" ? "da-DK" : "en-GB");
    doc.text(lang === "da" ? `Genereret ${dateStr}` : `Generated ${dateStr}`, 20, 36);
    doc.setFillColor(26, 26, 46);
    doc.roundedRect(20, 44, 170, 30, 3, 3, "F");
    doc.setFillColor(...gold);
    doc.rect(20, 44, 170, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...gold);
    doc.text(t.totalLabel, 30, 58);
    doc.setFontSize(22);
    doc.text(formatNum(results.total, results.currency), 30, 69);
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text(lang === "da" ? "pr. \xE5r" : "per year", 30 + doc.getTextWidth(formatNum(results.total, results.currency)) + 4, 69);
    const items = [
      { title: t.fineSectionTitle, value: results.fineExposure, desc: t.fineDesc },
      { title: t.prodSectionTitle, value: results.prodLoss, desc: t.prodDesc },
      { title: t.compSectionTitle, value: results.complianceCost, desc: t.compDesc },
      { title: t.riskSectionTitle, value: results.incidentRisk, desc: t.riskDesc }
    ];
    let y = 86;
    items.forEach((item) => {
      doc.setFillColor(26, 26, 46);
      doc.roundedRect(20, y, 170, 22, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...white);
      doc.text(item.title, 26, y + 9);
      doc.setTextColor(...gold);
      doc.text(formatNum(item.value, results.currency), 145, y + 9, { align: "left" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...gray);
      doc.text(item.desc, 26, y + 17);
      y += 28;
    });
    y += 5;
    doc.setFillColor(26, 26, 46);
    doc.roundedRect(20, y, 170, 22, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(239, 68, 68);
    doc.text(`${results.monthsLeft} ${t.timelineDesc}`, 30, y + 14);
    y += 30;
    const urgencyText = results.urgencyLevel === "high" ? t.urgencyHigh : results.urgencyLevel === "med" ? t.urgencyMed : t.urgencyLow;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(239, 68, 68);
    const urgLines = doc.splitTextToSize(urgencyText, 160);
    doc.text(urgLines, 25, y);
    y += 18;
    doc.setFillColor(...gold);
    doc.roundedRect(20, y, 170, 20, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...dark);
    doc.text(t.ctaTitle + " " + t.ctaText, 30, y + 8);
    doc.setFontSize(10);
    doc.text("stevenwensley.com/book-session", 30, y + 15);
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(t.disclaimer, 20, 280);
    doc.setFillColor(...gold);
    doc.rect(0, 285, 210, 1, "F");
    doc.setFontSize(8);
    doc.setTextColor(...gold);
    doc.text("stevenwensley.com", 20, 292);
    doc.text(t.byLine, 210 - 20, 292, { align: "right" });
    return doc;
  }
  function CostOfInactionCalc() {
    const [lang, setLang] = useState("da");
    const [phase, setPhase] = useState("intro");
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const t = T[lang];
    const totalQuestions = 6;
    const selectAnswer = (qIdx, optIdx) => {
      setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    };
    const goNext = () => {
      if (currentQ < totalQuestions - 1) {
        setCurrentQ((prev) => prev + 1);
      } else {
        const r = calcResults(answers, lang);
        setResults(r);
        setPhase("results");
      }
    };
    const goPrev = () => {
      if (currentQ > 0) setCurrentQ((prev) => prev - 1);
    };
    const downloadPDF = () => {
      if (!results) return;
      const doc = generatePDF(results, answers, t, lang);
      doc.save("Cost-of-Inaction-Report.pdf");
    };
    const cardStyle = {
      background: "#13131D",
      borderRadius: 12,
      border: "1px solid #1E1E30",
      padding: "28px 32px",
      marginBottom: 16
    };
    const goldBtn = {
      background: "linear-gradient(135deg, #C9A96E 0%, #B8944D 100%)",
      color: "#0C0C12",
      border: "none",
      borderRadius: 8,
      padding: "14px 32px",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.2s",
      width: "100%"
    };
    const outlineBtn = {
      background: "transparent",
      color: "#C9A96E",
      border: "1px solid #C9A96E33",
      borderRadius: 8,
      padding: "12px 24px",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s"
    };
    const getQ = (idx) => ({
      title: t[`q${idx + 1}_title`],
      sub: t[`q${idx + 1}_sub`],
      options: t[`q${idx + 1}_options`]
    });
    if (phase === "intro") {
      return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1E1E30" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#8888AA" } }, t.byLine), /* @__PURE__ */ React.createElement("button", { onClick: () => setLang(lang === "da" ? "en" : "da"), style: { ...outlineBtn, padding: "6px 14px", fontSize: 12 } }, t.langToggle)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 600, textAlign: "center" }, className: "fade-in" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 56, marginBottom: 24 } }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 } }, /* @__PURE__ */ React.createElement("span", { style: { background: "#C9A96E22", color: "#C9A96E", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600 } }, t.freeLabel), /* @__PURE__ */ React.createElement("span", { style: { background: "#1E1E30", color: "#8888AA", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500 } }, "\u23F1 ", t.time), /* @__PURE__ */ React.createElement("span", { style: { background: "#1E1E30", color: "#8888AA", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500 } }, "6 ", lang === "da" ? "sp\xF8rgsm\xE5l" : "questions")), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 16, background: "linear-gradient(135deg, #FFFFFF 0%, #C9A96E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } }, t.title), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 16, color: "#8888AA", lineHeight: 1.6, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" } }, t.subtitle), /* @__PURE__ */ React.createElement("button", { onClick: () => setPhase("questions"), style: goldBtn, onMouseEnter: (e) => e.target.style.transform = "translateY(-2px)", onMouseLeave: (e) => e.target.style.transform = "translateY(0)" }, t.startBtn, " \u2192"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 11, color: "#555", marginTop: 20 } }, t.privacy, /* @__PURE__ */ React.createElement("a", { href: "/privacy", style: { color: "#C9A96E", textDecoration: "underline" } }, t.privacyLink)))));
    }
    if (phase === "questions") {
      const q = getQ(currentQ);
      const selected = answers[currentQ];
      return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1E1E30" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#8888AA" } }, t.byLine), /* @__PURE__ */ React.createElement("button", { onClick: () => setLang(lang === "da" ? "en" : "da"), style: { ...outlineBtn, padding: "6px 14px", fontSize: 12 } }, t.langToggle)), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#8888AA", fontWeight: 500 } }, t.step, " ", currentQ + 1, " ", t.of, " ", totalQuestions), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#C9A96E", fontWeight: 600 } }, Math.round((currentQ + 1) / totalQuestions * 100), "%")), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", height: 4, background: "#1E1E30", borderRadius: 2, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${(currentQ + 1) / totalQuestions * 100}%`, background: "linear-gradient(90deg, #C9A96E, #D4B978)", borderRadius: 2, transition: "width 0.4s ease" } }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 560, width: "100%" }, className: "fade-in", key: currentQ }, /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 8, color: "#fff" } }, q.title), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "#8888AA", marginBottom: 28, lineHeight: 1.5 } }, q.sub), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, q.options.map((opt, idx) => /* @__PURE__ */ React.createElement("button", { key: idx, onClick: () => selectAnswer(currentQ, idx), style: {
        ...cardStyle,
        padding: "16px 20px",
        marginBottom: 0,
        cursor: "pointer",
        textAlign: "left",
        fontSize: 14,
        fontWeight: 500,
        color: selected === idx ? "#C9A96E" : "#E8E8ED",
        border: selected === idx ? "1px solid #C9A96E" : "1px solid #1E1E30",
        background: selected === idx ? "#C9A96E11" : "#13131D",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: 12
      } }, /* @__PURE__ */ React.createElement("span", { style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        border: selected === idx ? "2px solid #C9A96E" : "2px solid #333",
        background: selected === idx ? "#C9A96E" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 12,
        color: "#0C0C12",
        fontWeight: 700
      } }, selected === idx && "\u2713"), opt))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, marginTop: 28, justifyContent: "space-between" } }, currentQ > 0 && /* @__PURE__ */ React.createElement("button", { onClick: goPrev, style: { ...outlineBtn, flex: "0 0 auto" } }, "\u2190 ", t.prevBtn), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: goNext,
          disabled: selected === void 0,
          style: {
            ...goldBtn,
            opacity: selected === void 0 ? 0.4 : 1,
            cursor: selected === void 0 ? "default" : "pointer",
            flex: 1,
            marginLeft: currentQ === 0 ? 0 : "auto"
          }
        },
        currentQ === totalQuestions - 1 ? t.calcBtn : t.nextBtn,
        " \u2192"
      )))));
    }
    if (phase === "results" && results) {
      const items = [
        { title: t.fineSectionTitle, value: results.fineExposure, desc: t.fineDesc, color: "#EF4444", icon: "\u2696\uFE0F" },
        { title: t.prodSectionTitle, value: results.prodLoss, desc: t.prodDesc, color: "#F59E0B", icon: "\u{1F4C9}" },
        { title: t.compSectionTitle, value: results.complianceCost, desc: t.compDesc, color: "#8B5CF6", icon: "\u23F0" },
        { title: t.riskSectionTitle, value: results.incidentRisk, desc: t.riskDesc, color: "#F97316", icon: "\u{1F6E1}\uFE0F" }
      ];
      const maxVal = Math.max(...items.map((i) => i.value), 1);
      return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1E1E30" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#8888AA" } }, t.byLine), /* @__PURE__ */ React.createElement("button", { onClick: () => setLang(lang === "da" ? "en" : "da"), style: { ...outlineBtn, padding: "6px 14px", fontSize: 12 } }, t.langToggle)), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 680, margin: "0 auto", padding: "32px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, background: "linear-gradient(135deg, #13131D 0%, #1A1A2E 100%)", borderColor: "#C9A96E44", textAlign: "center", marginBottom: 32 }, className: "fade-in" }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#8888AA", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 } }, t.resSubtitle), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "clamp(36px, 6vw, 52px)", fontFamily: "'DM Serif Display', serif", fontWeight: 700, color: "#EF4444", marginBottom: 8 }, className: "count-up" }, formatNum(results.total, results.currency)), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "#8888AA" } }, lang === "da" ? "pr. \xE5r" : "per year")), /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#fff" } }, t.resTitle), items.map((item, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, style: { ...cardStyle, marginBottom: 12 }, className: "slide-up" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20 } }, item.icon), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600, color: "#E8E8ED" } }, item.title)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18, fontWeight: 700, color: item.color, fontFamily: "'DM Serif Display', serif" } }, formatNum(item.value, results.currency))), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", height: 6, background: "#1E1E30", borderRadius: 3, overflow: "hidden", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "bar-grow", style: { height: "100%", width: `${Math.max(3, item.value / maxVal * 100)}%`, background: item.color, borderRadius: 3 } })), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "#6B6B8A", lineHeight: 1.4 } }, item.desc))), /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, background: "#1A0A0A", borderColor: "#EF444433", textAlign: "center", marginTop: 24 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 48, fontFamily: "'DM Serif Display', serif", fontWeight: 700, color: "#EF4444", marginBottom: 4 }, className: "pulse" }, results.monthsLeft), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, fontWeight: 600, color: "#EF4444" } }, t.timelineDesc), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "#8888AA", marginTop: 8 } }, t.timelineSub)), /* @__PURE__ */ React.createElement("div", { style: { background: results.urgencyLevel === "high" ? "#EF444422" : results.urgencyLevel === "med" ? "#F59E0B22" : "#C9A96E22", borderRadius: 8, padding: "14px 20px", marginTop: 16, border: `1px solid ${results.urgencyLevel === "high" ? "#EF444444" : results.urgencyLevel === "med" ? "#F59E0B44" : "#C9A96E44"}` } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, fontWeight: 700, color: results.urgencyLevel === "high" ? "#EF4444" : results.urgencyLevel === "med" ? "#F59E0B" : "#C9A96E" } }, results.urgencyLevel === "high" ? t.urgencyHigh : results.urgencyLevel === "med" ? t.urgencyMed : t.urgencyLow)), /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, marginTop: 32, textAlign: "center", borderColor: "#C9A96E44" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 } }, t.ctaTitle), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "#8888AA", marginBottom: 20 } }, t.ctaText), /* @__PURE__ */ React.createElement("a", { href: "/book-session", style: { ...goldBtn, display: "inline-block", textDecoration: "none", textAlign: "center", marginBottom: 12 } }, t.ctaBtn), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center", marginTop: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { onClick: downloadPDF, style: outlineBtn }, t.downloadBtn, " \u2193"), /* @__PURE__ */ React.createElement("a", { href: "/ai-governance-assessment", style: { ...outlineBtn, textDecoration: "none", display: "inline-block" } }, t.assessBtn, " \u2192"))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 10, color: "#555", textAlign: "center", marginTop: 24, lineHeight: 1.5 } }, t.disclaimer)));
    }
    return null;
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(CostOfInactionCalc, null));
})();
