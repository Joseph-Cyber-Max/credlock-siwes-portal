// SuperAdmin database reset utilities.
// Destructive: clears portal records while preserving sheet headers.
// The SuperAdmin passcode remains a Script Property, not source-controlled.

const RESETTABLE_SHEETS_ = [
  'STUDENTS','ATTENDANCE','DAILY_ACTIVITY_LOG','ISSUE_LOG',
  'SUPERVISOR_ASSESSMENT','MONTHLY_EVALUATION','DAILY_LOG',
  'WEEKLY_SUMMARY','WEEKLY_ASSESSMENT','MONTHLY_REVIEW',
  'NOTIFICATIONS','AUDIT_LOG','REPORTS','EVIDENCE','STUDENT_SKILLS',
  'SKILLS','LEARNING_PLAN'
];

function resetPortalDatabase_(newSuperAdminPassword) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const cleared = [];

  RESETTABLE_SHEETS_.forEach(function(name) {
    const sh = ss.getSheetByName(name);
    if (!sh) return;
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    if (lastRow > 1 && lastCol > 0) {
      sh.getRange(2, 1, lastRow - 1, lastCol).clearContent();
      cleared.push(name + ':' + (lastRow - 1));
    }
  });

  // USERS is handled separately so the portal starts with exactly one account.
  let users = ss.getSheetByName(SHEETS.USERS);
  if (!users) users = ss.insertSheet(SHEETS.USERS);
  if (users.getLastRow() > 1) users.getRange(2, 1, users.getLastRow() - 1, users.getLastColumn()).clearContent();

  const password = String(newSuperAdminPassword || PropertiesService.getScriptProperties().getProperty(SUPER_ADMIN_PASSWORD_PROPERTY) || '');
  if (!password) throw Error('SUPER_ADMIN_PASSWORD Script Property is required before creating the SuperAdmin account.');
  PropertiesService.getScriptProperties().setProperty(SUPER_ADMIN_PASSWORD_PROPERTY, password);

  const now = new Date();
  append_(SHEETS.USERS, {
    UserID:'USR-SUPERADMIN', SIWESID:'SUPERADMIN', FullName:'Super Admin',
    Email:SUPER_ADMIN_EMAIL, Phone:'', Password:password, Role:'SUPER_ADMIN',
    Status:'ACTIVE', CreatedAt:now, UpdatedAt:now
  });

  return {
    success:true,
    message:'Portal database reset completed. All portal records were cleared and the SuperAdmin account was recreated.',
    superAdminEmail:SUPER_ADMIN_EMAIL,
    sheetsCleared:cleared
  };
}

function resetPortalDatabaseForSuperAdmin_() {
  const password = PropertiesService.getScriptProperties().getProperty(SUPER_ADMIN_PASSWORD_PROPERTY);
  return resetPortalDatabase_(password);
}
