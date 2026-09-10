// Training-track engine for Technical Support.
// SIWES = 3 months / 12 weeks. IT = 6 months / 24 weeks.
// Plans are course-aware through CourseDomain and Programme matching.

const TECH_SUPPORT_SIWES_PLAN_ = [
  ['01','Orientation & Technical Support Foundations','Understand Credlock support workflows, service standards, tools, escalation and documentation.','Technical Support','Orientation checklist + supervised support observation'],
  ['02','Customer & Merchant Support','Practice professional issue intake, identity checks, communication and ticket categorization.','Customer Support','Ticket-quality review'],
  ['03','Device Enrollment & MDM','Understand authorized enrollment, device status checks, MDM workflows and safe troubleshooting.','Device Support','Enrollment case review'],
  ['04','Android Diagnostics','Troubleshoot common Android software, connectivity, storage, app and configuration issues.','Mobile Support','Diagnostic worksheet'],
  ['05','Ticket Lifecycle & SLA','Use ticket priority, assignment, status, escalation and resolution documentation correctly.','Help Desk','Ticket lifecycle assessment'],
  ['06','Network & Connectivity Support','Diagnose Wi-Fi, mobile-data, DNS and common connectivity problems using safe support methods.','Network Support','Connectivity troubleshooting practical'],
  ['07','App & API Support Basics','Read logs/errors, reproduce issues and distinguish frontend, backend and integration failures.','Application Support','Incident reproduction report'],
  ['08','Security Awareness','Apply least privilege, phishing awareness, secure support verification and safe handling of credentials/data.','Security Operations','Scenario assessment'],
  ['09','Data & Documentation','Maintain accurate support notes, evidence, customer records and audit-ready technical documentation.','Technical Documentation','Documentation quality check'],
  ['10','Testing & Quality Assurance','Create test cases, verify fixes and record expected versus actual results.','QA / Testing','Test case execution'],
  ['11','Escalation & Incident Handling','Recognize severity, gather evidence and escalate incidents with complete technical context.','Incident Support','Escalation exercise'],
  ['12','SIWES Capstone','Complete a supervised technical support improvement project and present findings.','Technical Support','Final capstone presentation']
];

const TECH_SUPPORT_IT_PLAN_ = [
  ['01','Industrial Orientation & Credlock Operations','Understand business units, Technical Support responsibilities, systems, workflows and service expectations.'],
  ['02','Help Desk Foundations','Master support ticket intake, categorization, assignment, SLA and communication.'],
  ['03','Customer & Merchant Support','Handle common customer, merchant and staff support scenarios professionally.'],
  ['04','Device Enrollment Operations','Perform authorized smartphone enrollment, status checks and troubleshooting.'],
  ['05','Android Troubleshooting I','Diagnose installation, permissions, storage, performance and update issues.'],
  ['06','Android Troubleshooting II','Diagnose network, authentication, app and device configuration issues.'],
  ['07','MDM & Device Management','Understand enrollment policy, device lock state, recovery and secure administrative workflows.'],
  ['08','Windows Support','Troubleshoot Windows drivers, applications, user profiles, networking and common endpoint faults.'],
  ['09','Networking Fundamentals','Use IP, DNS, DHCP, Wi-Fi and connectivity diagnostics in support operations.'],
  ['10','Web & Browser Support','Troubleshoot browser, session, cache, permissions and web-application issues.'],
  ['11','Application Support','Diagnose frontend/backend behavior, validation errors and failed workflows.'],
  ['12','API & Integration Support','Understand HTTP methods, status codes, payloads, authentication and integration troubleshooting.'],
  ['13','Database & Data Quality','Understand structured records, validation, duplicates, data integrity and safe correction.'],
  ['14','Logging & Monitoring','Interpret application logs, audit trails, error patterns and operational indicators.'],
  ['15','Cyber Security Foundations','Apply secure authentication, authorization, least privilege and security-aware support.'],
  ['16','Fraud & Risk Awareness','Recognize suspicious activity, account abuse and device-related fraud indicators.'],
  ['17','Incident Response','Handle severity assessment, containment, escalation, recovery and lessons learned.'],
  ['18','Backup & Business Continuity','Understand backup verification, recovery procedures and service continuity.'],
  ['19','Testing & QA','Design regression tests, reproduce defects and verify fixes.'],
  ['20','Knowledge Base & SOPs','Create reusable troubleshooting guides, standard operating procedures and support articles.'],
  ['21','Reporting & Analytics','Analyze ticket volumes, resolution times, SLA, recurring faults and support trends.'],
  ['22','Automation & Process Improvement','Identify repeatable support tasks and propose safe workflow improvements.'],
  ['23','Supervisor-led Project','Deliver a structured Technical Support project aligned to the student course of study.'],
  ['24','IT Capstone & Final Assessment','Present project outcomes, evidence, skills gained and improvement recommendations.']
];

