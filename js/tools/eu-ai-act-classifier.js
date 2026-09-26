// GENERATED from src/tools/eu-ai-act-classifier.jsx by scripts/build-tools.mjs — do not edit.
// Edit the .jsx and run: node scripts/build-tools.mjs
(() => {
  const { useState, useMemo, useCallback } = React;
  const RISK_CATEGORIES = {
    prohibited: {
      id: "prohibited",
      level: 4,
      name: "Forbudt",
      nameEN: "Prohibited",
      color: "#DC2626",
      icon: "\u{1F6AB}",
      articles: "Art. 5",
      desc: "Dit AI-system falder under de forbudte praksisser i EU AI Act Art. 5. Systemet m\xE5 IKKE bruges i EU efter 2. februar 2025.",
      descEN: "Your AI system falls under the prohibited practices in EU AI Act Art. 5. The system MUST NOT be used in the EU after February 2, 2025.",
      deadline: "2. februar 2025 \u2014 ALLEREDE G\xC6LDENDE",
      deadlineEN: "February 2, 2025 \u2014 ALREADY IN EFFECT"
    },
    high: {
      id: "high",
      level: 3,
      name: "H\xF8j Risiko",
      nameEN: "High Risk",
      color: "#EF4444",
      icon: "\u{1F534}",
      articles: "Art. 6, Annex I & III",
      desc: "Dit AI-system klassificeres som h\xF8j-risiko under EU AI Act. Det kr\xE6ver fuld conformity assessment, kvalitetsstyring, og l\xF8bende overv\xE5gning.",
      descEN: "Your AI system is classified as high-risk under the EU AI Act. It requires full conformity assessment, quality management, and ongoing monitoring.",
      deadline: "2. august 2026 (evt. udskudt til dec 2027 jf. Digital Omnibus)",
      deadlineEN: "August 2, 2026 (possibly postponed to Dec 2027 per Digital Omnibus)"
    },
    limited: {
      id: "limited",
      level: 2,
      name: "Begr\xE6nset Risiko",
      nameEN: "Limited Risk",
      color: "#F59E0B",
      icon: "\u{1F7E1}",
      articles: "Art. 50",
      desc: "Dit AI-system har transparensforpligtelser under EU AI Act Art. 50. Brugere skal informeres om, at de interagerer med AI.",
      descEN: "Your AI system has transparency obligations under EU AI Act Art. 50. Users must be informed they are interacting with AI.",
      deadline: "2. august 2026",
      deadlineEN: "August 2, 2026"
    },
    minimal: {
      id: "minimal",
      level: 1,
      name: "Minimal Risiko",
      nameEN: "Minimal Risk",
      color: "#22C55E",
      icon: "\u{1F7E2}",
      articles: "Art. 95 (frivillige adf\xE6rdskodekser)",
      desc: "Dit AI-system udg\xF8r minimal risiko. Der er ingen obligatoriske krav, men frivillige adf\xE6rdskodekser anbefales.",
      descEN: "Your AI system poses minimal risk. There are no mandatory requirements, but voluntary codes of conduct are recommended.",
      deadline: "Ingen obligatorisk deadline \u2014 frivillig compliance",
      deadlineEN: "No mandatory deadline \u2014 voluntary compliance"
    }
  };
  const INDUSTRY_OVERLAYS = {
    pharma: {
      name: "Pharma / Life Science",
      icon: "\u{1F48A}",
      regulations: [
        { name: "GxP / GAMP 5", nameEN: "GxP / GAMP 5", desc: "AI-systemer i GxP-processer kr\xE6ver validering iht. GAMP 5. Computeriserede systemer skal have kvalificeringsprotokol (IQ/OQ/PQ).", descEN: "AI systems in GxP processes require validation per GAMP 5. Computerized systems must have qualification protocol (IQ/OQ/PQ)." },
        { name: "EU GMP Annex 11", nameEN: "EU GMP Annex 11", desc: "Elektroniske systemer i pharma-produktion skal leve op til Annex 11 \u2014 herunder audit trail, adgangsstyring, og dataintegritets\xADkrav.", descEN: "Electronic systems in pharma production must comply with Annex 11 \u2014 including audit trail, access control, and data integrity requirements." },
        { name: "MDR 2017/745", nameEN: "MDR 2017/745", desc: "Hvis AI-systemet er del af et medicinsk udstyr, g\xE6lder MDR-krav om klinisk evaluering og post-market surveillance.", descEN: "If the AI system is part of a medical device, MDR requirements for clinical evaluation and post-market surveillance apply." }
      ],
      extra_requirements: [
        { req: "Validering af AI-model iht. GAMP 5 Category 5", reqEN: "Validation of AI model per GAMP 5 Category 5" },
        { req: "21 CFR Part 11 compliance (electronic records)", reqEN: "21 CFR Part 11 compliance (electronic records)" },
        { req: "Change control procedure for model updates", reqEN: "Change control procedure for model updates" },
        { req: "GxP-kvalificeret cloud-infrastruktur", reqEN: "GxP-qualified cloud infrastructure" }
      ]
    },
    manufacturing: {
      name: "Manufacturing / Industri",
      icon: "\u{1F3ED}",
      regulations: [
        { name: "Maskinforordningen 2023/1230", nameEN: "Machinery Regulation 2023/1230", desc: "AI i maskiner og safety-systemer er direkte reguleret af den nye maskinforordning. Tr\xE6der i kraft jan 2027.", descEN: "AI in machinery and safety systems is directly regulated by the new Machinery Regulation. Takes effect Jan 2027." },
        { name: "NIS2-direktivet", nameEN: "NIS2 Directive", desc: "Kritisk infrastruktur og industriel OT kr\xE6ver NIS2-compliance. Deadline: august 2026.", descEN: "Critical infrastructure and industrial OT requires NIS2 compliance. Deadline: August 2026." },
        { name: "IEC 62443 (OT Security)", nameEN: "IEC 62443 (OT Security)", desc: "AI i industrielle kontrolsystemer (ICS/SCADA) skal leve op til IEC 62443 cybersikkerhedskrav.", descEN: "AI in industrial control systems (ICS/SCADA) must meet IEC 62443 cybersecurity requirements." }
      ],
      extra_requirements: [
        { req: "CE-m\xE6rkning inkl. AI-komponent vurdering", reqEN: "CE marking including AI component assessment" },
        { req: "Safety-validering af AI i OT-milj\xF8er", reqEN: "Safety validation of AI in OT environments" },
        { req: "NIS2 risikostyring og h\xE6ndelsesrapportering", reqEN: "NIS2 risk management and incident reporting" },
        { req: "Supply chain security assessment", reqEN: "Supply chain security assessment" }
      ]
    },
    retail: {
      name: "Retail / E-commerce",
      icon: "\u{1F6D2}",
      regulations: [
        { name: "GDPR Art. 22", nameEN: "GDPR Art. 22", desc: "Automatiserede beslutninger om kunder (personalisering, kreditvurdering, prisoptimering) kr\xE6ver GDPR Art. 22 compliance.", descEN: "Automated decisions about customers (personalization, credit scoring, price optimization) require GDPR Art. 22 compliance." },
        { name: "PCI-DSS v4.0", nameEN: "PCI-DSS v4.0", desc: "AI i betalingsprocessering skal overholde PCI-DSS v4.0 \u2014 herunder encryption, access control, og penetrationstest.", descEN: "AI in payment processing must comply with PCI-DSS v4.0 \u2014 including encryption, access control, and penetration testing." },
        { name: "Forbrugerombudsmanden", nameEN: "Consumer Protection Authority", desc: "AI-baseret markedsf\xF8ring og prisoptimering skal overholde markedsf\xF8ringsloven og forbrugerbeskyttelse.", descEN: "AI-based marketing and price optimization must comply with marketing law and consumer protection." }
      ],
      extra_requirements: [
        { req: "GDPR Art. 22: Ret til menneskelig gennemgang af automatiserede beslutninger", reqEN: "GDPR Art. 22: Right to human review of automated decisions" },
        { req: "Transparens om AI-personalisering overfor kunder", reqEN: "Transparency about AI personalization to customers" },
        { req: "Data minimering i anbefalingsmotorer", reqEN: "Data minimization in recommendation engines" },
        { req: "PCI-DSS compliance for AI i checkout-flows", reqEN: "PCI-DSS compliance for AI in checkout flows" }
      ]
    },
    finance: {
      name: "Finans / Forsikring",
      icon: "\u{1F3E6}",
      regulations: [
        { name: "DORA (Digital Operational Resilience Act)", nameEN: "DORA (Digital Operational Resilience Act)", desc: "Finansielle institutioner skal sikre digital operationel robusthed \u2014 inkl. AI-systemer. G\xE6lder fra jan 2025.", descEN: "Financial institutions must ensure digital operational resilience \u2014 incl. AI systems. Effective from Jan 2025." },
        { name: "MiFID II / IDD", nameEN: "MiFID II / IDD", desc: "AI i investerings- og forsikringsr\xE5dgivning skal leve op til MiFID II/IDD-krav om egnethed og best execution.", descEN: "AI in investment and insurance advice must comply with MiFID II/IDD requirements for suitability and best execution." },
        { name: "GDPR Art. 22 (kreditscoring)", nameEN: "GDPR Art. 22 (credit scoring)", desc: "AI-baseret kreditscoring og automatiserede beslutninger kr\xE6ver forklarbarhed og ret til menneskelig gennemgang.", descEN: "AI-based credit scoring and automated decisions require explainability and right to human review." }
      ],
      extra_requirements: [
        { req: "DORA ICT risk management for AI systems", reqEN: "DORA ICT risk management for AI systems" },
        { req: "Model Risk Management (SR 11-7 / EBA Guidelines)", reqEN: "Model Risk Management (SR 11-7 / EBA Guidelines)" },
        { req: "Forklarbarhed af AI-kreditbeslutninger til kunder", reqEN: "Explainability of AI credit decisions to customers" },
        { req: "Stresstest af AI-modeller under DORA", reqEN: "Stress testing of AI models under DORA" }
      ]
    },
    public: {
      name: "Offentlig Sektor",
      icon: "\u{1F3DB}\uFE0F",
      regulations: [
        { name: "Forvaltningsloven", nameEN: "Administrative Law", desc: "AI-beslutninger i den offentlige forvaltning skal overholde krav om begrundelse, partsh\xF8ring og aktindsigt.", descEN: "AI decisions in public administration must comply with requirements for justification, hearing, and access to documents." },
        { name: "Datatilsynets vejledning", nameEN: "Data Protection Authority Guidelines", desc: "Datatilsynet har s\xE6rlige forventninger til offentlige myndigheders brug af AI \u2014 herunder DPIA og transparens.", descEN: "The Data Protection Authority has specific expectations for public authorities' use of AI \u2014 including DPIA and transparency." },
        { name: "Digitaliseringsstyrelsens principper", nameEN: "Agency for Digital Government Principles", desc: "De 7 principper for ansvarlig AI i den offentlige sektor skal efterleves.", descEN: "The 7 principles for responsible AI in the public sector must be followed." }
      ],
      extra_requirements: [
        { req: "DPIA (Data Protection Impact Assessment) for alle AI-systemer", reqEN: "DPIA (Data Protection Impact Assessment) for all AI systems" },
        { req: "Borger-transparens: Oplys om AI-brug i afg\xF8relser", reqEN: "Citizen transparency: Disclose AI use in decisions" },
        { req: "Kontroll\xE9rbar forklarbarhed (ikke bare teknisk XAI)", reqEN: "Controllable explainability (not just technical XAI)" },
        { req: "Tilg\xE6ngelighed og non-diskrimination", reqEN: "Accessibility and non-discrimination" }
      ]
    }
  };
  const STEPS = [
    {
      id: "industry",
      type: "select",
      question: "Hvilken branche opererer din organisation i?",
      questionEN: "What industry does your organisation operate in?",
      options: [
        { value: "pharma", label: "Pharma / Life Science", labelEN: "Pharma / Life Science" },
        { value: "manufacturing", label: "Manufacturing / Industri", labelEN: "Manufacturing / Industry" },
        { value: "retail", label: "Retail / E-commerce", labelEN: "Retail / E-commerce" },
        { value: "finance", label: "Finans / Forsikring", labelEN: "Finance / Insurance" },
        { value: "public", label: "Offentlig Sektor", labelEN: "Public Sector" },
        { value: "tech", label: "Teknologi / SaaS", labelEN: "Technology / SaaS" },
        { value: "other", label: "Anden branche", labelEN: "Other industry" }
      ]
    },
    {
      id: "system_name",
      type: "text",
      question: "Hvad hedder dit AI-system? (kort navn)",
      questionEN: "What is the name of your AI system? (short name)",
      placeholder: "F.eks. Kundeservice-chatbot, Kvalitetskontrol-AI...",
      placeholderEN: "E.g. Customer service chatbot, Quality control AI..."
    },
    {
      id: "system_desc",
      type: "textarea",
      question: "Beskriv kort hvad dit AI-system g\xF8r.",
      questionEN: "Briefly describe what your AI system does.",
      placeholder: "Hvad er systemets form\xE5l? Hvem bruger det? Hvilke beslutninger st\xF8tter det?",
      placeholderEN: "What is the system's purpose? Who uses it? What decisions does it support?"
    },
    // ─── PROHIBITED CHECK (Art. 5) ───
    {
      id: "prohibited_social_scoring",
      type: "yesno",
      question: "Bruges systemet til at give borgere/kunder en generel 'tillids-score' baseret p\xE5 deres sociale adf\xE6rd?",
      questionEN: "Is the system used to assign citizens/customers a general 'trust score' based on their social behavior?",
      help: "Social scoring-systemer som i Kinas socialkredit-system er forbudt under Art. 5(1)(c).",
      helpEN: "Social scoring systems like China's social credit system are prohibited under Art. 5(1)(c)."
    },
    {
      id: "prohibited_subliminal",
      type: "yesno",
      question: "Bruges systemet til at manipulere menneskelig adf\xE6rd gennem skjulte teknikker (subliminal p\xE5virkning)?",
      questionEN: "Is the system used to manipulate human behavior through hidden techniques (subliminal influence)?",
      help: "AI der bevidst bruger teknikker under bevidsthedst\xE6rsklen til at p\xE5virke adf\xE6rd er forbudt under Art. 5(1)(a).",
      helpEN: "AI that deliberately uses techniques below the consciousness threshold to influence behavior is prohibited under Art. 5(1)(a)."
    },
    {
      id: "prohibited_biometric_mass",
      type: "yesno",
      question: "Bruges systemet til real-time biometrisk identifikation (ansigtsgenkendelse) i offentlige rum?",
      questionEN: "Is the system used for real-time biometric identification (facial recognition) in public spaces?",
      help: "Real-time biometrisk fjernidentifikation i offentlige rum er forbudt under Art. 5(1)(h), med meget begr\xE6nsede undtagelser for retsh\xE5ndh\xE6velse.",
      helpEN: "Real-time remote biometric identification in public spaces is prohibited under Art. 5(1)(h), with very limited law enforcement exceptions."
    },
    {
      id: "prohibited_emotion",
      type: "yesno",
      question: "Bruges systemet til at afl\xE6se medarbejderes eller elevers f\xF8lelser p\xE5 arbejdspladsen/i undervisning?",
      questionEN: "Is the system used to infer emotions of employees or students in the workplace/education?",
      help: "Emotionsgenkendelse p\xE5 arbejdspladsen og i uddannelsesinstitutioner er forbudt under Art. 5(1)(f).",
      helpEN: "Emotion recognition in the workplace and educational institutions is prohibited under Art. 5(1)(f)."
    },
    // ─── HIGH RISK CHECK (Art. 6, Annex III) ───
    {
      id: "high_safety",
      type: "yesno",
      question: "Er AI-systemet en sikkerhedskomponent i et produkt, der allerede er reguleret af EU-lovgivning (maskiner, medicinsk udstyr, k\xF8ret\xF8jer, luftfart)?",
      questionEN: "Is the AI system a safety component in a product already regulated by EU legislation (machinery, medical devices, vehicles, aviation)?",
      help: "Art. 6(1): AI-systemer der er sikkerhedskomponenter i produkter under Annex I (maskin-, medicinsk udstyr, bil-direktiv etc.) er automatisk h\xF8j-risiko.",
      helpEN: "Art. 6(1): AI systems that are safety components in products under Annex I (machinery, medical devices, vehicle directive, etc.) are automatically high-risk."
    },
    {
      id: "high_biometric",
      type: "yesno",
      question: "Bruges systemet til biometrisk identifikation eller kategorisering af personer?",
      questionEN: "Is the system used for biometric identification or categorization of persons?",
      help: "Annex III, pkt. 1: Biometriske systemer (undtagen forbudte) er h\xF8j-risiko.",
      helpEN: "Annex III, point 1: Biometric systems (except prohibited ones) are high-risk."
    },
    {
      id: "high_critical_infra",
      type: "yesno",
      question: "Bruges systemet til styring af kritisk infrastruktur (energi, vand, transport, tele)?",
      questionEN: "Is the system used for management of critical infrastructure (energy, water, transport, telecom)?",
      help: "Annex III, pkt. 2: AI i kritisk infrastruktur er h\xF8j-risiko.",
      helpEN: "Annex III, point 2: AI in critical infrastructure is high-risk."
    },
    {
      id: "high_education",
      type: "yesno",
      question: "Bruges systemet til at vurdere, optage eller eksaminere personer i uddannelse?",
      questionEN: "Is the system used to assess, admit, or examine persons in education?",
      help: "Annex III, pkt. 3: AI i uddannelsesadgang og vurdering er h\xF8j-risiko.",
      helpEN: "Annex III, point 3: AI in educational access and assessment is high-risk."
    },
    {
      id: "high_employment",
      type: "yesno",
      question: "Bruges systemet til rekruttering, HR-beslutninger, eller vurdering af medarbejdere?",
      questionEN: "Is the system used for recruitment, HR decisions, or evaluation of employees?",
      help: "Annex III, pkt. 4: AI i ans\xE6ttelse og HR-beslutninger er h\xF8j-risiko.",
      helpEN: "Annex III, point 4: AI in employment and HR decisions is high-risk."
    },
    {
      id: "high_essential_services",
      type: "yesno",
      question: "Bruges systemet til at vurdere adgang til offentlige ydelser, kredit, forsikring, eller n\xF8dtjenester?",
      questionEN: "Is the system used to assess access to public services, credit, insurance, or emergency services?",
      help: "Annex III, pkt. 5: AI der p\xE5virker adgang til essentielle tjenester er h\xF8j-risiko.",
      helpEN: "Annex III, point 5: AI affecting access to essential services is high-risk."
    },
    {
      id: "high_law_enforcement",
      type: "yesno",
      question: "Bruges systemet af retsh\xE5ndh\xE6vende myndigheder (politi, told, immigration)?",
      questionEN: "Is the system used by law enforcement authorities (police, customs, immigration)?",
      help: "Annex III, pkt. 6-8: AI i retsh\xE5ndh\xE6velse, migration, og demokratiske processer er h\xF8j-risiko.",
      helpEN: "Annex III, points 6-8: AI in law enforcement, migration, and democratic processes is high-risk."
    },
    // ─── LIMITED RISK CHECK (Art. 50) ───
    {
      id: "limited_chatbot",
      type: "yesno",
      question: "Interagerer systemet direkte med mennesker (chatbot, virtuel assistent, kundeservice-AI)?",
      questionEN: "Does the system interact directly with humans (chatbot, virtual assistant, customer service AI)?",
      help: "Art. 50(1): AI-systemer der interagerer med mennesker skal informere brugeren om, at de taler med en AI.",
      helpEN: "Art. 50(1): AI systems interacting with humans must inform users they are talking to an AI."
    },
    {
      id: "limited_deepfake",
      type: "yesno",
      question: "Genererer systemet syntetisk indhold (tekst, billeder, video, lyd) der ligner \xE6gte indhold?",
      questionEN: "Does the system generate synthetic content (text, images, video, audio) that resembles authentic content?",
      help: "Art. 50(2): Deepfakes og AI-genereret indhold skal m\xE6rkes tydeligt.",
      helpEN: "Art. 50(2): Deepfakes and AI-generated content must be clearly labeled."
    },
    // ─── CONTACT INFO ───
    {
      id: "contact",
      type: "contact",
      question: "Vil du modtage din rapport? (valgfrit)",
      questionEN: "Would you like to receive your report? (optional)"
    }
  ];
  const HIGH_RISK_REQUIREMENTS = [
    { art: "Art. 9", name: "Risikostyringssystem", nameEN: "Risk Management System", desc: "Etabl\xE9r og vedligehold et risikostyringssystem gennem hele AI-systemets livscyklus.", descEN: "Establish and maintain a risk management system throughout the AI system lifecycle.", timeline: "F\xF8r ibrugtagning", timelineEN: "Before deployment" },
    { art: "Art. 10", name: "Data & Data Governance", nameEN: "Data & Data Governance", desc: "Tr\xE6ningsdata skal opfylde kvalitetskriterier: relevant, repr\xE6sentativ, fejlfri, komplet.", descEN: "Training data must meet quality criteria: relevant, representative, error-free, complete.", timeline: "F\xF8r ibrugtagning", timelineEN: "Before deployment" },
    { art: "Art. 11", name: "Teknisk Dokumentation", nameEN: "Technical Documentation", desc: "Udf\xF8rlig teknisk dokumentation der demonstrerer compliance med alle krav.", descEN: "Comprehensive technical documentation demonstrating compliance with all requirements.", timeline: "F\xF8r ibrugtagning + l\xF8bende", timelineEN: "Before deployment + ongoing" },
    { art: "Art. 12", name: "Logning & Sporbarhed", nameEN: "Record-Keeping & Traceability", desc: "Automatisk logning af h\xE6ndelser der muligg\xF8r sporbarhed af AI-systemets funktionering.", descEN: "Automatic logging of events enabling traceability of the AI system's functioning.", timeline: "L\xF8bende", timelineEN: "Ongoing" },
    { art: "Art. 13", name: "Transparens & Information", nameEN: "Transparency & Information", desc: "Brugsvejledning og information til brugere om AI-systemets egenskaber, begr\xE6nsninger og risici.", descEN: "Instructions for use and information to users about the AI system's characteristics, limitations and risks.", timeline: "F\xF8r ibrugtagning", timelineEN: "Before deployment" },
    { art: "Art. 14", name: "Human Oversight", nameEN: "Human Oversight", desc: "AI-systemer skal designes s\xE5 mennesker kan overv\xE5ge, forst\xE5 og om n\xF8dvendigt overrule systemet.", descEN: "AI systems must be designed so humans can monitor, understand and if necessary override the system.", timeline: "Design-fase + l\xF8bende", timelineEN: "Design phase + ongoing" },
    { art: "Art. 15", name: "N\xF8jagtighed, Robusthed & Cybersikkerhed", nameEN: "Accuracy, Robustness & Cybersecurity", desc: "AI-systemer skal opn\xE5 passende n\xF8jagtighed, robusthed og cybersikkerhed.", descEN: "AI systems must achieve appropriate accuracy, robustness and cybersecurity.", timeline: "L\xF8bende", timelineEN: "Ongoing" },
    { art: "Art. 17", name: "Kvalitetsstyringssystem", nameEN: "Quality Management System", desc: "Dokumenteret kvalitetsstyringssystem med politikker, processer og procedurer.", descEN: "Documented quality management system with policies, processes and procedures.", timeline: "F\xF8r ibrugtagning + l\xF8bende", timelineEN: "Before deployment + ongoing" }
  ];
  function EUAIActClassifier() {
    const [lang, setLang] = useState(() => {
      try {
        return window.localStorage.getItem("preferred-lang") || "da";
      } catch {
        return "da";
      }
    });
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [showPdfGate, setShowPdfGate] = useState(false);
    const [pdfEmail, setPdfEmail] = useState("");
    const t = (da, en) => lang === "da" ? da : en;
    const toggleLang = () => {
      const next = lang === "da" ? "en" : "da";
      setLang(next);
      try {
        window.localStorage.setItem("preferred-lang", next);
      } catch {
      }
    };
    const step = STEPS[currentStep];
    const totalSteps = STEPS.length;
    const progress = currentStep / (totalSteps - 1) * 100;
    const handleAnswer = (value) => {
      setAnswers((prev) => ({ ...prev, [step.id]: value }));
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    };
    const handleTextSubmit = (value) => {
      setAnswers((prev) => ({ ...prev, [step.id]: value }));
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    };
    const goBack = () => {
      if (currentStep > 0) setCurrentStep(currentStep - 1);
    };
    const finishClassification = () => {
      setShowResults(true);
    };
    const classification = useMemo(() => {
      const a = answers;
      if (a.prohibited_social_scoring === "yes" || a.prohibited_subliminal === "yes" || a.prohibited_biometric_mass === "yes" || a.prohibited_emotion === "yes") {
        const triggers = [];
        if (a.prohibited_social_scoring === "yes") triggers.push({ art: "Art. 5(1)(c)", reason: t("Social scoring", "Social scoring") });
        if (a.prohibited_subliminal === "yes") triggers.push({ art: "Art. 5(1)(a)", reason: t("Subliminal manipulation", "Subliminal manipulation") });
        if (a.prohibited_biometric_mass === "yes") triggers.push({ art: "Art. 5(1)(h)", reason: t("Real-time biometrisk identifikation", "Real-time biometric identification") });
        if (a.prohibited_emotion === "yes") triggers.push({ art: "Art. 5(1)(f)", reason: t("Emotionsgenkendelse", "Emotion recognition") });
        return { ...RISK_CATEGORIES.prohibited, triggers };
      }
      const highTriggers = [];
      if (a.high_safety === "yes") highTriggers.push({ art: "Art. 6(1), Annex I", reason: t("Sikkerhedskomponent i reguleret produkt", "Safety component in regulated product") });
      if (a.high_biometric === "yes") highTriggers.push({ art: "Annex III, pkt. 1", reason: t("Biometrisk identifikation", "Biometric identification") });
      if (a.high_critical_infra === "yes") highTriggers.push({ art: "Annex III, pkt. 2", reason: t("Kritisk infrastruktur", "Critical infrastructure") });
      if (a.high_education === "yes") highTriggers.push({ art: "Annex III, pkt. 3", reason: t("Uddannelse", "Education") });
      if (a.high_employment === "yes") highTriggers.push({ art: "Annex III, pkt. 4", reason: t("Ans\xE6ttelse & HR", "Employment & HR") });
      if (a.high_essential_services === "yes") highTriggers.push({ art: "Annex III, pkt. 5", reason: t("Essentielle tjenester", "Essential services") });
      if (a.high_law_enforcement === "yes") highTriggers.push({ art: "Annex III, pkt. 6-8", reason: t("Retsh\xE5ndh\xE6velse", "Law enforcement") });
      if (highTriggers.length > 0) {
        return { ...RISK_CATEGORIES.high, triggers: highTriggers };
      }
      if (a.limited_chatbot === "yes" || a.limited_deepfake === "yes") {
        const triggers = [];
        if (a.limited_chatbot === "yes") triggers.push({ art: "Art. 50(1)", reason: t("Menneske-AI interaktion", "Human-AI interaction") });
        if (a.limited_deepfake === "yes") triggers.push({ art: "Art. 50(2)", reason: t("Syntetisk indhold", "Synthetic content") });
        return { ...RISK_CATEGORIES.limited, triggers };
      }
      return { ...RISK_CATEGORIES.minimal, triggers: [] };
    }, [answers, lang]);
    const industryOverlay = INDUSTRY_OVERLAYS[answers.industry] || null;
    const handlePdfClick = () => {
      setShowPdfGate(true);
    };
    const handlePdfGateSubmit = () => {
      if (pdfEmail && pdfEmail.includes("@")) {
        fetch("https://formspree.io/f/xpqjldbp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _subject: "stevenwensley.com \u2014 PDF download lead",
            email: pdfEmail,
            tool: document.title
          })
        }).catch(() => {
        });
        setShowPdfGate(false);
        generatePDF();
      }
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
      const hexToRgb = (hex) => {
        const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [200, 200, 200];
      };
      const riskColor = hexToRgb(classification.color);
      doc.setFillColor(...dark);
      doc.rect(0, 0, w, h, "F");
      doc.setTextColor(...gold);
      doc.setFontSize(26);
      doc.text("EU AI Act", w / 2, 40, { align: "center" });
      doc.text(t("Risikoklassificering", "Risk Classification"), w / 2, 52, { align: "center" });
      doc.setFontSize(11);
      doc.setTextColor(...gray);
      const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString(lang === "da" ? "da-DK" : "en-US", { year: "numeric", month: "long", day: "numeric" });
      doc.text(dateStr, w / 2, 66, { align: "center" });
      if (answers.system_name) {
        doc.setTextColor(...white);
        doc.setFontSize(14);
        doc.text(answers.system_name, w / 2, 82, { align: "center" });
      }
      doc.setDrawColor(...riskColor);
      doc.setLineWidth(2.5);
      doc.circle(w / 2, 120, 32);
      doc.setTextColor(...riskColor);
      doc.setFontSize(16);
      doc.text(classification.icon, w / 2, 113, { align: "center" });
      doc.setFontSize(14);
      doc.text(t(classification.name, classification.nameEN), w / 2, 125, { align: "center" });
      doc.setFontSize(9);
      doc.setTextColor(...gray);
      doc.text(classification.articles, w / 2, 133, { align: "center" });
      doc.setFontSize(11);
      doc.setTextColor(...gold);
      doc.text(t("Compliance-deadline:", "Compliance deadline:"), w / 2, 170, { align: "center" });
      doc.setTextColor(...white);
      doc.setFontSize(10);
      doc.text(t(classification.deadline, classification.deadlineEN), w / 2, 178, { align: "center" });
      if (classification.triggers && classification.triggers.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(...gold);
        doc.text(t("Udl\xF8sende faktorer:", "Triggering factors:"), w / 2, 195, { align: "center" });
        let ty = 204;
        doc.setFontSize(9);
        classification.triggers.forEach((tr) => {
          doc.setTextColor(...riskColor);
          doc.text(tr.art, w / 2 - 40, ty);
          doc.setTextColor(...white);
          doc.text("  " + tr.reason, w / 2 - 40 + doc.getTextWidth(tr.art) + 2, ty);
          ty += 6;
        });
      }
      doc.setFontSize(8);
      doc.setTextColor(...gray);
      doc.text("stevenwensley.com | AI Governance Specialist", w / 2, h - 15, { align: "center" });
      doc.text(t("Fortroligt \u2014 kun til internt brug", "Confidential \u2014 for internal use only"), w / 2, h - 10, { align: "center" });
      doc.addPage();
      doc.setFillColor(...dark);
      doc.rect(0, 0, w, h, "F");
      doc.setTextColor(...gold);
      doc.setFontSize(18);
      doc.text(t("Krav & Handlingsplan", "Requirements & Action Plan"), 15, 25);
      let yPos = 40;
      if (classification.id === "high") {
        doc.setFontSize(10);
        doc.setTextColor(...white);
        doc.text(t("Obligatoriske krav for h\xF8j-risiko AI-systemer (Art. 8-15 + Art. 17):", "Mandatory requirements for high-risk AI systems (Art. 8-15 + Art. 17):"), 15, yPos);
        yPos += 10;
        HIGH_RISK_REQUIREMENTS.forEach((req) => {
          if (yPos > h - 40) {
            doc.addPage();
            doc.setFillColor(...dark);
            doc.rect(0, 0, w, h, "F");
            yPos = 25;
          }
          doc.setFillColor(30, 30, 42);
          doc.roundedRect(15, yPos - 4, w - 30, 20, 2, 2, "F");
          doc.setTextColor(...gold);
          doc.setFontSize(9);
          doc.text(req.art, 18, yPos + 2);
          doc.setTextColor(...white);
          doc.setFontSize(9);
          doc.text(t(req.name, req.nameEN), 18 + doc.getTextWidth(req.art + "  "), yPos + 2);
          doc.setTextColor(...gray);
          doc.setFontSize(8);
          const descLines = doc.splitTextToSize(t(req.desc, req.descEN), w - 40);
          doc.text(descLines, 18, yPos + 9);
          doc.setTextColor(...gold);
          doc.setFontSize(7);
          doc.text(t(req.timeline, req.timelineEN), w - 18, yPos + 2, { align: "right" });
          yPos += 24;
        });
      } else if (classification.id === "limited") {
        doc.setFontSize(10);
        doc.setTextColor(...white);
        const limitedReqs = [
          { title: t("Art. 50(1): Informationspligt", "Art. 50(1): Information Duty"), desc: t("Brugere skal informeres om, at de interagerer med et AI-system \u2014 medmindre det er \xE5benlyst ud fra konteksten.", "Users must be informed they are interacting with an AI system \u2014 unless it is obvious from the context.") },
          { title: t("Art. 50(2): M\xE6rkning af AI-indhold", "Art. 50(2): Labeling of AI Content"), desc: t("AI-genereret indhold (tekst, billeder, video, lyd) skal m\xE6rkes maskinl\xE6sbart som AI-genereret.", "AI-generated content (text, images, video, audio) must be machine-readably labeled as AI-generated.") },
          { title: t("Art. 50(4): Deepfake-disclosure", "Art. 50(4): Deepfake Disclosure"), desc: t("Syntetisk indhold der forestiller eksisterende personer eller h\xE6ndelser skal tydeligt m\xE6rkes som AI-genereret.", "Synthetic content depicting existing persons or events must be clearly labeled as AI-generated.") }
        ];
        limitedReqs.forEach((req) => {
          doc.setTextColor(...gold);
          doc.setFontSize(10);
          doc.text(req.title, 18, yPos);
          yPos += 6;
          doc.setTextColor(...gray);
          doc.setFontSize(9);
          const lines = doc.splitTextToSize(req.desc, w - 40);
          doc.text(lines, 18, yPos);
          yPos += lines.length * 5 + 8;
        });
      } else if (classification.id === "prohibited") {
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(14);
        doc.text(t("\u26A0\uFE0F SYSTEMET ER FORBUDT", "\u26A0\uFE0F SYSTEM IS PROHIBITED"), w / 2, yPos, { align: "center" });
        yPos += 12;
        doc.setTextColor(...white);
        doc.setFontSize(10);
        const forbLines = doc.splitTextToSize(t(
          "Dit AI-system falder under de forbudte praksisser i EU AI Act Art. 5. Systemet skal straks tages ud af brug eller omdesignes fundamentalt.",
          "Your AI system falls under the prohibited practices in EU AI Act Art. 5. The system must be immediately taken out of use or fundamentally redesigned."
        ), w - 40);
        doc.text(forbLines, 18, yPos);
        yPos += forbLines.length * 5 + 10;
        doc.setTextColor(...gold);
        doc.setFontSize(11);
        doc.text(t("Anbefalede handlinger:", "Recommended actions:"), 18, yPos);
        yPos += 8;
        const actions = [
          t("1. Stop brugen af systemet omg\xE5ende", "1. Stop using the system immediately"),
          t("2. Vurd\xE9r om systemet kan omdesignes til compliance", "2. Assess if the system can be redesigned for compliance"),
          t("3. S\xF8g juridisk r\xE5dgivning om overgangsordninger", "3. Seek legal advice on transitional arrangements"),
          t("4. Dokument\xE9r beslutningen og rationale", "4. Document the decision and rationale")
        ];
        doc.setTextColor(...white);
        doc.setFontSize(9);
        actions.forEach((action) => {
          doc.text(action, 22, yPos);
          yPos += 6;
        });
      } else {
        doc.setTextColor(...white);
        doc.setFontSize(10);
        const minLines = doc.splitTextToSize(t(
          "Dit AI-system udg\xF8r minimal risiko under EU AI Act. Der er ingen obligatoriske krav, men Kommissionen opfordrer til frivillige adf\xE6rdskodekser (Art. 95). Vi anbefaler alligevel grundl\xE6ggende governance-praksis.",
          "Your AI system poses minimal risk under the EU AI Act. There are no mandatory requirements, but the Commission encourages voluntary codes of conduct (Art. 95). We still recommend basic governance practices."
        ), w - 40);
        doc.text(minLines, 18, yPos);
        yPos += minLines.length * 5 + 10;
        const bestPractices = [
          t("\u2713 Dokument\xE9r AI-systemet i et internt register", "\u2713 Document the AI system in an internal register"),
          t("\u2713 Inform\xE9r brugere om AI-interaktion (god praksis)", "\u2713 Inform users about AI interaction (good practice)"),
          t("\u2713 Monitor\xE9r performance og bias l\xF8bende", "\u2713 Monitor performance and bias continuously"),
          t("\u2713 Overvej frivillig conformity assessment", "\u2713 Consider voluntary conformity assessment")
        ];
        doc.setFontSize(9);
        bestPractices.forEach((bp) => {
          doc.text(bp, 22, yPos);
          yPos += 6;
        });
      }
      if (industryOverlay) {
        doc.addPage();
        doc.setFillColor(...dark);
        doc.rect(0, 0, w, h, "F");
        doc.setTextColor(...gold);
        doc.setFontSize(18);
        doc.text(t("Branche-specifik regulering", "Industry-Specific Regulation"), 15, 25);
        doc.setFontSize(12);
        doc.text(industryOverlay.icon + " " + industryOverlay.name, 15, 36);
        let iy = 48;
        industryOverlay.regulations.forEach((reg) => {
          if (iy > h - 50) {
            doc.addPage();
            doc.setFillColor(...dark);
            doc.rect(0, 0, w, h, "F");
            iy = 25;
          }
          doc.setFillColor(30, 30, 42);
          doc.roundedRect(15, iy - 4, w - 30, 22, 2, 2, "F");
          doc.setTextColor(...gold);
          doc.setFontSize(10);
          doc.text(t(reg.name, reg.nameEN), 18, iy + 2);
          doc.setTextColor(...gray);
          doc.setFontSize(8);
          const rLines = doc.splitTextToSize(t(reg.desc, reg.descEN), w - 42);
          doc.text(rLines, 18, iy + 9);
          iy += 26;
        });
        iy += 6;
        doc.setTextColor(...gold);
        doc.setFontSize(11);
        doc.text(t("Ekstra krav for din branche:", "Additional requirements for your industry:"), 15, iy);
        iy += 8;
        doc.setTextColor(...white);
        doc.setFontSize(9);
        industryOverlay.extra_requirements.forEach((er) => {
          doc.text("\u2022 " + t(er.req, er.reqEN), 20, iy);
          iy += 6;
        });
      }
      doc.addPage();
      doc.setFillColor(...dark);
      doc.rect(0, 0, w, h, "F");
      doc.setTextColor(...gold);
      doc.setFontSize(18);
      doc.text(t("N\xE6ste Skridt", "Next Steps"), 15, 25);
      let ny = 40;
      doc.setTextColor(...white);
      doc.setFontSize(10);
      const nextSteps = [
        { n: "1", title: t("Book en gratis AI Governance strategi-session", "Book a free AI Governance strategy session"), desc: t("1 dags intensivt forl\xF8b. Vi gennemg\xE5r jeres AI-systemer, regulatoriske krav, og laver en 90-dages handlingsplan.", "1 day intensive session. We review your AI systems, regulatory requirements, and create a 90-day action plan.") },
        { n: "2", title: t("Download vores governance-templates", "Download our governance templates"), desc: t("AI System Registry, Risk Assessment Framework, RACI Matrix, EU AI Act Checklist \u2014 klar til brug.", "AI System Registry, Risk Assessment Framework, RACI Matrix, EU AI Act Checklist \u2014 ready to use.") },
        { n: "3", title: t("Tag vores fulde AI Governance Readiness Assessment", "Take our full AI Governance Readiness Assessment"), desc: t("30 sp\xF8rgsm\xE5l, 6 dimensioner, 5 minutter. F\xE5 et komplet billede af jeres governance-modenhed.", "30 questions, 6 dimensions, 5 minutes. Get a complete picture of your governance maturity.") }
      ];
      nextSteps.forEach((ns) => {
        doc.setFillColor(30, 30, 42);
        doc.roundedRect(15, ny - 4, w - 30, 20, 2, 2, "F");
        doc.setTextColor(...gold);
        doc.setFontSize(18);
        doc.text(ns.n, 22, ny + 6);
        doc.setTextColor(...white);
        doc.setFontSize(10);
        doc.text(ns.title, 32, ny + 2);
        doc.setTextColor(...gray);
        doc.setFontSize(8);
        const dLines = doc.splitTextToSize(ns.desc, w - 50);
        doc.text(dLines, 32, ny + 9);
        ny += 25;
      });
      ny += 15;
      doc.setTextColor(...gold);
      doc.setFontSize(12);
      doc.text("Steven Wensley", w / 2, ny, { align: "center" });
      doc.setTextColor(...gray);
      doc.setFontSize(9);
      doc.text("AI Governance Specialist", w / 2, ny + 7, { align: "center" });
      doc.text("steven.wensley@gmail.com  |  +45 5388 6061", w / 2, ny + 14, { align: "center" });
      doc.text("stevenwensley.com  |  linkedin.com/in/stevenwensley", w / 2, ny + 21, { align: "center" });
      doc.setFontSize(8);
      doc.setTextColor(...gray);
      doc.text(t("Fortroligt \u2014 kun til internt brug", "Confidential \u2014 for internal use only"), w / 2, h - 10, { align: "center" });
      const systemName = (answers.system_name || "AI-System").replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, "").replace(/\s+/g, "-");
      doc.save(`EU-AI-Act-Klassificering-${systemName}-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf`);
    };
    const submitLead = (email, org) => {
      if (!email) return;
      fetch("https://formspree.io/f/xpqjldbp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          organisation: org || "",
          industry: answers.industry || "",
          system_name: answers.system_name || "",
          classification: classification.id,
          source: "eu-ai-act-classifier"
        })
      }).catch(() => {
      });
    };
    if (showResults) {
      return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", background: "#0C0C12" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid rgba(201,169,110,0.12)" } }, /* @__PURE__ */ React.createElement("a", { href: "/", style: { color: "#C9A96E", fontSize: 14, textDecoration: "none" } }, "\u2190 ", t("Tilbage", "Back")), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "'DM Serif Display', serif", color: "#C9A96E", fontSize: 18 } }, "Steven Wensley"), /* @__PURE__ */ React.createElement("button", { onClick: toggleLang, style: { background: "transparent", border: "1px solid rgba(201,169,110,0.3)", color: "#C9A96E", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 } }, lang === "da" ? "EN" : "DA")), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 900, margin: "0 auto", padding: "40px 20px" }, className: "fade-in" }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 40 } }, /* @__PURE__ */ React.createElement("div", { className: "score-anim", style: { display: "inline-flex", flexDirection: "column", alignItems: "center", padding: "30px 50px", border: `3px solid ${classification.color}`, borderRadius: 20, background: `${classification.color}11` } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 48 } }, classification.icon), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 28, fontWeight: 800, color: classification.color, marginTop: 8 } }, t(classification.name, classification.nameEN)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#9a9aaa", marginTop: 4 } }, classification.articles))), answers.system_name && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 30 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20, fontWeight: 700, color: "#E8E8ED" } }, answers.system_name), answers.system_desc && /* @__PURE__ */ React.createElement("p", { style: { color: "#9a9aaa", fontSize: 14, marginTop: 8, maxWidth: 600, margin: "8px auto 0" } }, answers.system_desc)), /* @__PURE__ */ React.createElement("div", { style: { background: "#1a1a26", borderRadius: 12, padding: 24, marginBottom: 24, border: "1px solid rgba(201,169,110,0.12)" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15, lineHeight: 1.7, color: "#E8E8ED" } }, t(classification.desc, classification.descEN))), /* @__PURE__ */ React.createElement("div", { style: { background: `${classification.color}15`, borderRadius: 12, padding: 20, marginBottom: 24, border: `1px solid ${classification.color}33` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20 } }, "\u23F0"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#C9A96E", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 } }, t("Compliance-deadline", "Compliance Deadline")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: "#E8E8ED", fontWeight: 600, marginTop: 2 } }, t(classification.deadline, classification.deadlineEN))))), classification.triggers && classification.triggers.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 30 } }, /* @__PURE__ */ React.createElement("h3", { style: { color: "#C9A96E", fontSize: 16, fontWeight: 700, marginBottom: 12 } }, t("Udl\xF8sende faktorer", "Triggering Factors")), classification.triggers.map((tr, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "#1a1a26", borderRadius: 8, marginBottom: 8, border: "1px solid rgba(201,169,110,0.08)" } }, /* @__PURE__ */ React.createElement("span", { style: { color: classification.color, fontWeight: 700, fontSize: 13, minWidth: 120 } }, tr.art), /* @__PURE__ */ React.createElement("span", { style: { color: "#E8E8ED", fontSize: 14 } }, tr.reason)))), classification.id === "high" && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 30 } }, /* @__PURE__ */ React.createElement("h3", { style: { color: "#C9A96E", fontSize: 16, fontWeight: 700, marginBottom: 16 } }, t("Obligatoriske krav (Art. 8-15 + Art. 17)", "Mandatory Requirements (Art. 8-15 + Art. 17)")), HIGH_RISK_REQUIREMENTS.map((req, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "slide-up", style: { background: "#1a1a26", borderRadius: 10, padding: 18, marginBottom: 10, border: "1px solid rgba(201,169,110,0.08)", animationDelay: `${i * 0.05}s` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#C9A96E", fontSize: 12, fontWeight: 700 } }, req.art), /* @__PURE__ */ React.createElement("span", { style: { color: "#E8E8ED", fontSize: 14, fontWeight: 600, marginLeft: 10 } }, t(req.name, req.nameEN))), /* @__PURE__ */ React.createElement("span", { style: { color: "#F59E0B", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" } }, t(req.timeline, req.timelineEN))), /* @__PURE__ */ React.createElement("p", { style: { color: "#9a9aaa", fontSize: 13, lineHeight: 1.6 } }, t(req.desc, req.descEN))))), classification.id === "limited" && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 30 } }, /* @__PURE__ */ React.createElement("h3", { style: { color: "#C9A96E", fontSize: 16, fontWeight: 700, marginBottom: 16 } }, t("Transparensforpligtelser (Art. 50)", "Transparency Obligations (Art. 50)")), /* @__PURE__ */ React.createElement("div", { style: { background: "#1a1a26", borderRadius: 10, padding: 18, marginBottom: 10, border: "1px solid rgba(201,169,110,0.08)" } }, /* @__PURE__ */ React.createElement("p", { style: { color: "#E8E8ED", fontSize: 14, lineHeight: 1.7 } }, t(
        "Brugere skal informeres om, at de interagerer med et AI-system (Art. 50(1)). AI-genereret indhold skal m\xE6rkes maskinl\xE6sbart (Art. 50(2)). Deepfakes der forestiller eksisterende personer skal tydeligt disclosure's (Art. 50(4)).",
        "Users must be informed they are interacting with an AI system (Art. 50(1)). AI-generated content must be machine-readably labeled (Art. 50(2)). Deepfakes depicting existing persons must be clearly disclosed (Art. 50(4))."
      )))), industryOverlay && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 30 } }, /* @__PURE__ */ React.createElement("h3", { style: { color: "#C9A96E", fontSize: 16, fontWeight: 700, marginBottom: 16 } }, industryOverlay.icon, " ", t("Branche-specifik regulering", "Industry-Specific Regulation"), ": ", industryOverlay.name), industryOverlay.regulations.map((reg, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: "#1a1a26", borderRadius: 10, padding: 18, marginBottom: 10, border: "1px solid rgba(201,169,110,0.08)" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#C9A96E", fontSize: 14, fontWeight: 700, marginBottom: 6 } }, t(reg.name, reg.nameEN)), /* @__PURE__ */ React.createElement("p", { style: { color: "#9a9aaa", fontSize: 13, lineHeight: 1.6 } }, t(reg.desc, reg.descEN)))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#C9A96E", fontSize: 13, fontWeight: 600, marginBottom: 8 } }, t("Ekstra branche-krav:", "Additional industry requirements:")), industryOverlay.extra_requirements.map((er, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 8, padding: "6px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#C9A96E" } }, "\u2192"), /* @__PURE__ */ React.createElement("span", { style: { color: "#E8E8ED", fontSize: 13 } }, t(er.req, er.reqEN)))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginTop: 40 } }, /* @__PURE__ */ React.createElement("button", { onClick: handlePdfClick, style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 24px", background: "#C9A96E", color: "#0C0C12", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" } }, "\u{1F4C4} ", t("Download PDF-rapport", "Download PDF Report")), /* @__PURE__ */ React.createElement("a", { href: "/book-session", style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 24px", background: "transparent", color: "#C9A96E", border: "2px solid #C9A96E", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" } }, "\u{1F4C5} ", t("Book gratis strategi-session", "Book Free Strategy Session")), /* @__PURE__ */ React.createElement("a", { href: "/ai-governance-assessment", style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 24px", background: "transparent", color: "#9a9aaa", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none" } }, "\u{1F4CA} ", t("Tag fuld governance-assessment", "Take Full Governance Assessment"))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 50, padding: "30px 0", borderTop: "1px solid rgba(201,169,110,0.12)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'DM Serif Display', serif", color: "#C9A96E", fontSize: 20, marginBottom: 8 } }, "Steven Wensley"), /* @__PURE__ */ React.createElement("div", { style: { color: "#9a9aaa", fontSize: 13 } }, "AI Governance Specialist"), /* @__PURE__ */ React.createElement("div", { style: { color: "#9a9aaa", fontSize: 13, marginTop: 8 } }, "steven.wensley@gmail.com  \xB7  +45 5388 6061  \xB7  stevenwensley.com"))));
    }
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", background: "#0C0C12" } }, showPdfGate && /* @__PURE__ */ React.createElement(
      "div",
      {
        style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1e3, display: "flex", alignItems: "center", justifyContent: "center" },
        onClick: (e) => {
          if (e.target === e.currentTarget) setShowPdfGate(false);
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { background: "#161620", border: "1px solid #C9A96E44", borderRadius: 16, padding: 32, maxWidth: 400, width: "90%", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 36, marginBottom: 12 } }, "\u{1F4C4}"), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: 18, fontWeight: 700, color: "#C9A96E", marginBottom: 8 } }, t("Indtast din email for PDF-rapporten", "Enter your email for the PDF report")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "#9CA3AF", marginBottom: 20, lineHeight: 1.5 } }, t("Vi sender dig kun rapporten \u2014 ingen spam.", "We'll only send you the report \u2014 no spam.")), /* @__PURE__ */ React.createElement(
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
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid rgba(201,169,110,0.12)" } }, /* @__PURE__ */ React.createElement("a", { href: "/", style: { color: "#C9A96E", fontSize: 14, textDecoration: "none" } }, "\u2190 ", t("Tilbage", "Back")), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "'DM Serif Display', serif", color: "#C9A96E", fontSize: 18 } }, "Steven Wensley"), /* @__PURE__ */ React.createElement("button", { onClick: toggleLang, style: { background: "transparent", border: "1px solid rgba(201,169,110,0.3)", color: "#C9A96E", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 } }, lang === "da" ? "EN" : "DA")), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 24px", maxWidth: 700, margin: "0 auto" } }, /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: "rgba(201,169,110,0.12)", borderRadius: 2, marginTop: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", background: "#C9A96E", borderRadius: 2, width: `${progress}%`, transition: "width 0.3s ease" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#6a6a7a" } }, /* @__PURE__ */ React.createElement("span", null, t("Sp\xF8rgsm\xE5l", "Question"), " ", currentStep + 1, " / ", totalSteps), /* @__PURE__ */ React.createElement("span", null, Math.round(progress), "%"))), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 700, margin: "0 auto", padding: "40px 20px" }, className: "fade-in", key: currentStep }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 40 } }, currentStep === 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "'DM Serif Display', serif", color: "#C9A96E", fontSize: 28, marginBottom: 8 } }, "EU AI Act Classifier"), /* @__PURE__ */ React.createElement("p", { style: { color: "#9a9aaa", fontSize: 14, maxWidth: 500, margin: "0 auto" } }, t("Klassific\xE9r dit AI-system p\xE5 3 minutter. F\xE5 risikokategori, krav, tidslinje og PDF-rapport.", "Classify your AI system in 3 minutes. Get risk category, requirements, timeline and PDF report."))), /* @__PURE__ */ React.createElement("h2", { style: { color: "#E8E8ED", fontSize: 20, fontWeight: 700, lineHeight: 1.4, maxWidth: 600, margin: "0 auto" } }, t(step.question, step.questionEN)), step.help && /* @__PURE__ */ React.createElement("p", { style: { color: "#6a6a7a", fontSize: 13, marginTop: 10, maxWidth: 500, margin: "10px auto 0", lineHeight: 1.5 } }, "\u{1F4A1} ", t(step.help, step.helpEN))), step.type === "select" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, maxWidth: 400, margin: "0 auto" } }, step.options.map((opt) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: opt.value,
        onClick: () => handleAnswer(opt.value),
        style: {
          padding: "14px 20px",
          background: answers[step.id] === opt.value ? "rgba(201,169,110,0.15)" : "#1a1a26",
          border: answers[step.id] === opt.value ? "2px solid #C9A96E" : "1px solid rgba(201,169,110,0.12)",
          borderRadius: 10,
          color: "#E8E8ED",
          fontSize: 15,
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.2s ease"
        }
      },
      t(opt.label, opt.labelEN)
    ))), step.type === "text" && /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 500, margin: "0 auto" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: answers[step.id] || "",
        onChange: (e) => setAnswers((prev) => ({ ...prev, [step.id]: e.target.value })),
        placeholder: t(step.placeholder, step.placeholderEN),
        style: { width: "100%", padding: "14px 18px", background: "#1a1a26", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 10, color: "#E8E8ED", fontSize: 15, outline: "none" }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          if (answers[step.id]) setCurrentStep(currentStep + 1);
        },
        disabled: !answers[step.id],
        style: { width: "100%", marginTop: 16, padding: "14px", background: answers[step.id] ? "#C9A96E" : "#333", color: answers[step.id] ? "#0C0C12" : "#666", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: answers[step.id] ? "pointer" : "default" }
      },
      t("N\xE6ste", "Next"),
      " \u2192"
    )), step.type === "textarea" && /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 500, margin: "0 auto" } }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: answers[step.id] || "",
        onChange: (e) => setAnswers((prev) => ({ ...prev, [step.id]: e.target.value })),
        placeholder: t(step.placeholder, step.placeholderEN),
        rows: 4,
        style: { width: "100%", padding: "14px 18px", background: "#1a1a26", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 10, color: "#E8E8ED", fontSize: 15, outline: "none", resize: "vertical", fontFamily: "inherit" }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          if (answers[step.id]) setCurrentStep(currentStep + 1);
        },
        disabled: !answers[step.id],
        style: { width: "100%", marginTop: 16, padding: "14px", background: answers[step.id] ? "#C9A96E" : "#333", color: answers[step.id] ? "#0C0C12" : "#666", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: answers[step.id] ? "pointer" : "default" }
      },
      t("N\xE6ste", "Next"),
      " \u2192"
    )), step.type === "yesno" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, justifyContent: "center", maxWidth: 400, margin: "0 auto" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleAnswer("yes"),
        style: {
          flex: 1,
          padding: "18px",
          background: answers[step.id] === "yes" ? "rgba(239,68,68,0.15)" : "#1a1a26",
          border: answers[step.id] === "yes" ? "2px solid #EF4444" : "1px solid rgba(201,169,110,0.12)",
          borderRadius: 12,
          color: answers[step.id] === "yes" ? "#EF4444" : "#E8E8ED",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer"
        }
      },
      t("Ja", "Yes")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleAnswer("no"),
        style: {
          flex: 1,
          padding: "18px",
          background: answers[step.id] === "no" ? "rgba(34,197,94,0.15)" : "#1a1a26",
          border: answers[step.id] === "no" ? "2px solid #22C55E" : "1px solid rgba(201,169,110,0.12)",
          borderRadius: 12,
          color: answers[step.id] === "no" ? "#22C55E" : "#E8E8ED",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer"
        }
      },
      t("Nej", "No")
    )), step.type === "contact" && /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 500, margin: "0 auto" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        id: "contact-email",
        placeholder: t("Din e-mail (valgfrit)", "Your email (optional)"),
        style: { width: "100%", padding: "14px 18px", background: "#1a1a26", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 10, color: "#E8E8ED", fontSize: 15, outline: "none", marginBottom: 12 }
      }
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        id: "contact-org",
        placeholder: t("Organisation (valgfrit)", "Organisation (optional)"),
        style: { width: "100%", padding: "14px 18px", background: "#1a1a26", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 10, color: "#E8E8ED", fontSize: 15, outline: "none", marginBottom: 16 }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          const emailEl = document.getElementById("contact-email");
          const orgEl = document.getElementById("contact-org");
          if (emailEl && emailEl.value) submitLead(emailEl.value, orgEl ? orgEl.value : "");
          finishClassification();
        },
        style: { width: "100%", padding: "16px", background: "#C9A96E", color: "#0C0C12", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }
      },
      t("Se din klassificering", "See Your Classification"),
      " \u2192"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: finishClassification,
        style: { width: "100%", marginTop: 10, padding: "12px", background: "transparent", color: "#6a6a7a", border: "none", fontSize: 13, cursor: "pointer" }
      },
      t("Spring over \u2192", "Skip \u2192")
    )), step.type !== "contact" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 40, maxWidth: 500, margin: "40px auto 0" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: goBack,
        disabled: currentStep === 0,
        style: { padding: "10px 20px", background: "transparent", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 8, color: currentStep === 0 ? "#333" : "#9a9aaa", fontSize: 14, cursor: currentStep === 0 ? "default" : "pointer" }
      },
      "\u2190 ",
      t("Tilbage", "Back")
    ), step.type === "yesno" && answers[step.id] && currentStep < totalSteps - 1 && /* @__PURE__ */ React.createElement("span", { style: { color: "#6a6a7a", fontSize: 12, alignSelf: "center" } }, t("Auto-avancerer...", "Auto-advancing...")))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "30px 20px", borderTop: "1px solid rgba(201,169,110,0.08)", marginTop: 40 } }, /* @__PURE__ */ React.createElement("p", { style: { color: "#555", fontSize: 11, letterSpacing: "0.05em", marginBottom: 6 } }, "PMP \xB7 PRINCE2 \xB7 MSP \xB7 P3O \xB7 MoP \xB7 Agile PM \xB7 20 years in regulated environments"), /* @__PURE__ */ React.createElement("p", { style: { color: "#6a6a7a", fontSize: 12 } }, t("Baseret p\xE5 EU AI Act (Forordning 2024/1689). Senest opdateret februar 2026.", "Based on EU AI Act (Regulation 2024/1689). Last updated February 2026.")), /* @__PURE__ */ React.createElement("p", { style: { color: "#6a6a7a", fontSize: 11, marginTop: 4 } }, t("Denne klassificering er vejledende og erstatter ikke juridisk r\xE5dgivning.", "This classification is indicative and does not replace legal advice."))));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(EUAIActClassifier, null));
})();
