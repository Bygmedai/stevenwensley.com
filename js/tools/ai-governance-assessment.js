// GENERATED from src/tools/ai-governance-assessment.jsx by scripts/build-tools.mjs — do not edit.
// Edit the .jsx and run: node scripts/build-tools.mjs
(() => {
  const { useState, useMemo } = React;
  const DIMENSIONS = [
    {
      id: "ownership",
      name: "Ejerskab & Ansvar",
      nameEN: "Ownership & Accountability",
      icon: "\u{1F464}",
      questions: [
        { q: "Er der udpeget en AI-ansvarlig (person eller rolle) i organisationen?", qEN: "Is there a designated AI owner (person or role) in the organisation?" },
        { q: "Ved alle teams, hvem der har beslutningskompetence over AI-systemer?", qEN: "Do all teams know who has decision authority over AI systems?" },
        { q: "Er der en klar eskaleringsvej, n\xE5r et AI-system fejler eller underperformer?", qEN: "Is there a clear escalation path when an AI system fails or underperforms?" },
        { q: "Har nogen i organisationen vetoret over AI-beslutninger?", qEN: "Does someone in the organisation have veto power over AI decisions?" },
        { q: "Er AI-ejerskab forankret i en eksisterende governance-struktur (fx IT, compliance, risk)?", qEN: "Is AI ownership anchored in an existing governance structure (e.g., IT, compliance, risk)?" }
      ]
    },
    {
      id: "risk",
      name: "Risikostyring",
      nameEN: "Risk Management",
      icon: "\u26A0\uFE0F",
      questions: [
        { q: "Er alle jeres AI-systemer klassificeret efter risikoniveau (h\xF8j/medium/lav)?", qEN: "Are all your AI systems classified by risk level (high/medium/low)?" },
        { q: "Har I en proces for at vurdere risiko F\xD8R et nyt AI-system implementeres?", qEN: "Do you have a process for assessing risk BEFORE a new AI system is implemented?" },
        { q: "Ved I, hvad der sker med forretningen, hvis jeres vigtigste AI-system g\xE5r ned i 48 timer?", qEN: "Do you know what happens to the business if your most critical AI system goes down for 48 hours?" },
        { q: "Har I identificeret potentiel bias i jeres AI-systemer?", qEN: "Have you identified potential bias in your AI systems?" },
        { q: "Er der en rollback-plan for hvert AI-system i produktion?", qEN: "Is there a rollback plan for each AI system in production?" }
      ]
    },
    {
      id: "compliance",
      name: "Compliance & Regulering",
      nameEN: "Compliance & Regulation",
      icon: "\u{1F4CB}",
      questions: [
        { q: "Ved I, hvilke af jeres AI-systemer der falder under EU AI Act?", qEN: "Do you know which of your AI systems fall under the EU AI Act?" },
        { q: "Har I en tidsplan for at opfylde EU AI Act-kravene?", qEN: "Do you have a timeline for meeting EU AI Act requirements?" },
        { q: "Er jeres AI-systemer dokumenteret i et centralt register?", qEN: "Are your AI systems documented in a central register?" },
        { q: "Kan I fremvise audit trail for AI-beslutninger, hvis en myndighed beder om det?", qEN: "Can you produce an audit trail for AI decisions if a regulator requests it?" },
        { q: "Er jeres AI-governance koordineret med eksisterende compliance (GDPR, NIS2, ISO27001)?", qEN: "Is your AI governance coordinated with existing compliance (GDPR, NIS2, ISO27001)?" }
      ]
    },
    {
      id: "data",
      name: "Data & Transparens",
      nameEN: "Data & Transparency",
      icon: "\u{1F50D}",
      questions: [
        { q: "Ved I, hvilke data jeres AI-systemer er tr\xE6net p\xE5?", qEN: "Do you know what data your AI systems are trained on?" },
        { q: "Kan I forklare \u2014 i ikke-teknisk sprog \u2014 hvordan jeres AI-systemer tr\xE6ffer beslutninger?", qEN: "Can you explain \u2014 in non-technical language \u2014 how your AI systems make decisions?" },
        { q: "Er der en proces for at sikre datakvalitet i AI-input?", qEN: "Is there a process for ensuring data quality in AI input?" },
        { q: "Har I overblik over, hvilke persondata der bruges af AI-systemer?", qEN: "Do you have an overview of which personal data is used by AI systems?" },
        { q: "Er brugerne informeret om, hvorn\xE5r de interagerer med AI?", qEN: "Are users informed when they are interacting with AI?" }
      ]
    },
    {
      id: "monitoring",
      name: "Monitorering & Drift",
      nameEN: "Monitoring & Operations",
      icon: "\u{1F4CA}",
      questions: [
        { q: "Monitorerer I l\xF8bende AI-systemers performance og n\xF8jagtighed?", qEN: "Do you continuously monitor AI system performance and accuracy?" },
        { q: "Har I defineret KPI'er for hvert AI-system i produktion?", qEN: "Have you defined KPIs for each AI system in production?" },
        { q: "Er der en fast kadence for AI-review (fx kvartalsvis audit)?", qEN: "Is there a fixed cadence for AI review (e.g., quarterly audit)?" },
        { q: "Tester I l\xF8bende for bias og model-drift?", qEN: "Do you continuously test for bias and model drift?" },
        { q: "Har I en proces for at pensionere AI-systemer, der ikke performer?", qEN: "Do you have a process for retiring AI systems that underperform?" }
      ]
    },
    {
      id: "culture",
      name: "Kultur & Kompetencer",
      nameEN: "Culture & Competencies",
      icon: "\u{1F9E0}",
      questions: [
        { q: "Har ledelsen en grundl\xE6ggende forst\xE5else af AI's muligheder og risici?", qEN: "Does leadership have a fundamental understanding of AI's opportunities and risks?" },
        { q: "Er der et AI-tr\xE6ningsprogram for medarbejdere, der arbejder med AI?", qEN: "Is there an AI training program for employees who work with AI?" },
        { q: "Har I en politik for brug af generativ AI (fx ChatGPT) p\xE5 arbejdspladsen?", qEN: "Do you have a policy for using generative AI (e.g., ChatGPT) in the workplace?" },
        { q: "Involverer I slutbrugere, n\xE5r I designer eller implementerer AI-systemer?", qEN: "Do you involve end users when designing or implementing AI systems?" },
        { q: "Er der et forum (fx AI-board, steering committee) for tv\xE6rg\xE5ende AI-diskussion?", qEN: "Is there a forum (e.g., AI board, steering committee) for cross-functional AI discussion?" }
      ]
    }
  ];
  const ANSWER_OPTIONS = [
    { value: 2, label: "Ja", labelEN: "Yes", color: "#22C55E" },
    { value: 1, label: "Delvist", labelEN: "Partially", color: "#F59E0B" },
    { value: 0, label: "Nej", labelEN: "No", color: "#EF4444" }
  ];
  const MATURITY_LEVELS = [
    { min: 0, max: 20, level: "Ad Hoc", levelEN: "Ad Hoc", color: "#EF4444", desc: "AI governance er ikke formaliseret. Der er betydelig risiko for compliance-problemer og uforudsete AI-fejl.", descEN: "AI governance is not formalized. There is significant risk of compliance issues and unforeseen AI failures." },
    { min: 21, max: 40, level: "Begyndende", levelEN: "Emerging", color: "#F97316", desc: "Nogle processer er p\xE5 plads, men der mangler systematik. Kritiske gaps b\xF8r adresseres nu \u2014 nu hvor EU AI Act h\xE5ndh\xE6ves.", descEN: "Some processes are in place but lack system. Critical gaps should be addressed now \u2014 now that the EU AI Act is being enforced." },
    { min: 41, max: 60, level: "Defineret", levelEN: "Defined", color: "#F59E0B", desc: "I har et fundament, men der er rum for forbedring. Fokus b\xF8r v\xE6re p\xE5 at lukke de specifikke gaps, der scorer lavest.", descEN: "You have a foundation, but there is room for improvement. Focus should be on closing the specific gaps that score lowest." },
    { min: 61, max: 80, level: "Styret", levelEN: "Managed", color: "#22C55E", desc: "St\xE6rk governance-position. N\xE6ste skridt er at formalisere audit-processer og sikre kontinuerlig forbedring.", descEN: "Strong governance position. Next step is to formalize audit processes and ensure continuous improvement." },
    { min: 81, max: 100, level: "Optimeret", levelEN: "Optimized", color: "#10B981", desc: "Best-in-class governance. I er godt rustet til regulering og kan bruge jeres governance som konkurrencefordel.", descEN: "Best-in-class governance. You are well prepared for regulation and can use your governance as a competitive advantage." }
  ];
  const RECOMMENDATIONS = {
    ownership: {
      low: "Start med at udpege \xE9n AI-ansvarlig i organisationen. Det beh\xF8ver ikke v\xE6re en ny stilling \u2014 det kan v\xE6re en eksisterende leder med mandat til at koordinere AI-beslutninger.",
      lowEN: "Start by designating one AI-responsible person in the organisation. It doesn't need to be a new position \u2014 it can be an existing leader with mandate to coordinate AI decisions.",
      mid: "Formalis\xE9r eskaleringsveje og beslutningskompetencer. Dokument\xE9r hvem der ejer hvad \u2014 og hvem der har vetoret.",
      midEN: "Formalize escalation paths and decision-making authority. Document who owns what \u2014 and who has veto power.",
      high: "Integrer AI-ejerskab i eksisterende governance-strukturer (risk committee, compliance board). Overvej dedikeret AI-governance board.",
      highEN: "Integrate AI ownership into existing governance structures (risk committee, compliance board). Consider a dedicated AI governance board."
    },
    risk: {
      low: "Lav en inventarliste over alle AI-systemer i brug \u2014 inkl. shadow AI (ChatGPT, Copilot, etc.). Klassific\xE9r hvert system: hvad sker der, hvis det fejler?",
      lowEN: "Create an inventory of all AI systems in use \u2014 including shadow AI (ChatGPT, Copilot, etc.). Classify each system: what happens if it fails?",
      mid: "Implement\xE9r en formel risikovurdering for nye AI-systemer. Brug EU AI Act's risikoklassificering som udgangspunkt.",
      midEN: "Implement a formal risk assessment for new AI systems. Use the EU AI Act's risk classification as a starting point.",
      high: "Automatis\xAD\xE9r risiko-monitorering. Etabler rollback-planer og test dem regelm\xE6ssigt. Inklud\xE9r bias-test i standard risiko-review.",
      highEN: "Automate risk monitoring. Establish rollback plans and test them regularly. Include bias testing in standard risk reviews."
    },
    compliance: {
      low: "EU AI Act-kravene indfases frem mod december 2027. Start med at identificere hvilke systemer der er High Risk under Annex III. Det er den lavest h\xE6ngende frugt.",
      lowEN: "The EU AI Act's obligations phase in through December 2027. Start by identifying which systems are High Risk under Annex III. It's the lowest-hanging fruit.",
      mid: "Opbyg et centralt AI-register med dokumentation. Koordin\xE9r med GDPR/NIS2/ISO27001-processer \u2014 undg\xE5 parallelle governance-siloer.",
      midEN: "Build a central AI register with documentation. Coordinate with GDPR/NIS2/ISO27001 processes \u2014 avoid parallel governance silos.",
      high: "Etabler audit trail-systemer og forbered jer p\xE5 myndighedsinspektion. Jeres governance kan blive en konkurrencefordel overfor kunder.",
      highEN: "Establish audit trail systems and prepare for regulatory inspection. Your governance can become a competitive advantage with customers."
    },
    data: {
      low: "Start med at kortl\xE6gge dataflow: hvilke data bruges af AI, hvor kommer de fra, og er der persondata involveret?",
      lowEN: "Start by mapping data flows: what data is used by AI, where does it come from, and is personal data involved?",
      mid: "Implement\xE9r datakvalitetschecks og s\xF8rg for at brugere ved, hvorn\xE5r de interagerer med AI (transparenskrav i EU AI Act).",
      midEN: "Implement data quality checks and ensure users know when they're interacting with AI (transparency requirement in the EU AI Act).",
      high: "Etabler en data governance-ramme specifikt for AI. Dokument\xE9r tr\xE6ningsdata og valideringsmetoder for audit-form\xE5l.",
      highEN: "Establish a data governance framework specifically for AI. Document training data and validation methods for audit purposes."
    },
    monitoring: {
      low: "Defin\xAD\xE9r minimum 3 KPI'er for hvert AI-system i produktion: n\xF8jagtighed, oppetid, og bruger-tilfredshed. M\xE5l dem m\xE5nedligt.",
      lowEN: "Define at least 3 KPIs for each AI system in production: accuracy, uptime, and user satisfaction. Measure them monthly.",
      mid: "Etabler en fast review-kadence (kvartalsvis) og inklud\xE9r bias-test og model-drift-analyse.",
      midEN: "Establish a fixed review cadence (quarterly) and include bias testing and model drift analysis.",
      high: "Automatis\xAD\xE9r monitorering og alerting. Etabler en pensioneringsproces for underperformende AI-systemer.",
      highEN: "Automate monitoring and alerting. Establish a retirement process for underperforming AI systems."
    },
    culture: {
      low: "Start med et AI-awareness-program for ledelsen. De beh\xF8ver ikke forst\xAD\xE5 koden \u2014 men de skal forst\xE5 risikoen.",
      lowEN: "Start with an AI awareness program for leadership. They don't need to understand the code \u2014 but they need to understand the risk.",
      mid: "Lav en generativ AI-politik (ChatGPT, Copilot) og involv\xE9r slutbrugere i AI-design og implementering.",
      midEN: "Create a generative AI policy (ChatGPT, Copilot) and involve end users in AI design and implementation.",
      high: "Etabler et AI-governance forum for tv\xE6rg\xE5ende koordinering. Brug AI-kompetencer som en del af jeres employer branding.",
      highEN: "Establish an AI governance forum for cross-functional coordination. Use AI competencies as part of your employer branding."
    }
  };
  function AIGovernanceAssessment() {
    const [lang, setLang] = useState("da");
    const [currentDim, setCurrentDim] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [email, setEmail] = useState("");
    const [showEmailPrompt, setShowEmailPrompt] = useState(false);
    const [industry, setIndustry] = useState("");
    const [showPdfGate, setShowPdfGate] = useState(false);
    const [pdfEmail, setPdfEmail] = useState("");
    const t = (da, en) => lang === "da" ? da : en;
    const totalQuestions = DIMENSIONS.reduce((acc, d) => acc + d.questions.length, 0);
    const answeredCount = Object.keys(answers).length;
    const progress = answeredCount / totalQuestions * 100;
    const dim = DIMENSIONS[currentDim];
    const dimAnswered = dim.questions.every((_, qi) => answers[`${dim.id}-${qi}`] !== void 0);
    const allAnswered = answeredCount === totalQuestions;
    const handleAnswer = (dimId, qi, value) => {
      setAnswers((prev) => ({ ...prev, [`${dimId}-${qi}`]: value }));
    };
    const scores = useMemo(() => {
      return DIMENSIONS.map((d) => {
        const maxScore = d.questions.length * 2;
        const score = d.questions.reduce((acc, _, qi) => {
          const val = answers[`${d.id}-${qi}`];
          return acc + (val !== void 0 ? val : 0);
        }, 0);
        const pct = Math.round(score / maxScore * 100);
        return { id: d.id, name: t(d.name, d.nameEN), score, maxScore, pct, icon: d.icon };
      });
    }, [answers, lang]);
    const totalScore = useMemo(() => {
      const total = scores.reduce((a, s) => a + s.pct, 0);
      return Math.round(total / scores.length);
    }, [scores]);
    const maturityLevel = useMemo(() => {
      return MATURITY_LEVELS.find((m) => totalScore >= m.min && totalScore <= m.max) || MATURITY_LEVELS[0];
    }, [totalScore]);
    const radarData = scores.map((s) => ({ subject: s.icon + " " + s.name, score: s.pct, fullMark: 100 }));
    const getRecommendation = (dimId, pct) => {
      const rec = RECOMMENDATIONS[dimId];
      if (pct <= 40) return t(rec.low, rec.lowEN);
      if (pct <= 70) return t(rec.mid, rec.midEN);
      return t(rec.high, rec.highEN);
    };
    const hexToRgb = (hex) => {
      if (!hex || typeof hex !== "string") return [200, 200, 200];
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [200, 200, 200];
    };
    const generatePDF = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF("p", "mm", "a4");
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();
      const gold = [201, 169, 110];
      const dark = [12, 12, 18];
      const gray = [156, 163, 175];
      const white = [232, 232, 237];
      doc.setFillColor(...dark);
      doc.rect(0, 0, w, h, "F");
      doc.setTextColor(...gold);
      doc.setFontSize(28);
      doc.text("AI Governance", w / 2, 50, { align: "center" });
      doc.text("Readiness Report", w / 2, 62, { align: "center" });
      doc.setFontSize(12);
      doc.setTextColor(...gray);
      const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString(lang === "da" ? "da-DK" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      doc.text(dateStr, w / 2, 78, { align: "center" });
      if (industry) {
        doc.text(t("Branche: ", "Industry: ") + industry, w / 2, 86, { align: "center" });
      }
      doc.setDrawColor(...gold);
      doc.setLineWidth(2);
      doc.circle(w / 2, 130, 30);
      const scoreColorRgb = hexToRgb(maturityLevel.color);
      doc.setTextColor(...scoreColorRgb);
      doc.setFontSize(42);
      doc.text(totalScore + "%", w / 2, 133, { align: "center" });
      doc.setTextColor(...gold);
      doc.setFontSize(18);
      doc.text(t(maturityLevel.level, maturityLevel.levelEN), w / 2, 148, { align: "center" });
      doc.setTextColor(...gray);
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(t(maturityLevel.desc, maturityLevel.descEN), 140);
      doc.text(descLines, w / 2, 162, { align: "center" });
      doc.setTextColor(100, 100, 120);
      doc.setFontSize(8);
      doc.text("\xA9 2026 Steven Seidenfaden Wensley | stevenwensley.com", w / 2, h - 10, { align: "center" });
      doc.addPage();
      doc.setFillColor(...dark);
      doc.rect(0, 0, w, h, "F");
      doc.setTextColor(...gold);
      doc.setFontSize(20);
      doc.text(t("Dimensionsanalyse", "Dimension Analysis"), w / 2, 25, { align: "center" });
      let yPos = 45;
      const sortedForPDF = [...scores].sort((a, b) => a.pct - b.pct);
      sortedForPDF.forEach((s) => {
        if (yPos > h - 50) {
          doc.addPage();
          doc.setFillColor(...dark);
          doc.rect(0, 0, w, h, "F");
          yPos = 25;
        }
        doc.setTextColor(...white);
        doc.setFontSize(13);
        doc.text(s.icon + " " + s.name, 20, yPos);
        const scoreColor = s.pct <= 40 ? [239, 68, 68] : s.pct <= 70 ? [245, 158, 11] : [34, 197, 94];
        doc.setTextColor(...scoreColor);
        doc.setFontSize(13);
        doc.text(s.pct + "%", w - 20, yPos, { align: "right" });
        yPos += 6;
        doc.setFillColor(42, 42, 58);
        doc.roundedRect(20, yPos, w - 40, 4, 2, 2, "F");
        doc.setFillColor(...scoreColor);
        doc.roundedRect(20, yPos, (w - 40) * (s.pct / 100), 4, 2, 2, "F");
        yPos += 10;
        doc.setTextColor(...gray);
        doc.setFontSize(9);
        const recText = getRecommendation(s.id, s.pct);
        const recLines = doc.splitTextToSize(recText, w - 44);
        doc.text(recLines, 22, yPos);
        yPos += recLines.length * 4.5 + 12;
      });
      doc.setTextColor(100, 100, 120);
      doc.setFontSize(8);
      doc.text("\xA9 2026 Steven Seidenfaden Wensley | stevenwensley.com", w / 2, h - 10, { align: "center" });
      doc.addPage();
      doc.setFillColor(...dark);
      doc.rect(0, 0, w, h, "F");
      doc.setTextColor(...gold);
      doc.setFontSize(20);
      doc.text(t("N\xE6ste skridt", "Next Steps"), w / 2, 25, { align: "center" });
      doc.setTextColor(...white);
      doc.setFontSize(12);
      doc.text(t("1. Book en gratis samtale p\xE5 30 minutter", "1. Book a free 30-minute call"), 20, 50);
      doc.setTextColor(...gray);
      doc.setFontSize(10);
      const step1 = doc.splitTextToSize(t(
        "Vi gennemg\xE5r din score sammen, og du f\xE5r et konkret bud p\xE5 n\xE6ste skridt. Gratis, 30 minutter.",
        "We go through your score together and you get a concrete next step. Free, 30 minutes."
      ), w - 44);
      doc.text(step1, 22, 58);
      doc.setTextColor(...white);
      doc.setFontSize(12);
      doc.text(t("2. Download governance-templates", "2. Download governance templates"), 20, 80);
      doc.setTextColor(...gray);
      doc.setFontSize(10);
      const step2 = doc.splitTextToSize(t(
        "AI System Register, Risk Assessment Framework, RACI Matrix, og EU AI Act Compliance Checklist.",
        "AI System Registry, Risk Assessment Framework, RACI Matrix, and EU AI Act Compliance Checklist."
      ), w - 44);
      doc.text(step2, 22, 88);
      doc.setTextColor(...white);
      doc.setFontSize(12);
      doc.text(t("3. Kontakt", "3. Contact"), 20, 110);
      doc.setTextColor(...gray);
      doc.setFontSize(10);
      doc.text("Steven Seidenfaden Wensley", 22, 118);
      doc.text("Senior Program & Transition Manager | AI Governance", 22, 124);
      doc.text("steven.wensley@gmail.com | +45 53886061", 22, 130);
      doc.text("stevenwensley.com/book-session", 22, 136);
      doc.text("linkedin.com/in/stevenwensley", 22, 142);
      doc.setTextColor(100, 100, 120);
      doc.setFontSize(8);
      doc.text("\xA9 2026 Steven Seidenfaden Wensley | stevenwensley.com", w / 2, h - 10, { align: "center" });
      doc.save("AI-Governance-Report-" + (/* @__PURE__ */ new Date()).toISOString().split("T")[0] + ".pdf");
    };
    const handlePdfClick = () => {
      if (email && email.includes("@")) {
        generatePDF();
      } else {
        setShowPdfGate(true);
      }
    };
    const handlePdfGateSubmit = () => {
      if (pdfEmail && pdfEmail.includes("@")) {
        const dimScores = scores.reduce((acc, s) => {
          acc[s.name] = s.pct + "%";
          return acc;
        }, {});
        fetch("https://formspree.io/f/xpqjldbp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _subject: "AI Governance Assessment \u2014 PDF download lead",
            email: pdfEmail,
            samlet_score: totalPct + "%",
            ...dimScores
          })
        }).catch(() => {
        });
        setEmail(pdfEmail);
        setShowPdfGate(false);
        generatePDF();
      }
    };
    const handleFinish = () => {
      setShowEmailPrompt(true);
    };
    const handleShowResults = () => {
      if (email && email.includes("@")) {
        const dimScores = scores.reduce((acc, s) => {
          acc[s.name] = s.pct + "%";
          return acc;
        }, {});
        fetch("https://formspree.io/f/xpqjldbp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _subject: "AI Governance Assessment \u2014 ny lead",
            email,
            branche: industry || "Ikke angivet",
            samlet_score: totalPct + "%",
            ...dimScores
          })
        }).catch(() => {
        });
      }
      setShowEmailPrompt(false);
      setShowResults(true);
    };
    if (showResults) {
      const sortedScores = [...scores].sort((a, b) => a.pct - b.pct);
      return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", background: "#0C0C12", color: "#E8E8ED", fontFamily: "'Space Grotesk', -apple-system, sans-serif" } }, showPdfGate && /* @__PURE__ */ React.createElement(
        "div",
        {
          style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1e3, display: "flex", alignItems: "center", justifyContent: "center" },
          onClick: (e) => {
            if (e.target === e.currentTarget) setShowPdfGate(false);
          }
        },
        /* @__PURE__ */ React.createElement("div", { className: "fade-in", style: { background: "#161620", border: "1px solid #C9A96E44", borderRadius: 16, padding: 32, maxWidth: 400, width: "90%", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 36, marginBottom: 12 } }, "\u{1F4C4}"), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 18, fontWeight: 700, color: "#C9A96E", marginBottom: 8 } }, t("Indtast din email for PDF-rapporten", "Enter your email for the PDF report")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", marginBottom: 20, lineHeight: 1.5 } }, t("Vi sender dig kun rapporten \u2014 ingen spam.", "We'll only send you the report \u2014 no spam.")), /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "email",
            placeholder: t("Din arbejdsmail", "Your work email"),
            value: pdfEmail,
            onChange: (e) => setPdfEmail(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") handlePdfGateSubmit();
            },
            style: { width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #333", background: "#0C0C12", color: "#E8E8ED", fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }
          }
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: handlePdfGateSubmit,
            style: { width: "100%", background: "#C9A96E", color: "#0C0C12", padding: "12px 20px", borderRadius: 8, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", marginBottom: 8 },
            onMouseEnter: (e) => e.currentTarget.style.background = "#D4B896",
            onMouseLeave: (e) => e.currentTarget.style.background = "#C9A96E"
          },
          t("Download PDF", "Download PDF"),
          " \u2192"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => setShowPdfGate(false),
            style: { background: "transparent", border: "none", color: "#666", fontSize: 12, cursor: "pointer", padding: 4 }
          },
          t("Annuller", "Cancel")
        ))
      ), /* @__PURE__ */ React.createElement("div", { className: "fade-in", style: { maxWidth: 1e3, margin: "0 auto", padding: "40px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 40 } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: 28, fontWeight: 700, color: "#C9A96E", marginBottom: 8 } }, t("Din AI Governance Score", "Your AI Governance Score")), /* @__PURE__ */ React.createElement("div", { className: "score-anim", style: { fontSize: 72, fontWeight: 800, color: maturityLevel.color, lineHeight: 1 } }, totalScore, "%"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: 600, color: maturityLevel.color, marginTop: 8 } }, t(maturityLevel.level, maturityLevel.levelEN)), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15, color: "#9CA3AF", maxWidth: 600, margin: "16px auto 0", lineHeight: 1.6 } }, t(maturityLevel.desc, maturityLevel.descEN))), /* @__PURE__ */ React.createElement("div", { style: { background: "#161620", borderRadius: 16, padding: 32, marginBottom: 32 } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#C9A96E", marginBottom: 24, textAlign: "center" } }, t("Governance-profil", "Governance Profile")), (() => {
        const cx = 175, cy = 175, maxR = 130;
        const n = radarData.length;
        const angleStep = 2 * Math.PI / n;
        const startAngle = -Math.PI / 2;
        const getXY = (i, r) => ({
          x: cx + r * Math.cos(startAngle + i * angleStep),
          y: cy + r * Math.sin(startAngle + i * angleStep)
        });
        const gridLevels = [0.25, 0.5, 0.75, 1];
        const dataPoints = radarData.map((d, i) => getXY(i, d.score / 100 * maxR));
        const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
        const labelOffset = 18;
        return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 350 350", style: { width: "100%", maxWidth: 400, margin: "0 auto", display: "block" } }, gridLevels.map((lvl) => /* @__PURE__ */ React.createElement(
          "polygon",
          {
            key: lvl,
            points: Array.from({ length: n }, (_, i) => {
              const p = getXY(i, maxR * lvl);
              return `${p.x},${p.y}`;
            }).join(" "),
            fill: "none",
            stroke: "#2A2A3A",
            strokeWidth: 1
          }
        )), Array.from({ length: n }, (_, i) => {
          const p = getXY(i, maxR);
          return /* @__PURE__ */ React.createElement("line", { key: i, x1: cx, y1: cy, x2: p.x, y2: p.y, stroke: "#2A2A3A", strokeWidth: 1 });
        }), /* @__PURE__ */ React.createElement("polygon", { points: polygon, fill: "#C9A96E", fillOpacity: 0.25, stroke: "#C9A96E", strokeWidth: 2 }), dataPoints.map((p, i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: p.x, cy: p.y, r: 4, fill: "#C9A96E" })), radarData.map((d, i) => {
          const p = getXY(i, maxR + labelOffset);
          const anchor = p.x < cx - 10 ? "end" : p.x > cx + 10 ? "start" : "middle";
          return /* @__PURE__ */ React.createElement(
            "text",
            {
              key: i,
              x: p.x,
              y: p.y,
              textAnchor: anchor,
              dominantBaseline: "central",
              fill: "#9CA3AF",
              fontSize: 11,
              fontFamily: "Inter, sans-serif"
            },
            d.subject
          );
        }));
      })()), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 32 } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#C9A96E", marginBottom: 16 } }, t("Dimensioner (svageste f\xF8rst)", "Dimensions (weakest first)")), sortedScores.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.id, style: { background: "#161620", borderRadius: 12, padding: 20, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, s.icon, " ", s.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20, fontWeight: 700, color: s.pct <= 40 ? "#EF4444" : s.pct <= 70 ? "#F59E0B" : "#22C55E" } }, s.pct, "%")), /* @__PURE__ */ React.createElement("div", { style: { height: 6, background: "#2A2A3A", borderRadius: 3, overflow: "hidden", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${s.pct}%`, background: s.pct <= 40 ? "#EF4444" : s.pct <= 70 ? "#F59E0B" : "#22C55E", borderRadius: 3, transition: "width 0.8s ease" } })), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", lineHeight: 1.6, margin: 0 } }, getRecommendation(s.id, s.pct))))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 32 } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#C9A96E", marginBottom: 20 } }, t("N\xE6ste skridt", "Next Steps")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 } }, /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "slide-up",
          style: { background: "linear-gradient(135deg, #C9A96E22 0%, #C9A96E11 100%)", border: "1px solid #C9A96E44", borderRadius: 16, padding: 28, transition: "all 0.3s ease", cursor: "pointer" },
          onMouseEnter: (e) => {
            e.currentTarget.style.borderColor = "#C9A96E";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(201, 169, 110, 0.15)";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.borderColor = "#C9A96E44";
            e.currentTarget.style.boxShadow = "none";
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, marginBottom: 12 } }, "\u{1F4C4}"),
        /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 16, fontWeight: 700, color: "#C9A96E", marginBottom: 8 } }, t("Download din personlige rapport", "Download your personal report")),
        /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", marginBottom: 16, lineHeight: 1.5 } }, t("F\xE5 en PDF med din score, radar chart og skr\xE6ddersyede anbefalinger for alle 6 dimensioner.", "Get a PDF with your score, radar chart, and tailored recommendations for all 6 dimensions.")),
        /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: handlePdfClick,
            style: { width: "100%", background: "#C9A96E", color: "#0C0C12", padding: "12px 20px", borderRadius: 8, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s ease" },
            onMouseEnter: (e) => e.currentTarget.style.background = "#D4B896",
            onMouseLeave: (e) => e.currentTarget.style.background = "#C9A96E"
          },
          t("Download PDF", "Download PDF"),
          " \u2192"
        )
      ), /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "slide-up",
          style: { background: "linear-gradient(135deg, #1A3A52 0%, #0F2A3D 100%)", border: "1px solid #1E5A8E", borderRadius: 16, padding: 28, transition: "all 0.3s ease", cursor: "pointer" },
          onMouseEnter: (e) => {
            e.currentTarget.style.borderColor = "#2A7CB8";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(42, 124, 184, 0.15)";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.borderColor = "#1E5A8E";
            e.currentTarget.style.boxShadow = "none";
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, marginBottom: 12 } }, "\u{1F4C5}"),
        /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 16, fontWeight: 700, color: "#60A5FA", marginBottom: 4 } }, t("Gratis samtale", "Free call")),
        /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, background: "#059669", color: "#fff", padding: "4px 10px", borderRadius: 4, display: "inline-block", marginBottom: 12, fontWeight: 600 } }, t("30 minutter \xB7 gratis", "30 minutes \xB7 free")),
        /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", marginBottom: 16, lineHeight: 1.5 } }, t("Jeg gennemg\xE5r din score og laver en konkret handlingsplan for din organisation.", "I'll review your score and create a concrete action plan for your organisation.")),
        /* @__PURE__ */ React.createElement(
          "a",
          {
            href: "/book-session",
            style: { display: "block", width: "100%", background: "#2A7CB8", color: "#fff", padding: "12px 20px", borderRadius: 8, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", textAlign: "center", transition: "all 0.2s ease", textDecoration: "none" },
            onMouseEnter: (e) => e.currentTarget.style.background = "#3A8CC8",
            onMouseLeave: (e) => e.currentTarget.style.background = "#2A7CB8"
          },
          t("Book session", "Book session"),
          " \u2192"
        )
      ), /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "slide-up",
          style: { background: "linear-gradient(135deg, #1A1A2E 0%, #0A0A12 100%)", border: "1px solid #333", borderRadius: 16, padding: 28, transition: "all 0.3s ease", cursor: "pointer" },
          onMouseEnter: (e) => {
            e.currentTarget.style.borderColor = "#666";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 255, 255, 0.05)";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.borderColor = "#333";
            e.currentTarget.style.boxShadow = "none";
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, marginBottom: 12 } }, "\u{1F4CB}"),
        /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 16, fontWeight: 700, color: "#E8E8ED", marginBottom: 8 } }, t("Governance template-pakke", "Governance template package")),
        /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", marginBottom: 16, lineHeight: 1.5 } }, t("Download 4 gratis templates: AI System Register, Risk Assessment Framework, RACI Matrix, og EU AI Act Compliance Checklist.", "Download 4 free templates: AI System Registry, Risk Assessment Framework, RACI Matrix, and EU AI Act Compliance Checklist.")),
        /* @__PURE__ */ React.createElement(
          "a",
          {
            href: "/templates",
            style: { display: "block", width: "100%", background: "transparent", color: "#E8E8ED", padding: "12px 20px", borderRadius: 8, fontSize: 15, fontWeight: 700, border: "1px solid #666", cursor: "pointer", textAlign: "center", transition: "all 0.2s ease", textDecoration: "none" },
            onMouseEnter: (e) => {
              e.currentTarget.style.borderColor = "#999";
              e.currentTarget.style.color = "#C9A96E";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.borderColor = "#666";
              e.currentTarget.style.color = "#E8E8ED";
            }
          },
          t("Download templates", "Download templates"),
          " \u2192"
        )
      ))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 32, paddingTop: 32, borderTop: "1px solid #1A1A2A" } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#C9A96E", marginBottom: 16 } }, t("Direktkontakt", "Direct Contact")), /* @__PURE__ */ React.createElement("div", { style: { background: "#161620", borderRadius: 12, padding: 20 } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "#E8E8ED", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("strong", null, "Steven Seidenfaden Wensley")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", marginBottom: 12, lineHeight: 1.6 } }, "Senior Program & Transition Manager | AI Governance Specialist"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", marginBottom: 4 } }, "\u{1F4E7} steven.wensley@gmail.com"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", marginBottom: 4 } }, "\u{1F4F1} +45 53886061"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", marginBottom: 12 } }, "\u{1F517} ", /* @__PURE__ */ React.createElement("a", { href: "https://linkedin.com/in/stevenwensley", target: "_blank", rel: "noopener noreferrer", style: { color: "#C9A96E" } }, "linkedin.com/in/stevenwensley")))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 32 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            setShowResults(false);
            setAnswers({});
            setCurrentDim(0);
          },
          style: { background: "transparent", border: "1px solid #333", color: "#9CA3AF", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14 }
        },
        t("Tag testen igen", "Take the test again")
      ))));
    }
    if (showEmailPrompt) {
      return /* @__PURE__ */ React.createElement("div", { className: "fade-in", style: { minHeight: "100vh", background: "#0C0C12", color: "#E8E8ED", fontFamily: "'Space Grotesk', -apple-system, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 480, padding: 40, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 48, marginBottom: 16 } }, "\u{1F4CA}"), /* @__PURE__ */ React.createElement("h2", { style: { fontSize: 24, fontWeight: 700, color: "#C9A96E", marginBottom: 8 } }, t("Din governance-score er klar", "Your governance score is ready")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "#9CA3AF", marginBottom: 24, lineHeight: 1.6 } }, t(
        "Indtast din email for at modtage en fuld rapport med handlingsanbefalinger \u2014 eller se resultaterne med det samme.",
        "Enter your email to receive a full report with action recommendations \u2014 or view results immediately."
      )), /* @__PURE__ */ React.createElement(
        "select",
        {
          value: industry,
          onChange: (e) => setIndustry(e.target.value),
          style: { width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #333", background: "#161620", color: "#E8E8ED", fontSize: 14, marginBottom: 12, outline: "none" }
        },
        /* @__PURE__ */ React.createElement("option", { value: "" }, t("V\xE6lg branche (valgfrit)", "Select industry (optional)")),
        /* @__PURE__ */ React.createElement("option", { value: "pharma" }, t("Pharma / Life Science", "Pharma / Life Science")),
        /* @__PURE__ */ React.createElement("option", { value: "finance" }, t("Finans / Forsikring", "Finance / Insurance")),
        /* @__PURE__ */ React.createElement("option", { value: "public" }, t("Offentlig sektor", "Public sector")),
        /* @__PURE__ */ React.createElement("option", { value: "infrastructure" }, t("Kritisk infrastruktur / Energi", "Critical infrastructure / Energy")),
        /* @__PURE__ */ React.createElement("option", { value: "manufacturing" }, t("Produktion / Industri", "Manufacturing / Industry")),
        /* @__PURE__ */ React.createElement("option", { value: "tech" }, t("Tech / SaaS", "Tech / SaaS")),
        /* @__PURE__ */ React.createElement("option", { value: "other" }, t("Anden", "Other"))
      ), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "email",
          placeholder: t("Din arbejdsmail (valgfrit)", "Your work email (optional)"),
          value: email,
          onChange: (e) => setEmail(e.target.value),
          style: { width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #333", background: "#161620", color: "#E8E8ED", fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }
        }
      ), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "#666", marginBottom: 16 } }, t("Vi sender dig ikke spam \u2014 kun din personlige rapport.", "We won't spam you \u2014 only your personal report.")), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: handleShowResults,
          style: { width: "100%", background: "#C9A96E", color: "#0C0C12", padding: "14px 32px", borderRadius: 8, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", marginBottom: 12 }
        },
        t("Se min score", "View my score"),
        " \u2192"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: handleShowResults,
          style: { background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", padding: 8 }
        },
        t("Spring over \u2014 vis resultaterne", "Skip \u2014 show results")
      )));
    }
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", background: "#0C0C12", color: "#E8E8ED", fontFamily: "'Space Grotesk', -apple-system, sans-serif" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 700, margin: "0 auto", padding: "32px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("a", { href: "https://stevenwensley.com", style: { fontSize: 12, color: "#666", textDecoration: "none", display: "block", marginBottom: 4 } }, "\u2190 stevenwensley.com"), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 22, fontWeight: 700, color: "#C9A96E", margin: 0 } }, t("AI Governance Readiness", "AI Governance Readiness")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", margin: "4px 0 0" } }, t("30 sp\xF8rgsm\xE5l \xB7 6 dimensioner \xB7 5 minutter", "30 questions \xB7 6 dimensions \xB7 5 minutes"))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setLang(lang === "da" ? "en" : "da"),
        style: { background: "#161620", border: "1px solid #333", color: "#9CA3AF", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }
      },
      lang === "da" ? "\u{1F1EC}\u{1F1E7} EN" : "\u{1F1E9}\u{1F1F0} DA"
    )), /* @__PURE__ */ React.createElement("div", { style: { height: 4, background: "#1A1A2A", borderRadius: 2, marginBottom: 8, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${progress}%`, background: "#C9A96E", borderRadius: 2, transition: "width 0.3s ease" } })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#666", marginBottom: 24, textAlign: "right" } }, answeredCount, " / ", totalQuestions, " ", t("besvaret", "answered")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" } }, DIMENSIONS.map((d, i) => {
      const dimComplete = d.questions.every((_, qi) => answers[`${d.id}-${qi}`] !== void 0);
      const isActive = i === currentDim;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: d.id,
          onClick: () => setCurrentDim(i),
          style: {
            background: isActive ? "#C9A96E22" : "#161620",
            border: `1px solid ${isActive ? "#C9A96E" : dimComplete ? "#22C55E44" : "#2A2A3A"}`,
            color: isActive ? "#C9A96E" : dimComplete ? "#22C55E" : "#9CA3AF",
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: isActive ? 600 : 400,
            display: "flex",
            alignItems: "center",
            gap: 6
          }
        },
        d.icon,
        " ",
        t(d.name, d.nameEN),
        " ",
        dimComplete && "\u2713"
      );
    })), /* @__PURE__ */ React.createElement("div", { className: "fade-in", key: dim.id, style: { background: "#161620", borderRadius: 16, padding: 28 } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 } }, dim.icon, " ", t(dim.name, dim.nameEN)), dim.questions.map((question, qi) => {
      const key = `${dim.id}-${qi}`;
      const currentAnswer = answers[key];
      return /* @__PURE__ */ React.createElement("div", { key: qi, style: { marginBottom: 24, paddingBottom: 24, borderBottom: qi < dim.questions.length - 1 ? "1px solid #2A2A3A" : "none" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15, lineHeight: 1.6, marginBottom: 12, color: "#D1D5DB" } }, qi + 1, ". ", t(question.q, question.qEN)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, ANSWER_OPTIONS.map((opt) => /* @__PURE__ */ React.createElement(
        "button",
        {
          key: opt.value,
          onClick: () => handleAnswer(dim.id, qi, opt.value),
          style: {
            flex: 1,
            padding: "10px 16px",
            borderRadius: 8,
            border: `2px solid ${currentAnswer === opt.value ? opt.color : "#2A2A3A"}`,
            background: currentAnswer === opt.value ? opt.color + "22" : "transparent",
            color: currentAnswer === opt.value ? opt.color : "#9CA3AF",
            fontSize: 14,
            fontWeight: currentAnswer === opt.value ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }
        },
        t(opt.label, opt.labelEN)
      ))));
    })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 24 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentDim(Math.max(0, currentDim - 1)),
        disabled: currentDim === 0,
        style: { background: "#161620", border: "1px solid #2A2A3A", color: currentDim === 0 ? "#333" : "#9CA3AF", padding: "10px 24px", borderRadius: 8, cursor: currentDim === 0 ? "default" : "pointer", fontSize: 14 }
      },
      "\u2190 ",
      t("Forrige", "Previous")
    ), currentDim < DIMENSIONS.length - 1 ? /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentDim(currentDim + 1),
        style: { background: dimAnswered ? "#C9A96E" : "#161620", border: `1px solid ${dimAnswered ? "#C9A96E" : "#2A2A3A"}`, color: dimAnswered ? "#0C0C12" : "#9CA3AF", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: dimAnswered ? 700 : 400 }
      },
      t("N\xE6ste", "Next"),
      " \u2192"
    ) : /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleFinish,
        disabled: !allAnswered,
        style: { background: allAnswered ? "#C9A96E" : "#161620", border: `1px solid ${allAnswered ? "#C9A96E" : "#2A2A3A"}`, color: allAnswered ? "#0C0C12" : "#555", padding: "10px 32px", borderRadius: 8, cursor: allAnswered ? "pointer" : "default", fontSize: 14, fontWeight: 700 }
      },
      t("Se din score", "View your score"),
      " \u2192"
    )), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 48, paddingTop: 24, borderTop: "1px solid #1A1A2A" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 11, color: "#555", letterSpacing: "0.05em", marginBottom: 4 } }, "PMP \xB7 PRINCE2 \xB7 MSP \xB7 P3O \xB7 MoP \xB7 Agile PM \xB7 20 years in regulated environments"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: "#444" } }, "\xA9 2026 Steven Seidenfaden Wensley \xB7 ", /* @__PURE__ */ React.createElement("a", { href: "https://stevenwensley.com", style: { color: "#C9A96E55" } }, "stevenwensley.com")))));
  }
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(/* @__PURE__ */ React.createElement(AIGovernanceAssessment, null));
})();
