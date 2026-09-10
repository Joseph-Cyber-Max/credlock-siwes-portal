// Controlled Apps Script execution surface for SIWES Portal administration.
// Intended to be invoked through the Apps Script Execution API (scripts.run).
// All operations run inside the deployed Apps Script project and therefore can
// update the connected Google Sheet through SpreadsheetApp.

const CHATGPT_ADMIN_ACTIONS_ = {
  STATUS: 'getPortalStatus', SCHEMA: 'getSheetSchema', INITIALIZE: 'initializePortal',
  STATS: 'getSystemStats', CONFIG_GET: 'getSystemConfig', CONFIG_UPDATE: 'updateSystemConfig',
  STUDENT_CREATE: 'createStudent', STUDENT_UPDATE: 'updateStudent', STUDENT_DELETE: 'deleteStudent',
  MIGRATION: 'runMigration', RESET_DATABASE: 'resetDatabase'
};

function chatGPTAdmin(request) {
  request = request || {};
  const action = String(request.action || '').trim();
  const adminEmail = String(request.adminEmail || '').trim().toLowerCase();
  if (adminEmail !== SUPER_ADMIN_EMAIL) throw Error('SuperAdmin authorization required.');
  switch (action) {
    case 'getPortalStatus': return {success:true,service:'Credlock SIWES Portal',status:'ONLINE',spreadsheetId:SHEET_ID,timestamp:new Date().toISOString()};
    case 'getSheetSchema': return chatGPTSheetSchema_();
    case 'initializePortal': initializePortalNow(); return {success:true,message:'Portal schema initialized successfully.'};
    case 'getSystemStats': return chatGPTSystemStats_();
    case 'getSystemConfig': return chatGPTConfig_();
    case 'updateSystemConfig': return chatGPTUpdateConfig_(request.values || {});
    case 'createStudent': return chatGPTCreateStudent_(request.student || {});
    case 'updateStudent': return chatGPTUpdateStudent_(request.student || {});
    case 'deleteStudent': return chatGPTDeleteStudent_(request.studentId);
    case 'runMigration': initializePortalNow(); return {success:true,message:'Portal migration completed.'};
    case 'resetDatabase': return resetPortalDatabase_(request.newSuperAdminPassword || PropertiesService.getScriptProperties().getProperty(SUPER_ADMIN_PASSWORD_PROPERTY));
    default: throw Error('Unsupported ChatGPT admin action: ' + action);
  }
}

function chatGPTSheetSchema_() {
  const ss = SpreadsheetApp.openById(SHEET_ID), result = {};
  Object.keys(HEADERS).forEach(function(k) { const name=SHEETS[k], sh=ss.getSheetByName(name); result[name]={exists:!!sh,headers:sh?sh.getRange(1,1,1,Math.max(sh.getLastColumn(),1)).getValues()[0]:HEADERS[k],rows:sh?Math.max(sh.getLastRow()-1,0):0}; });
  return {success:true,spreadsheetId:SHEET_ID,sheets:result};
}
function chatGPTSystemStats_() {
  const ss=SpreadsheetApp.openById(SHEET_ID), count=function(name){const sh=ss.getSheetByName(name);return sh?Math.max(sh.getLastRow()-1,0):0;};
  return {success:true,students:count(SHEETS.STUDENTS),users:count(SHEETS.USERS),attendance:count(SHEETS.ATTENDANCE),dailyLogs:count(SHEETS.DAILY_LOG),tickets:count(SHEETS.TICKETS),learningPlans:count(SHEETS.LEARNING),assessments:count(SHEETS.ASSESSMENTS),evaluations:count(SHEETS.EVALUATIONS)};
}
function chatGPTConfig_() {
  const sh=SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEETS.CONFIG), values={};
  if(sh&&sh.getLastRow()>1) sh.getRange(2,1,sh.getLastRow()-1,Math.min(sh.getLastColumn(),4)).getValues().forEach(function(r){if(r[0]!=='')values[String(r[0])]=r[1];});
  values.SpreadsheetId=SHEET_ID; values.SuperAdminEmail=SUPER_ADMIN_EMAIL; return {success:true,config:values};
}
function chatGPTUpdateConfig_(values) {
  const ss=SpreadsheetApp.openById(SHEET_ID), sh=ss.getSheetByName(SHEETS.CONFIG)||ss.insertSheet(SHEETS.CONFIG);
  if(sh.getLastRow()===0)sh.getRange(1,1,1,4).setValues([HEADERS.CONFIG]);
  Object.keys(values||{}).forEach(function(key){const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,4).getValues():[];let found=-1;for(let i=0;i<rows.length;i++)if(String(rows[i][0])===key){found=i+2;break;}if(found>0)sh.getRange(found,2,1,2).setValues([[values[key],'Updated by SuperAdmin via controlled admin execution surface']]);else sh.appendRow([key,values[key],'Created by SuperAdmin via controlled admin execution surface',new Date()]);});
  return {success:true,message:'Configuration updated.',config:chatGPTConfig_().config};
}
function chatGPTCreateStudent_(student){return saveStudent_(superAdminToken_(),student);}
function chatGPTUpdateStudent_(student){if(!student.StudentID)throw Error('StudentID is required for an update.');return saveStudent_(superAdminToken_(),student);}
function chatGPTDeleteStudent_(studentId){studentId=String(studentId||'').trim();if(!studentId)throw Error('StudentID is required.');const rows=rows_(SHEETS.STUDENTS),existing=rows.find(function(r){return String(r.StudentID||'')===studentId;});if(!existing)throw Error('Student not found: '+studentId);updateById_(SHEETS.STUDENTS,'StudentID',studentId,{Status:'DELETED',UpdatedAt:new Date()});return {success:true,message:'Student marked as deleted.',StudentID:studentId};}
function superAdminToken_(){const token=Utilities.getUuid(),user={UserID:'USR-SUPERADMIN',SIWESID:'SUPERADMIN',FullName:'Super Admin',Email:SUPER_ADMIN_EMAIL,Role:'SUPER_ADMIN',Status:'ACTIVE'};CacheService.getScriptCache().put('SESSION_'+token,JSON.stringify(user),120);return token;}
