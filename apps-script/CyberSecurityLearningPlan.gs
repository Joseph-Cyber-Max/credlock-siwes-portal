// Cyber Security SIWES learning track for practical application at Credlock Business.
// Safe to run repeatedly: existing rows are preserved and missing rows are added.

const CYBER_SECURITY_PLAN_ = [
  [1,'Cyber Security Foundations','Understand confidentiality, integrity, availability, assets, threats and basic risk management.','Identify Credlock Business systems, devices, accounts and data that require protection.','Asset inventory and basic risk register for support operations.','Short quiz + supervisor review'],
  [2,'Identity, Access & Least Privilege','Understand authentication, authorization, roles and least-privilege access.','Review portal, support and merchant access roles; identify excessive permissions.','Access-control review checklist and remediation recommendations.','Access review evidence'],
  [3,'Security Awareness & Social Engineering','Recognize phishing, impersonation, credential theft and social-engineering indicators.','Create safe support procedures for verifying customers, merchants and staff before account/device actions.','Phishing-awareness exercise and verification checklist.','Scenario assessment'],
  [4,'Endpoint & Device Security','Understand endpoint hardening, patching, screen locks, encryption and secure configuration.','Apply a secure baseline for support laptops and Android enrollment/support devices used with Credlock Business.','Endpoint hardening checklist.','Configuration audit'],
  [5,'Mobile Security & MDM','Understand mobile threats, device enrollment, MDM controls and secure recovery procedures.','Review secure device-enrollment, lock/unlock, app-removal and MDM support workflows without bypassing authorization.','Secure mobile support runbook.','Supervisor practical demonstration'],
  [6,'Network & Wi-Fi Security','Understand secure networks, segmentation, VPNs, TLS and common network attacks.','Assess support-office Wi-Fi and network practices; recommend safer administration and remote-support practices.','Network security checklist and diagram.','Network review'],
  [7,'Web, API & Application Security','Understand common web/API risks, input validation, authentication, authorization, logging and secure error handling.','Review SIWES portal and Credlock Business integration points for defensive controls and safe testing.','Application/API security checklist and test cases.','Controlled security test report'],
  [8,'Data Protection & Privacy','Understand data classification, minimization, retention, secure handling and privacy responsibilities.','Map customer, merchant and student data flows and recommend secure handling practices.','Data-classification and retention matrix.','Data-handling assessment'],
  [9,'Fraud Prevention & Transaction Security','Understand fraud indicators, account takeover, device abuse and suspicious transaction patterns.','Develop defensive indicators for suspicious merchant/customer support cases and escalation paths.','Fraud-risk indicator checklist.','Case-study assessment'],
  [10,'Logging, Monitoring & Incident Detection','Understand security logs, audit trails, monitoring and alert triage.','Define useful events for login, access, device enrollment, ticket changes and administrative actions.','Security logging and alert requirements.','Log-analysis exercise'],
  [11,'Incident Response & Escalation','Understand preparation, identification, containment, eradication, recovery and lessons learned.','Build a Credlock Business incident-response workflow for compromised accounts, suspicious access and device/security incidents.','Incident-response playbook and escalation matrix.','Tabletop exercise'],
  [12,'Vulnerability Management & Secure Support','Understand vulnerability identification, prioritization, remediation and verification.','Create a recurring security review process for support systems, applications, devices and operational procedures.','Vulnerability register with risk ratings and remediation plan.','Supervisor review'],
  [13,'Backup, Recovery & Business Continuity','Understand backups, recovery objectives, resilience and continuity planning.','Review support records and operational dependencies; design recovery checks that protect availability and integrity.','Backup/recovery checklist and continuity notes.','Recovery walkthrough'],
  [14,'Secure Documentation & Evidence','Understand evidence collection, change tracking, auditability and safe documentation.','Improve ticket, attendance, logbook and technical-support records so security actions are traceable.','Security evidence/documentation standard.','Documentation quality review'],
  [15,'Security Testing & Verification','Understand authorized security testing, test scope, evidence and remediation verification.','Run only approved defensive tests against designated portal/support environments and document findings responsibly.','Security test plan, findings and remediation verification.','Practical assessment'],
  [16,'Capstone: Credlock Business Security Improvement','Integrate the track into a practical security-improvement proposal.','Combine access, endpoint, mobile, application/API, data, monitoring, incident response and continuity controls into one business-focused plan.','Credlock Business Cyber Security Improvement Report and presentation.','Final supervisor assessment']
];

