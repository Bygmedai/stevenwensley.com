// GENERATED from src/tools/roi-calculator.jsx by scripts/build-tools.mjs — do not edit.
// Edit the .jsx and run: node scripts/build-tools.mjs
(() => {
  const { useState, useEffect, useMemo } = React;
  const T = {
    da: {
      title: "Hvad er ROI p\xE5 jeres AI-investering?",
      subtitle: "Generer en business case med rigtige tal \u2014 klar til bestyrelsen p\xE5 5 minutter",
      time: "5 minutter",
      freeLabel: "Gratis",
      startBtn: "Start business case",
      nextBtn: "N\xE6ste",
      prevBtn: "Tilbage",
      calcBtn: "Generer business case",
      step: "Trin",
      of: "af",
      q1_title: "Branche",
      q1_sub: "Hvilken branche opererer din organisation i?",
      q1_options: ["Finans & Forsikring", "Sundhed & Pharma", "Offentlig sektor", "Produktion & Industri", "IT & Tech", "Retail & E-commerce", "Transport & Logistik", "Andet"],
      q2_title: "Antal medarbejdere",
      q2_sub: "Hvor mange medarbejdere har organisationen?",
      q2_options: ["1-49", "50-249", "250-999", "1.000-4.999", "5.000+"],
      q3_title: "Gennemsnitlig \xE5rsl\xF8n",
      q3_sub: "Hvad er den omtrentlige gennemsnitlige \xE5rsl\xF8n inkl. pension og sociale bidrag?",
      q3_options: ["< 350.000 DKK", "350.000 - 500.000 DKK", "500.000 - 700.000 DKK", "700.000 - 900.000 DKK", "> 900.000 DKK"],
      q4_title: "Manuelle processer",
      q4_sub: "Hvor mange timer pr. uge bruger medarbejderne i snit p\xE5 repetitive opgaver? (dataindtastning, rapportering, dokumenth\xE5ndtering, fakturakontrol)",
      q4_options: ["< 2 timer", "2-5 timer", "5-10 timer", "10-20 timer", "> 20 timer"],
      q5_title: "Kundehenvendelser",
      q5_sub: "Hvor mange kundehenvendelser h\xE5ndterer I m\xE5nedligt? (support, salg, intern service)",
      q5_options: ["< 100", "100-500", "500-2.000", "2.000-10.000", "> 10.000"],
      q6_title: "Fejl og omarbejdning",
      q6_sub: "Hvor stor en del af arbejdet kr\xE6ver omarbejdning pga. fejl, manglende data eller misforst\xE5elser?",
      q6_options: ["< 2% \u2014 sj\xE6ldent", "2-5% \u2014 indimellem", "5-10% \u2014 regelm\xE6ssigt", "10-20% \u2014 ofte", "> 20% \u2014 et stort problem"],
      q7_title: "AI-modenhed",
      q7_sub: "Hvor er I i jeres AI-rejse?",
      q7_options: ["Ikke startet \u2014 overvejer stadig", "Eksperimenterer \u2014 pilotprojekter", "I gang \u2014 f\xE5 systemer i drift", "Moden \u2014 AI integreret i processer"],
      q8_title: "Planlagt AI-investering",
      q8_sub: "Hvad er det forventede budget for AI-initiativer de n\xE6ste 12 m\xE5neder?",
      q8_options: ["< 250.000 DKK", "250.000 - 750.000 DKK", "750.000 - 2 mio. DKK", "2-5 mio. DKK", "> 5 mio. DKK"],
      // Results
      resHeadline: "Din AI Business Case",
      resSubtitle: "Estimeret ROI p\xE5 12 m\xE5neder",
      roiLabel: "ROI",
      paybackLabel: "Payback-periode",
      months: "m\xE5neder",
      netBenefitLabel: "Netto-gevinst (\xE5r 1)",
      investmentLabel: "Investering",
      totalSavingsLabel: "Samlede besparelser (\xE5r 1)",
      savTitle: "Besparelsesomr\xE5der",
      sav1_title: "Automatisering af manuelle processer",
      sav1_desc: "Frigivet tid fra repetitive opgaver \u2014 dataindtastning, rapportering, dokumenth\xE5ndtering",
      sav2_title: "Hurtigere kundeh\xE5ndtering",
      sav2_desc: "AI-assisteret kundeservice, auto-routing og selvbetjening",
      sav3_title: "Reduktion af fejl og omarbejdning",
      sav3_desc: "AI-drevet kvalitetskontrol, automatisk validering og fejlforebyggelse",
      sav4_title: "Bedre beslutninger via data",
      sav4_desc: "Predictive analytics, rapportautomatisering og realtids-indsigt",
      complianceTitle: "EU AI Act compliance-investering",
      complianceDesc: "Anbefalet allokering til governance, risikovurdering og dokumentation",
      compliancePct: "af AI-investering",
      complianceNote: "Uden compliance risikerer I b\xF8der op til 7% af global oms\xE6tning",
      yr1Label: "\xC5r 1",
      yr2Label: "\xC5r 2",
      yr3Label: "\xC5r 3",
      projTitle: "3-\xE5rs projektion",
      cumulativeLabel: "Kumulativ gevinst",
      ctaTitle: "Klar til at komme i gang?",
      ctaText: "F\xE5 en personlig gennemgang af din business case med konkrete n\xE6ste skridt.",
      ctaBtn: "Book et gratis 30-min m\xF8de",
      downloadBtn: "Download PDF-rapport",
      costBtn: "Beregn din Cost of Inaction",
      assessBtn: "Tag AI Governance Assessment",
      disclaimer: "Alle tal er estimater baseret p\xE5 branchedata og typiske AI-implementeringer. Faktisk ROI afh\xE6nger af implementering og organisatoriske forhold.",
      langToggle: "EN",
      byLine: "Steven Wensley \u2014 AI Advisory & EU AI Act Compliance",
      privacy: "Ingen data gemmes i browseren. ",
      privacyLink: "Privatlivspolitik"
    },
    en: {
      title: "What's the ROI on your AI investment?",
      subtitle: "Generate a business case with real numbers \u2014 boardroom-ready in 5 minutes",
      time: "5 minutes",
      freeLabel: "Free",
      startBtn: "Start business case",
      nextBtn: "Next",
      prevBtn: "Back",
      calcBtn: "Generate business case",
      step: "Step",
      of: "of",
      q1_title: "Industry",
      q1_sub: "Which industry does your organisation operate in?",
      q1_options: ["Finance & Insurance", "Healthcare & Pharma", "Public Sector", "Manufacturing & Industry", "IT & Tech", "Retail & E-commerce", "Transport & Logistics", "Other"],
      q2_title: "Number of employees",
      q2_sub: "How many employees does the organisation have?",
      q2_options: ["1-49", "50-249", "250-999", "1,000-4,999", "5,000+"],
      q3_title: "Average annual salary",
      q3_sub: "What is the approximate average annual salary including pension and social contributions?",
      q3_options: ["< \u20AC47,000", "\u20AC47,000 - \u20AC67,000", "\u20AC67,000 - \u20AC94,000", "\u20AC94,000 - \u20AC121,000", "> \u20AC121,000"],
      q4_title: "Manual processes",
      q4_sub: "How many hours per week do employees spend on average on repetitive tasks? (data entry, reporting, document handling, invoice processing)",
      q4_options: ["< 2 hours", "2-5 hours", "5-10 hours", "10-20 hours", "> 20 hours"],
      q5_title: "Customer enquiries",
      q5_sub: "How many customer enquiries do you handle monthly? (support, sales, internal service)",
      q5_options: ["< 100", "100-500", "500-2,000", "2,000-10,000", "> 10,000"],
      q6_title: "Errors and rework",
      q6_sub: "What proportion of work requires rework due to errors, missing data, or misunderstandings?",
      q6_options: ["< 2% \u2014 rarely", "2-5% \u2014 occasionally", "5-10% \u2014 regularly", "10-20% \u2014 frequently", "> 20% \u2014 a major issue"],
      q7_title: "AI maturity",
      q7_sub: "Where are you on your AI journey?",
      q7_options: ["Not started \u2014 still considering", "Experimenting \u2014 pilot projects", "Underway \u2014 few systems in production", "Mature \u2014 AI integrated in processes"],
      q8_title: "Planned AI investment",
      q8_sub: "What is the expected budget for AI initiatives in the next 12 months?",
      q8_options: ["< \u20AC33,000", "\u20AC33,000 - \u20AC100,000", "\u20AC100,000 - \u20AC270,000", "\u20AC270,000 - \u20AC670,000", "> \u20AC670,000"],
      resHeadline: "Your AI Business Case",
      resSubtitle: "Estimated ROI over 12 months",
      roiLabel: "ROI",
      paybackLabel: "Payback period",
      months: "months",
      netBenefitLabel: "Net benefit (year 1)",
      investmentLabel: "Investment",
      totalSavingsLabel: "Total savings (year 1)",
      savTitle: "Savings breakdown",
      sav1_title: "Automation of manual processes",
      sav1_desc: "Time freed from repetitive tasks \u2014 data entry, reporting, document handling",
      sav2_title: "Faster customer handling",
      sav2_desc: "AI-assisted customer service, auto-routing and self-service",
      sav3_title: "Reduction of errors and rework",
      sav3_desc: "AI-driven quality control, automatic validation and error prevention",
      sav4_title: "Better decisions through data",
      sav4_desc: "Predictive analytics, report automation and real-time insight",
      complianceTitle: "EU AI Act compliance investment",
      complianceDesc: "Recommended allocation for governance, risk assessment and documentation",
      compliancePct: "of AI investment",
      complianceNote: "Without compliance you risk fines up to 7% of global turnover",
      yr1Label: "Year 1",
      yr2Label: "Year 2",
      yr3Label: "Year 3",
      projTitle: "3-year projection",
      cumulativeLabel: "Cumulative gain",
      ctaTitle: "Ready to get started?",
      ctaText: "Get a personal walkthrough of your business case with concrete next steps.",
      ctaBtn: "Book a free 30-min meeting",
      downloadBtn: "Download PDF report",
      costBtn: "Calculate your Cost of Inaction",
      assessBtn: "Take AI Governance Assessment",
      disclaimer: "All figures are estimates based on industry data and typical AI implementations. Actual ROI depends on implementation and organisational factors.",
      langToggle: "DA",
      byLine: "Steven Wensley \u2014 AI Advisory & EU AI Act Compliance",
      privacy: "No data stored in browser. ",
      privacyLink: "Privacy policy"
    }
  };
  const EMPLOYEE_MID = [25, 150, 625, 3e3, 7500];
  const SALARY_DKK = [3e5, 425e3, 6e5, 8e5, 1e6];
  const SALARY_EUR = [4e4, 57e3, 8e4, 107e3, 135e3];
  const MANUAL_HOURS = [1, 3.5, 7.5, 15, 25];
  const ENQUIRIES_MID = [50, 300, 1250, 6e3, 15e3];
  const REWORK_PCT = [0.01, 0.035, 0.075, 0.15, 0.25];
  const INVESTMENT_DKK = [125e3, 5e5, 1375e3, 35e5, 75e5];
  const INVESTMENT_EUR = [16500, 66500, 185e3, 47e4, 1e6];
  const MATURITY_CAPTURE = [0.25, 0.4, 0.6, 0.75];
  const INDUSTRY_AI_MULT = {
    0: 1.15,
    // Finance — high data, high regulation
    1: 1.1,
    // Healthcare
    2: 0.95,
    // Public sector
    3: 1.05,
    // Manufacturing
    4: 1.1,
    // IT & Tech
    5: 1.05,
    // Retail
    6: 1,
    // Transport
    7: 0.85
    // Other
  };
  const AFFECTED_WORKFORCE = [0.35, 0.3, 0.25, 0.22, 0.18];
  function calcResults(answers, lang) {
    const indIdx = answers[0] || 0;
    const empIdx = answers[1] || 0;
    const salIdx = answers[2] || 0;
    const manIdx = answers[3] || 0;
    const enqIdx = answers[4] || 0;
    const rewIdx = answers[5] || 0;
    const matIdx = answers[6] || 0;
    const invIdx = answers[7] || 0;
    const isEUR = lang === "en";
    const employees = EMPLOYEE_MID[empIdx];
    const avgSalary = isEUR ? SALARY_EUR[salIdx] : SALARY_DKK[salIdx];
    const manualHrs = MANUAL_HOURS[manIdx];
    const enquiries = ENQUIRIES_MID[enqIdx];
    const reworkPct = REWORK_PCT[rewIdx];
    const investment = isEUR ? INVESTMENT_EUR[invIdx] : INVESTMENT_DKK[invIdx];
    const maturityCapture = MATURITY_CAPTURE[matIdx];
    const industryMult = INDUSTRY_AI_MULT[indIdx];
    const affectedPct = AFFECTED_WORKFORCE[empIdx];
    const hourlyCost = avgSalary / 1720;
    const totalPayroll = employees * avgSalary;
    const affectedEmployees = Math.round(employees * affectedPct);
    const automationRate = 0.3;
    const weeklyHoursSaved = affectedEmployees * manualHrs * automationRate;
    const automationSavings = Math.round(weeklyHoursSaved * 46 * hourlyCost * industryMult);
    const costPerEnquiry = isEUR ? 12 : 90;
    const resolutionImprovement = 0.25;
    const customerSavings = Math.round(enquiries * 12 * costPerEnquiry * resolutionImprovement * industryMult);
    const errorReductionRate = 0.4;
    const reworkSavings = Math.round(totalPayroll * affectedPct * reworkPct * errorReductionRate * industryMult);
    const decisionGainRate = 0.018;
    const decisionSavings = Math.round(totalPayroll * affectedPct * decisionGainRate * industryMult);
    const totalPotentialSavings = automationSavings + customerSavings + reworkSavings + decisionSavings;
    const yr1Savings = Math.round(totalPotentialSavings * maturityCapture);
    const complianceCost = Math.round(investment * 0.12);
    const totalInvestment = investment + complianceCost;
    const netBenefit = yr1Savings - totalInvestment;
    const roi = totalInvestment > 0 ? Math.round(netBenefit / totalInvestment * 100) : 0;
    const paybackMonths = yr1Savings > 0 ? Math.max(1, Math.round(totalInvestment / yr1Savings * 12)) : 99;
    const yr2Savings = Math.round(yr1Savings * 1.35);
    const yr3Savings = Math.round(yr2Savings * 1.25);
    const yr2Net = yr2Savings - Math.round(investment * 0.25);
    const yr3Net = yr3Savings - Math.round(investment * 0.2);
    const cumulative3yr = netBenefit + yr2Net + yr3Net;
    return {
      investment,
      complianceCost,
      totalInvestment,
      automationSavings: Math.round(automationSavings * maturityCapture),
      customerSavings: Math.round(customerSavings * maturityCapture),
      reworkSavings: Math.round(reworkSavings * maturityCapture),
      decisionSavings: Math.round(decisionSavings * maturityCapture),
      yr1Savings,
      netBenefit,
      roi,
      paybackMonths,
      yr2Savings,
      yr3Savings,
      yr2Net,
      yr3Net,
      cumulative3yr,
      currency: isEUR ? "\u20AC" : "DKK"
    };
  }
  function fmtNum(n, currency) {
    const abs = Math.abs(n);
    const sign = n < 0 ? "-" : "";
    if (currency === "\u20AC") {
      if (abs >= 1e6) return sign + "\u20AC" + (abs / 1e6).toFixed(1) + "M";
      if (abs >= 1e3) return sign + "\u20AC" + Math.round(abs / 1e3) + "K";
      return sign + "\u20AC" + abs;
    }
    if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + " mio. DKK";
    if (abs >= 1e3) return sign + Math.round(abs / 1e3).toLocaleString("da-DK") + ".000 DKK";
    return sign + abs + " DKK";
  }
  function fmtShort(n, currency) {
    const abs = Math.abs(n);
    const sign = n < 0 ? "-" : "+";
    if (currency === "\u20AC") {
      if (abs >= 1e6) return sign + "\u20AC" + (abs / 1e6).toFixed(1) + "M";
      if (abs >= 1e3) return sign + "\u20AC" + Math.round(abs / 1e3) + "K";
      return sign + "\u20AC" + abs;
    }
    if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + " mio.";
    if (abs >= 1e3) return sign + Math.round(abs / 1e3) + "K";
    return sign + abs;
  }
  function generatePDF(results, t, lang) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const gold = [201, 169, 110];
    const dark = [12, 12, 18];
    const white = [232, 232, 237];
    const gray = [130, 130, 155];
    const green = [34, 197, 94];
    doc.setFillColor(...dark);
    doc.rect(0, 0, 210, 297, "F");
    doc.setFillColor(...gold);
    doc.rect(0, 0, 210, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...white);
    doc.text(t.resHeadline, 20, 28);
    doc.setFontSize(11);
    doc.setTextColor(...gray);
    const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString(lang === "da" ? "da-DK" : "en-GB");
    doc.text(lang === "da" ? `Genereret ${dateStr}` : `Generated ${dateStr}`, 20, 36);
    doc.setFillColor(26, 26, 46);
    doc.roundedRect(20, 44, 170, 38, 3, 3, "F");
    doc.setFillColor(...results.roi > 0 ? green : [239, 68, 68]);
    doc.rect(20, 44, 170, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...results.roi > 0 ? green : [239, 68, 68]);
    doc.text(`${results.roi}% ${t.roiLabel}`, 30, 62);
    doc.setFontSize(11);
    doc.setTextColor(...gray);
    doc.text(`${t.paybackLabel}: ${results.paybackMonths} ${t.months}  |  ${t.netBenefitLabel}: ${fmtNum(results.netBenefit, results.currency)}`, 30, 74);
    let y = 94;
    doc.setFillColor(26, 26, 46);
    doc.roundedRect(20, y, 82, 22, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text(t.investmentLabel, 26, y + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...white);
    doc.text(fmtNum(results.totalInvestment, results.currency), 26, y + 18);
    doc.setFillColor(26, 26, 46);
    doc.roundedRect(108, y, 82, 22, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text(t.totalSavingsLabel, 114, y + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...green);
    doc.text(fmtNum(results.yr1Savings, results.currency), 114, y + 18);
    y = 126;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...white);
    doc.text(t.savTitle, 20, y);
    y += 10;
    const items = [
      { title: t.sav1_title, value: results.automationSavings },
      { title: t.sav2_title, value: results.customerSavings },
      { title: t.sav3_title, value: results.reworkSavings },
      { title: t.sav4_title, value: results.decisionSavings }
    ];
    items.forEach((item) => {
      doc.setFillColor(26, 26, 46);
      doc.roundedRect(20, y, 170, 16, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...white);
      doc.text(item.title, 26, y + 10);
      doc.setTextColor(...green);
      doc.text(fmtNum(item.value, results.currency), 150, y + 10, { align: "left" });
      y += 20;
    });
    y += 5;
    doc.setFillColor(26, 26, 46);
    doc.roundedRect(20, y, 170, 18, 2, 2, "F");
    doc.setFillColor(...gold);
    doc.rect(20, y, 3, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...gold);
    doc.text(`${t.complianceTitle}: ${fmtNum(results.complianceCost, results.currency)} (12% ${t.compliancePct})`, 30, y + 11);
    y += 30;
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
    const disclaimerLines = doc.splitTextToSize(t.disclaimer, 170);
    doc.text(disclaimerLines, 20, 276);
    doc.setFillColor(...gold);
    doc.rect(0, 285, 210, 1, "F");
    doc.setFontSize(8);
    doc.setTextColor(...gold);
    doc.text("stevenwensley.com", 20, 292);
    doc.text(t.byLine, 210 - 20, 292, { align: "right" });
    return doc;
  }
  function ROICalculator() {
    const [lang, setLang] = useState("da");
    const [phase, setPhase] = useState("intro");
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const t = T[lang];
    const totalQuestions = 8;
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
      const doc = generatePDF(results, t, lang);
      doc.save("AI-ROI-Business-Case.pdf");
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
      return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1E1E30" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#8888AA" } }, t.byLine), /* @__PURE__ */ React.createElement("button", { onClick: () => setLang(lang === "da" ? "en" : "da"), style: { ...outlineBtn, padding: "6px 14px", fontSize: 12 } }, t.langToggle)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 600, textAlign: "center" }, className: "fade-in" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 56, marginBottom: 24 } }, "\u{1F4CA}"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 } }, /* @__PURE__ */ React.createElement("span", { style: { background: "#C9A96E22", color: "#C9A96E", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600 } }, t.freeLabel), /* @__PURE__ */ React.createElement("span", { style: { background: "#1E1E30", color: "#8888AA", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500 } }, "\u23F1 ", t.time), /* @__PURE__ */ React.createElement("span", { style: { background: "#1E1E30", color: "#8888AA", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500 } }, "8 ", lang === "da" ? "sp\xF8rgsm\xE5l" : "questions")), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 16, background: "linear-gradient(135deg, #FFFFFF 0%, #C9A96E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } }, t.title), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 16, color: "#8888AA", lineHeight: 1.6, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" } }, t.subtitle), /* @__PURE__ */ React.createElement("button", { onClick: () => setPhase("questions"), style: goldBtn, onMouseEnter: (e) => e.target.style.transform = "translateY(-2px)", onMouseLeave: (e) => e.target.style.transform = "translateY(0)" }, t.startBtn, " \u2192"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 11, color: "#555", marginTop: 20 } }, t.privacy, /* @__PURE__ */ React.createElement("a", { href: "/privacy", style: { color: "#C9A96E", textDecoration: "underline" } }, t.privacyLink)))));
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
      const savItems = [
        { title: t.sav1_title, value: results.automationSavings, desc: t.sav1_desc, color: "#22C55E", icon: "\u2699\uFE0F" },
        { title: t.sav2_title, value: results.customerSavings, desc: t.sav2_desc, color: "#3B82F6", icon: "\u{1F4AC}" },
        { title: t.sav3_title, value: results.reworkSavings, desc: t.sav3_desc, color: "#8B5CF6", icon: "\u2705" },
        { title: t.sav4_title, value: results.decisionSavings, desc: t.sav4_desc, color: "#F59E0B", icon: "\u{1F9E0}" }
      ];
      const maxSav = Math.max(...savItems.map((i) => i.value), 1);
      const yr = [
        { label: t.yr1Label, savings: results.yr1Savings, net: results.netBenefit },
        { label: t.yr2Label, savings: results.yr2Savings, net: results.yr2Net },
        { label: t.yr3Label, savings: results.yr3Savings, net: results.yr3Net }
      ];
      const maxYr = Math.max(...yr.map((y) => y.savings), 1);
      return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1E1E30" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#8888AA" } }, t.byLine), /* @__PURE__ */ React.createElement("button", { onClick: () => setLang(lang === "da" ? "en" : "da"), style: { ...outlineBtn, padding: "6px 14px", fontSize: 12 } }, t.langToggle)), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 680, margin: "0 auto", padding: "32px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, background: "linear-gradient(135deg, #13131D 0%, #1A1A2E 100%)", borderColor: results.roi > 0 ? "#22C55E44" : "#EF444444", textAlign: "center", marginBottom: 32 }, className: "fade-in" }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#8888AA", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 } }, t.resSubtitle), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "clamp(42px, 7vw, 64px)", fontFamily: "'DM Serif Display', serif", fontWeight: 700, color: results.roi > 0 ? "#22C55E" : "#EF4444", marginBottom: 4 }, className: "count-up" }, results.roi, "%"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "#8888AA", fontWeight: 500 } }, t.roiLabel)), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 } }, /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, textAlign: "center", marginBottom: 0, padding: "20px 16px" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 11, color: "#8888AA", marginBottom: 6, fontWeight: 500 } }, t.paybackLabel), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 24, fontFamily: "'DM Serif Display', serif", fontWeight: 700, color: "#C9A96E" } }, results.paybackMonths), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 11, color: "#8888AA" } }, t.months)), /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, textAlign: "center", marginBottom: 0, padding: "20px 16px" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 11, color: "#8888AA", marginBottom: 6, fontWeight: 500 } }, t.totalSavingsLabel), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 18, fontFamily: "'DM Serif Display', serif", fontWeight: 700, color: "#22C55E" } }, fmtNum(results.yr1Savings, results.currency))), /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, textAlign: "center", marginBottom: 0, padding: "20px 16px" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 11, color: "#8888AA", marginBottom: 6, fontWeight: 500 } }, t.investmentLabel), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 18, fontFamily: "'DM Serif Display', serif", fontWeight: 700, color: "#E8E8ED" } }, fmtNum(results.totalInvestment, results.currency)))), /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#fff" } }, t.savTitle), savItems.map((item, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, style: { ...cardStyle, marginBottom: 12 }, className: "slide-up" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20 } }, item.icon), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600, color: "#E8E8ED" } }, item.title)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18, fontWeight: 700, color: item.color, fontFamily: "'DM Serif Display', serif" } }, fmtNum(item.value, results.currency))), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", height: 6, background: "#1E1E30", borderRadius: 3, overflow: "hidden", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "bar-grow", style: { height: "100%", width: `${Math.max(3, item.value / maxSav * 100)}%`, background: item.color, borderRadius: 3 } })), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "#6B6B8A", lineHeight: 1.4 } }, item.desc))), /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, borderColor: "#C9A96E44", borderLeft: "3px solid #C9A96E", marginTop: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600, color: "#C9A96E" } }, "\u2696\uFE0F ", t.complianceTitle), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, fontWeight: 700, color: "#C9A96E", fontFamily: "'DM Serif Display', serif" } }, fmtNum(results.complianceCost, results.currency))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "#8888AA", lineHeight: 1.4 } }, t.complianceDesc, " (12% ", t.compliancePct, ")"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 11, color: "#EF4444", marginTop: 6, fontWeight: 500 } }, t.complianceNote)), /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 20, marginTop: 32, color: "#fff" } }, t.projTitle), /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, padding: "28px 24px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 160, gap: 16, marginBottom: 16 } }, yr.map((y, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "#22C55E", marginBottom: 6 } }, fmtShort(y.savings, results.currency)), /* @__PURE__ */ React.createElement("div", { className: "grow-in", style: {
        width: "100%",
        maxWidth: 80,
        height: `${Math.max(10, y.savings / maxYr * 120)}px`,
        background: `linear-gradient(180deg, #22C55E${idx === 0 ? "88" : idx === 1 ? "AA" : "CC"} 0%, #22C55E${idx === 0 ? "33" : idx === 1 ? "55" : "77"} 100%)`,
        borderRadius: "6px 6px 0 0"
      } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "#E8E8ED", marginTop: 8 } }, y.label), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#8888AA", marginTop: 2 } }, lang === "da" ? "netto" : "net", ": ", fmtShort(y.net, results.currency))))), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid #1E1E30", paddingTop: 12, textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#8888AA" } }, t.cumulativeLabel, ": "), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18, fontWeight: 700, color: "#22C55E", fontFamily: "'DM Serif Display', serif" } }, fmtNum(results.cumulative3yr, results.currency)))), /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, marginTop: 32, textAlign: "center", borderColor: "#C9A96E44" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 } }, t.ctaTitle), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "#8888AA", marginBottom: 20 } }, t.ctaText), /* @__PURE__ */ React.createElement("a", { href: "/book-session", style: { ...goldBtn, display: "inline-block", textDecoration: "none", textAlign: "center", marginBottom: 12 } }, t.ctaBtn), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center", marginTop: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { onClick: downloadPDF, style: outlineBtn }, t.downloadBtn, " \u2193"), /* @__PURE__ */ React.createElement("a", { href: "/cost-of-inaction", style: { ...outlineBtn, textDecoration: "none", display: "inline-block" } }, t.costBtn, " \u2192")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement("a", { href: "/ai-governance-assessment", style: { ...outlineBtn, textDecoration: "none", display: "inline-block", fontSize: 12 } }, t.assessBtn, " \u2192"))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 10, color: "#555", textAlign: "center", marginTop: 24, lineHeight: 1.5 } }, t.disclaimer)));
    }
    return null;
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(ROICalculator, null));
})();
