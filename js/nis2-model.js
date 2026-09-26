// The NIS2 gap assessment: its questions, and how answers become a score.
//
// One file, read by two things that must never disagree:
//   - nis2-gap-assessment.html, as a plain <script>, which draws the free
//     result on screen;
//   - functions/api/receipt/*, which import it to build the paid receipt on
//     the server.
// If the receipt computed its score from its own copy of the questions, the
// first edit to either copy would make a paid document contradict the screen
// the customer just looked at. So there is no second copy.
//
// Answers travel as a string, one character per question in page order:
// "0" to "3" for the option chosen, "-" for a question left unanswered.

(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.NIS2 = model;
})(typeof self !== 'undefined' ? self : this, function () {
  const domains = [
    {
      id: 'governance', name: 'Governance & Leadership', ref: 'Art. 20',
      subtitle: 'Board accountability, cybersecurity strategy, management oversight',
      questions: [
        { text: 'Has the board formally approved a cybersecurity risk management policy?', context: 'NIS2 Art. 20 requires management body approval of cybersecurity measures.', options: ['No policy exists','Policy exists but not board-approved','Board-approved policy, reviewed annually','Board-approved, integrated with enterprise risk management'] },
        { text: 'Does the management body receive regular cybersecurity briefings?', context: 'Art. 20 mandates management oversight — not delegation to IT alone.', options: ['No structured reporting','Ad-hoc reporting when incidents occur','Quarterly reporting with metrics','Monthly reporting with risk dashboard and KPIs'] },
        { text: 'Has management completed NIS2-specific cybersecurity training?', context: 'Art. 20(2): Members of management bodies must follow training.', options: ['No training completed','General awareness training only','NIS2-specific training planned','NIS2-specific training completed and documented'] },
        { text: 'Is there a designated CISO or equivalent security officer?', context: 'Essential for NIS2 governance. Reports to board, not buried in IT ops.', options: ['No dedicated security role','IT manager handles security part-time','Dedicated CISO but reports to CIO only','CISO with direct board reporting line'] }
      ]
    },
    {
      id: 'risk', name: 'Risk Management', ref: 'Art. 21(2)(a)',
      subtitle: 'Cyber risk assessment methodology, risk register, acceptance criteria',
      questions: [
        { text: 'Do you maintain a formal cybersecurity risk assessment process?', context: 'Art. 21(2)(a): risk analysis and information system security policies.', options: ['No formal risk assessment','Informal/ad-hoc assessments','Annual risk assessment documented','Continuous risk assessment with automated monitoring'] },
        { text: 'Are OT/production systems included in your risk assessments?', context: 'Food manufacturing relies on SCADA, PLCs, cold chain monitoring — all in scope.', options: ['OT systems not assessed','OT included informally','OT has separate risk assessment','Integrated IT/OT risk assessment with unified register'] },
        { text: 'Do you have documented risk acceptance criteria approved by management?', context: 'Regulators expect evidence of conscious risk decisions — not ignored gaps.', options: ['No risk acceptance criteria','Informal thresholds','Documented criteria, management-approved','Quantified criteria with regular review and board sign-off'] }
      ]
    },
    {
      id: 'incident', name: 'Incident Management', ref: 'Art. 23, 24',
      subtitle: 'Detection, response, reporting — 24h/72h/30-day obligations',
      questions: [
        { text: 'Do you have a documented incident response plan covering NIS2 reporting timelines?', context: 'NIS2 requires: 24h early warning, 72h detailed notification, 30-day final report.', options: ['No incident response plan','Plan exists but no NIS2-specific timelines','Plan includes NIS2 timelines, not tested','Plan tested via tabletop exercises within last 12 months'] },
        { text: 'Can you detect a significant cyber incident within 24 hours?', context: '24-hour early warning is mandatory. Requires real-time monitoring capability.', options: ['No real-time monitoring','Basic monitoring, detection likely >48h','SIEM/SOC in place, <24h detection likely','24/7 SOC with automated alerting and <1h detection target'] },
        { text: 'Do you know which national authority to notify for incidents?', context: 'Denmark: Centre for Cybersecurity. Sweden: MSB. Finland: Traficom.', options: ['Not identified','Identified but no contact established','Contact established, procedures drafted','Tested notification procedure with authority engagement'] },
        { text: 'Have you conducted an incident response exercise in the last 12 months?', context: 'Regulators expect evidence of preparedness — not just documentation.', options: ['No exercises conducted','Discussed scenarios informally','Tabletop exercise completed','Full simulation including OT/production scenarios'] }
      ]
    },
    {
      id: 'bcp', name: 'Business Continuity', ref: 'Art. 21(2)(c)',
      subtitle: 'Backup, disaster recovery, crisis management for production & supply chain',
      questions: [
        { text: 'Do you have documented RTO/RPO targets for critical systems?', context: 'ERP downtime = no orders. Production SCADA failure = factory stops. Cold chain break = product loss.', options: ['No documented RTO/RPO','Informal targets for some systems','Documented for all critical systems','Documented, tested, and validated quarterly'] },
        { text: 'Are backups tested regularly and stored off-site/offline?', context: 'Ransomware specifically targets online backups. Air-gapped copies are essential.', options: ['No regular backup testing','Backups exist but rarely tested','Regular testing, online storage only','Tested quarterly with offline/air-gapped copies'] },
        { text: 'Do you have a crisis management plan for cyber incidents affecting production?', context: 'Food production downtime has cascading effects: waste, supply chain delays, recalls.', options: ['No crisis management plan','IT disaster recovery only','Includes production/OT scenarios','Integrated plan with supply chain partners, tested annually'] }
      ]
    },
    {
      id: 'supply-chain', name: 'Supply Chain Security', ref: 'Art. 21(2)(d)',
      subtitle: 'Vendor assessments, contractual clauses, third-party monitoring',
      questions: [
        { text: 'Have you assessed the cybersecurity posture of your critical suppliers?', context: 'Art. 21(2)(d): security of supply chain including vendor relationships.', options: ['No supplier security assessments','Informal assessment of some suppliers','Formal assessment of critical suppliers','Comprehensive program with regular reassessment and monitoring'] },
        { text: 'Do supplier contracts include NIS2-compliant cybersecurity clauses?', context: 'Must include incident notification requirements, security standards, audit rights.', options: ['No security clauses in contracts','Generic security clauses','NIS2-aligned clauses in new contracts','All contracts updated with specific NIS2 requirements'] },
        { text: 'Can your suppliers notify you of incidents within agreed timeframes?', context: 'Your 24h reporting obligation depends on supplier incident visibility.', options: ['No supplier notification procedures','Informal expectations','Documented notification requirements','Tested notification chain with critical suppliers'] },
        { text: 'Do you assess the security of software/SaaS vendors (ERP, cloud, IoT)?', context: 'ERP, Azure, production monitoring, e-commerce — all are attack surfaces.', options: ['No vendor security assessment','SOC2/ISO cert checked at onboarding','Regular security reviews of critical vendors','Continuous monitoring with vendor risk scoring'] }
      ]
    },
    {
      id: 'access', name: 'Access Control', ref: 'Art. 21(2)(i)',
      subtitle: 'Authentication, authorization, privileged access, zero trust',
      questions: [
        { text: 'Is multi-factor authentication (MFA) enforced for all privileged access?', context: 'Admin accounts, VPN, cloud consoles, ERP admin — all require MFA under NIS2.', options: ['MFA not deployed','MFA for some systems (e.g. email)','MFA for all remote and cloud access','MFA enforced universally including OT admin access'] },
        { text: 'Do you implement least-privilege access control across IT and OT?', context: 'Production operators should only access their line. Admins should not have permanent root.', options: ['No formal access control policy','Basic role-based access in some systems','RBAC across IT systems, not OT','RBAC/ABAC across IT and OT with regular access reviews'] },
        { text: 'How do you manage privileged access (admin/root accounts)?', context: 'Compromised admin accounts are the #1 path for ransomware in food manufacturing.', options: ['Shared admin accounts in use','Individual accounts but no PAM','Privileged Access Management (PAM) for IT','PAM across IT and OT with session recording'] }
      ]
    },
    {
      id: 'assets', name: 'Asset Management', ref: 'Art. 21(2)',
      subtitle: 'Hardware, software, data inventory — IT and OT assets',
      questions: [
        { text: 'Do you maintain a complete inventory of IT and OT assets?', context: 'You cannot protect what you do not know. Includes servers, PLCs, sensors, IoT devices.', options: ['No centralized inventory','Partial IT inventory only','Complete IT inventory, partial OT','Complete IT + OT inventory with automated discovery'] },
        { text: 'Are assets classified by criticality and data sensitivity?', context: 'Recipe databases, production SCADA, customer PII, financial systems — different risk levels.', options: ['No classification scheme','Informal classification','Documented classification for IT','Classification for IT and OT with risk-based prioritization'] },
        { text: 'Do you track end-of-life/end-of-support for all systems?', context: 'Legacy OT systems often run unsupported OS. Major vulnerability if not managed.', options: ['No lifecycle tracking','Tracked for some IT systems','Tracked for all IT, some OT','Complete lifecycle management with upgrade/migration plans'] }
      ]
    },
    {
      id: 'crypto', name: 'Cryptography & Data Protection', ref: 'Art. 21(2)(h)',
      subtitle: 'Encryption at rest and in transit, key management, data classification',
      questions: [
        { text: 'Is data encrypted in transit across all critical systems?', context: 'TLS 1.2+ for all connections. Includes internal traffic, not just external.', options: ['Encryption not standardized','External connections encrypted','All critical connections encrypted (TLS 1.2+)','Full encryption including internal east-west traffic'] },
        { text: 'Is sensitive data encrypted at rest?', context: 'Recipes, customer data, financial records, employee PII — all require encryption.', options: ['No encryption at rest','Some databases encrypted','All sensitive data encrypted (AES-256)','Full disk + database + backup encryption with key rotation'] },
        { text: 'Do you have a documented key management process?', context: 'Keys in code repos, shared drives, or individual laptops = critical vulnerability.', options: ['No key management process','Keys managed informally','Documented process with HSM/vault','Automated key lifecycle with rotation and audit logging'] }
      ]
    },
    {
      id: 'network', name: 'Network Security', ref: 'Art. 21(2)',
      subtitle: 'Segmentation, monitoring, OT/IT separation, remote access',
      questions: [
        { text: 'Are your IT and OT networks segmented?', context: 'Critical for food manufacturing. IT ransomware must not reach production SCADA.', options: ['Flat network (no segmentation)','Basic VLAN segmentation','IT/OT separated with firewall','Purdue model / IEC 62443 zone architecture with DMZ'] },
        { text: 'Do you monitor network traffic for anomalies?', context: 'Includes both IT (SIEM) and OT (industrial IDS/NMS) monitoring.', options: ['No network monitoring','Basic monitoring (availability only)','SIEM for IT, no OT monitoring','Integrated IT + OT monitoring with anomaly detection'] },
        { text: 'How is remote access to OT systems managed?', context: 'Vendor remote access to PLCs/SCADA is a top attack vector in manufacturing.', options: ['Open VPN access to OT','VPN with standard credentials','Dedicated secure remote access gateway','Zero-trust remote access with session recording and approval workflows'] }
      ]
    },
    {
      id: 'hr', name: 'Human Resources Security', ref: 'Art. 21(2)(g)',
      subtitle: 'Training, awareness, background checks, onboarding/offboarding',
      questions: [
        { text: 'Do all employees receive cybersecurity awareness training?', context: 'Art. 21(2)(g): Includes production staff, not just office workers.', options: ['No structured training','Training for office staff only','Annual training for all employees','Role-specific training (IT, OT, management) with phishing simulations'] },
        { text: 'Are background checks performed for staff with access to critical systems?', context: 'Food manufacturing has high turnover. Contractors and temp workers also in scope.', options: ['No background checks','For senior IT staff only','For all staff with system access','Comprehensive checks including contractors, with periodic renewal'] },
        { text: 'Do you have documented onboarding/offboarding procedures for system access?', context: 'Departed employee with active ERP/production access = significant risk.', options: ['No formal procedures','Informal process, often delayed','Documented with IT checklist','Automated provisioning/deprovisioning with same-day revocation'] }
      ]
    }
  ];

  const questions = [];
  domains.forEach((d, di) => d.questions.forEach((q, qi) => questions.push({ di, qi, key: `${di}-${qi}` })));

  // The page keeps answers as { "0-1": 2, ... }; this is that, as a string.
  const encodeAnswers = (answers) =>
    questions.map(({ key }) => (answers[key] === undefined ? '-' : String(answers[key]))).join('');

  const ANSWERS_RE = new RegExp(`^[0-3-]{${questions.length}}$`);

  const decodeAnswers = (str) => {
    if (typeof str !== 'string' || !ANSWERS_RE.test(str)) return null;
    const answers = {};
    questions.forEach(({ key }, i) => { if (str[i] !== '-') answers[key] = Number(str[i]); });
    return answers;
  };

  const band = (pct) => (pct < 30 ? 'red' : pct < 55 ? 'orange' : pct < 75 ? 'gold' : 'green');

  const maturity = (pct) =>
    pct < 30 ? 'Initial — Significant gaps require immediate attention'
      : pct < 55 ? 'Developing — Foundation exists but critical gaps remain'
      : pct < 75 ? 'Defined — Good progress, focused improvements needed'
      : 'Managed — Strong posture, continuous improvement recommended';

  // An unanswered question counts as 0: the free result has always scored it
  // that way, and a receipt must say what the screen said.
  const score = (answers) => {
    const domainScores = domains.map((d, di) => {
      let total = 0, max = 0;
      d.questions.forEach((q, qi) => { const val = answers[`${di}-${qi}`]; total += (val !== undefined ? val : 0); max += 3; });
      return { name: d.name, ref: d.ref, score: total, max, pct: Math.round((total / max) * 100) };
    });
    const overallScore = domainScores.reduce((s, d) => s + d.score, 0);
    const overallMax = domainScores.reduce((s, d) => s + d.max, 0);
    const overallPct = Math.round((overallScore / overallMax) * 100);
    return { domainScores, overallPct, band: band(overallPct), maturity: maturity(overallPct) };
  };

  const gaps = (answers) => {
    const out = [];
    domains.forEach((d, di) => { d.questions.forEach((q, qi) => { const val = answers[`${di}-${qi}`]; if (val !== undefined && val <= 1) out.push({ domain: d.name, ref: d.ref, question: q.text, score: val, option: q.options[val] }); }); });
    return out;
  };

  const recommendations = (domainScores) => {
    const recos = [
      { cond: () => domainScores[0].pct < 50, text: 'Establish Board-Level Governance', desc: 'Secure board approval for cybersecurity policy. Schedule quarterly security briefings. Appoint or empower a CISO with direct board reporting.' },
      { cond: () => domainScores[2].pct < 50, text: 'Implement NIS2 Incident Reporting', desc: 'Document 24h/72h/30-day reporting procedures. Register with national CSIRT. Conduct tabletop exercise within 30 days.' },
      { cond: () => domainScores[4].pct < 50, text: 'Launch Supply Chain Security Programme', desc: 'Identify and assess top 30 critical suppliers. Update contracts with NIS2 security clauses. Establish incident notification chain.' },
      { cond: () => domainScores[1].pct < 50, text: 'Formalize Cybersecurity Risk Assessment', desc: 'Implement structured risk methodology covering IT and OT. Include production systems, cold chain, and ERP in scope.' },
      { cond: () => domainScores[3].pct < 50, text: 'Strengthen Business Continuity', desc: 'Define RTO/RPO for production-critical systems. Test backups with offline/air-gapped copies. Develop production-specific crisis plan.' },
      { cond: () => domainScores[8].pct < 75, text: 'Segment IT/OT Networks', desc: 'Implement Purdue model or IEC 62443 zone architecture. Deploy industrial firewall between IT and OT.' },
      { cond: () => domainScores[5].pct < 75, text: 'Enforce Multi-Factor Authentication', desc: 'Deploy MFA across all privileged access, VPN, and cloud consoles. Include OT administrative access.' },
      { cond: () => true, text: 'Continuous Monitoring & Evidence Collection', desc: 'Implement automated compliance dashboards, audit trails, and security metrics reporting.' }
    ];
    return recos.filter((r) => r.cond()).slice(0, 6).map(({ text, desc }) => ({ text, desc }));
  };

  return { domains, questionCount: questions.length, encodeAnswers, decodeAnswers, band, maturity, score, gaps, recommendations };
});