function seedTechnicalSupportLearningTracks_() {
  const ss=SpreadsheetApp.openById(SHEET_ID); const sh=ss.getSheetByName('LEARNING_PLAN')||ss.insertSheet('LEARNING_PLAN');
  const headers=['LearningPlanID','Programme','Session','Week','Topic','LearningObjective','ExpectedSkill','Activity','AssessmentCriteria','Status','TrainingType','Department','CourseDomain'];
  const existing=sh.getDataRange().getValues(); const h=existing[0]||[]; const headerMap={}; h.forEach(function(v,i){if(v)headerMap[String(v)]=i+1;});
  headers.forEach(function(x){if(!headerMap[x]){sh.getRange(1,sh.getLastColumn()+1).setValue(x);headerMap[x]=sh.getLastColumn();}});
  const data=sh.getDataRange().getValues(); const ids={}; data.slice(1).forEach(function(r){if(r[0])ids[String(r[0])]=true;});
  const out=[];
  TECH_SUPPORT_SIWES_PLAN_.forEach(function(r){const id='SIWES-TS-'+r[0]; if(!ids[id])out.push([id,'ALL','2026',Number(r[0]),r[1],r[2],r[3],r[4],r[4],'ACTIVE','SIWES','Technical Support','Course-aligned Technical Support']);});
  TECH_SUPPORT_IT_PLAN_.forEach(function(r){const id='IT-TS-'+r[0]; if(!ids[id])out.push([id,'ALL','2026',Number(r[0]),r[1],r[2],'Technical Support competency','Practical Technical Support placement activity','Supervisor review + evidence','ACTIVE','IT','Technical Support','Course-aligned Technical Support']);});
  if(out.length){const width=Object.keys(headerMap).length;const normalized=out.map(function(r){const obj={LearningPlanID:r[0],Programme:r[1],Session:r[2],Week:r[3],Topic:r[4],LearningObjective:r[5],ExpectedSkill:r[6],Activity:r[7],AssessmentCriteria:r[8],Status:r[9],TrainingType:r[10],Department:r[11],CourseDomain:r[12]};return headers.map(function(k){return obj[k]||'';});});sh.getRange(sh.getLastRow()+1,1,normalized.length,headers.length).setValues(normalized);}
  sh.setFrozenRows(1); return {success:true,siwesWeeks:12,itWeeks:24,added:out.length};
}

function updateStudentTrainingTrackFields_(){
  const ss=SpreadsheetApp.openById(SHEET_ID),sh=ss.getSheetByName('STUDENTS');if(!sh)return;
  const lastCol=Math.max(sh.getLastColumn(),1),headers=sh.getRange(1,1,1,lastCol).getValues()[0].map(String),need=['TrainingType','LearningTrack','CourseDomain'];
  need.forEach(function(k){if(headers.indexOf(k)<0)sh.getRange(1,sh.getLastColumn()+1).setValue(k);});
  const allH=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String),idx={};allH.forEach(function(k,i){idx[k]=i;});
  if(sh.getLastRow()<2)return;const rows=sh.getRange(2,1,sh.getLastRow()-1,sh.getLastColumn()).getValues();
  const out=rows.map(function(r){const programme=String(r[idx.Programme]||'');const dept=String(r[idx.Department]||'');const t=String(r[idx.TrainingType]||'').toUpperCase();const track=t==='IT'?'IT — 6 Months · Technical Support':t==='SIWES'?'SIWES — 3 Months · Technical Support':(programme.toLowerCase().indexOf('it')>=0?'IT — 6 Months · Technical Support':'SIWES — 3 Months · Technical Support');const domain=programme+' / '+dept+' → Technical Support';r[idx.TrainingType]=t==='IT'?'IT':'SIWES';r[idx.LearningTrack]=r[idx.LearningTrack]||track;r[idx.CourseDomain]=r[idx.CourseDomain]||domain;return r;});sh.getRange(2,1,rows.length,sh.getLastColumn()).setValues(out);
}

function initializeTechnicalSupportLearning_(){const a=seedTechnicalSupportLearningTracks_();updateStudentTrainingTrackFields_();return a;}