function seedCyberSecurityLearningPlan_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName('LEARNING_PLAN') || ss.insertSheet('LEARNING_PLAN');
  const headers = ['LearningPlanID','Programme','Session','Week','Topic','LearningObjective','ExpectedSkill','Activity','AssessmentCriteria','Status'];
  const existingHeaders = sh.getLastColumn() ? sh.getRange(1,1,1,Math.max(sh.getLastColumn(),headers.length)).getValues()[0].map(String) : [];
  if (!existingHeaders.length) sh.getRange(1,1,1,headers.length).setValues([headers]);
  const values = sh.getDataRange().getValues();
  const existingIds = {};
  values.slice(1).forEach(function(r){ if(r[0]) existingIds[String(r[0])] = true; });
  const rows = CYBER_SECURITY_PLAN_.filter(function(r){ return !existingIds['CYBER-'+String(r[0]).padStart(2,'0')]; }).map(function(r){
    return ['CYBER-'+String(r[0]).padStart(2,'0'),'Cyber Security','2026',r[0],r[1],r[2],r[3],r[4],r[5],'ACTIVE'];
  });
  if (rows.length) sh.getRange(sh.getLastRow()+1,1,rows.length,headers.length).setValues(rows);
  sh.setFrozenRows(1);
  return {success:true, added:rows.length, totalCyberWeeks:CYBER_SECURITY_PLAN_.length};
}

function seedCyberSecurityStudentTrack_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName('STUDENTS');
  if (!sh) return {success:false,message:'STUDENTS sheet does not exist.'};
  const lastCol = Math.max(sh.getLastColumn(),1);
  const headers = sh.getRange(1,1,1,lastCol).getValues()[0].map(String);
  let trackCol = headers.indexOf('LearningTrack') + 1;
  if (!trackCol) { trackCol = lastCol + 1; sh.getRange(1,trackCol).setValue('LearningTrack'); }
  const programmeCol = headers.indexOf('Programme') + 1;
  if (programmeCol && sh.getLastRow() > 1) {
    const data = sh.getRange(2,1,sh.getLastRow()-1,Math.max(trackCol,programmeCol)).getValues();
    const out = data.map(function(row){
      const programme = String(row[programmeCol-1] || '').toLowerCase();
      const current = String(row[trackCol-1] || '');
      return [current || (programme.indexOf('cyber') >= 0 ? 'Cyber Security — Credlock Business Security Operations' : '')];
    });
    sh.getRange(2,trackCol,out.length,1).setValues(out);
  }
  return {success:true, learningTrackColumn:'LearningTrack'};
}

function seedCyberSecurityCatalog_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const now = new Date();
  const dept = ss.getSheetByName('DEPARTMENTS');
  if (dept) {
    const rows = dept.getDataRange().getValues();
    if (!rows.some(function(r){ return String(r[2]||'').toLowerCase()==='cyber security'; })) dept.appendRow(['DEPT-CYBER','', 'Cyber Security','ACTIVE',now,now]);
  }
  const prog = ss.getSheetByName('PROGRAMMES');
  if (prog) {
    const rows = prog.getDataRange().getValues();
    if (!rows.some(function(r){ return String(r[3]||'').toLowerCase()==='cyber security'; })) prog.appendRow(['PROG-CYBER','', 'Cyber Security','Cyber Security','ACTIVE',now,now]);
  }
  const skills = ss.getSheetByName('SKILLS');
  if (skills) {
    const existing = skills.getDataRange().getValues().map(function(r){return String(r[1]||'').toLowerCase();});
    const names = ['Security Awareness','Access Control','Endpoint Security','Mobile Security','API Security','Data Protection','Fraud Prevention','Security Monitoring','Incident Response','Vulnerability Management'];
    const add = names.filter(function(n){return existing.indexOf(n.toLowerCase())<0;}).map(function(n,i){return ['CYBER-SKILL-'+String(i+1).padStart(2,'0'),n,'Cyber Security','Practical security skill for Credlock Business support operations','ACTIVE',now,now];});
    if(add.length) skills.getRange(skills.getLastRow()+1,1,add.length,7).setValues(add);
  }
  return {success:true};
}

function initializeCyberSecurityTrack_() {
  const result = seedCyberSecurityLearningPlan_();
  seedCyberSecurityStudentTrack_();
  seedCyberSecurityCatalog_();
  return result;
}
