// Credlock SIWES Portal — server-side access control and permission management.
// Super-admin enforcement is based on the authenticated session token and SUPER_ADMIN_EMAIL.

const ACCESS_CONTROL_ = {
  ROLES: ['SUPER_ADMIN','ADMIN','COORDINATOR','SUPERVISOR','SUPPORT','STUDENT'],
  PERMISSIONS: [
    'dashboard.view','students.view','students.create','students.edit','students.delete',
    'attendance.view','attendance.manage','logbook.view','logbook.manage',
    'tickets.view','tickets.manage','learningPlans.view','learningPlans.manage',
    'assessments.view','assessments.manage','reports.view','reports.manage',
    'users.view','users.create','users.edit','users.delete',
    'roles.manage','permissions.manage','settings.view','settings.manage',
    'targets.manage','notifications.manage','audit.view','system.manage'
  ],
  DEFAULTS: {
    SUPER_ADMIN: '*',
    ADMIN: ['dashboard.view','students.view','students.create','students.edit','students.delete','attendance.view','attendance.manage','logbook.view','logbook.manage','tickets.view','tickets.manage','learningPlans.view','learningPlans.manage','assessments.view','assessments.manage','reports.view','reports.manage','users.view','users.create','users.edit','users.delete','settings.view','settings.manage','targets.manage','notifications.manage','audit.view'],
    COORDINATOR: ['dashboard.view','students.view','students.create','students.edit','attendance.view','attendance.manage','logbook.view','logbook.manage','tickets.view','tickets.manage','learningPlans.view','learningPlans.manage','assessments.view','assessments.manage','reports.view','reports.manage','settings.view'],
    SUPERVISOR: ['dashboard.view','students.view','attendance.view','attendance.manage','logbook.view','logbook.manage','tickets.view','tickets.manage','learningPlans.view','assessments.view','assessments.manage','reports.view'],
    SUPPORT: ['dashboard.view','students.view','attendance.view','logbook.view','tickets.view','tickets.manage','learningPlans.view','reports.view'],
    STUDENT: ['dashboard.view','students.view','attendance.view','logbook.view','logbook.manage','tickets.view','tickets.manage','learningPlans.view','assessments.view','reports.view']
  }
};

function accessControl_(token) {
  const u = require_(token);
  requireSuperAdmin_(u);
  ensureAccessSheets_();
  const users = rowsAny_('ACCESS_USERS');
  const roleRows = rowsAny_('ACCESS_ROLES');
  const permissionRows = rowsAny_('ACCESS_PERMISSIONS');
  const effectiveUsers = rows_(SHEETS.USERS).map(function(x){
    const access = users.find(function(a){ return String(a.UserID) === String(x.UserID); }) || {};
    return {UserID:x.UserID,SIWESID:x.SIWESID,FullName:x.FullName,Email:x.Email,Phone:x.Phone,Role:x.Role,Status:x.Status,LastLogin:x.LastLogin,Permissions:permissionList_(x.UserID,x.Role,permissionRows)};
  });
  return ok_({users:effectiveUsers,roles:roleRows,permissions:permissionRows,roleNames:ACCESS_CONTROL_.ROLES,permissionNames:ACCESS_CONTROL_.PERMISSIONS},'Access control loaded.');
}

function updateUserAccess_(token,p) {
  const actor=require_(token); requireSuperAdmin_(actor); ensureAccessSheets_();
  const userId=String(p.UserID||p.userId||'').trim(); if(!userId) return err_('UserID is required.','VALIDATION');
  const target=rows_(SHEETS.USERS).find(function(x){return String(x.UserID)===userId;}); if(!target) return err_('User not found.','NOT_FOUND');
  const role=String(p.Role||target.Role||'STUDENT').toUpperCase(); const status=String(p.Status||target.Status||'ACTIVE').toUpperCase();
  if(ACCESS_CONTROL_.ROLES.indexOf(role)<0) return err_('Invalid role.','VALIDATION');
  if(['ACTIVE','INACTIVE','PENDING','SUSPENDED','DELETED'].indexOf(status)<0) return err_('Invalid account status.','VALIDATION');
  if(String(target.Email||'').toLowerCase()===SUPER_ADMIN_EMAIL && (role!=='SUPER_ADMIN'||status!=='ACTIVE')) return err_('The primary Super Admin cannot be demoted or disabled.','PROTECTED');
  updateById_(SHEETS.USERS,'UserID',userId,{Role:role,Status:status,UpdatedAt:new Date()});
  const permissions=Array.isArray(p.Permissions)?p.Permissions:[];
  const clean=permissions.filter(function(x){return ACCESS_CONTROL_.PERMISSIONS.indexOf(x)>=0;});
  upsertAccessUser_(userId,target.Email,role,status,clean);
  audit_(actor,'UPDATE_ACCESS','ACCESS_CONTROL',userId,'Role/status/permissions updated');
  return ok_({UserID:userId,Role:role,Status:status,Permissions:clean},'Access updated.');
}

function createPortalUser_(token,p) {
  const actor=require_(token); requireSuperAdmin_(actor); ensureAccessSheets_();
  const email=String(p.Email||p.email||'').trim().toLowerCase(); const name=String(p.FullName||p.fullName||'').trim();
  const password=String(p.Password||p.password||''); const role=String(p.Role||'STUDENT').toUpperCase();
  if(!name||!email||!password) return err_('Full name, email and password are required.','VALIDATION');
  if(ACCESS_CONTROL_.ROLES.indexOf(role)<0) return err_('Invalid role.','VALIDATION');
  if(rows_(SHEETS.USERS).some(function(x){return String(x.Email||'').toLowerCase()===email;})) return err_('A user with this email already exists.','DUPLICATE');
  const now=new Date(),id='USR-'+Utilities.getUuid().slice(0,8).toUpperCase(),sid='SIWES-'+new Date().getFullYear()+'-'+String(nextNumber_()).padStart(4,'0');
  append_(SHEETS.USERS,{UserID:id,SIWESID:sid,FullName:name,Email:email,Phone:p.Phone||'',Password:password,Role:role,Status:String(p.Status||'ACTIVE').toUpperCase(),CreatedAt:now,UpdatedAt:now});
  upsertAccessUser_(id,email,role,String(p.Status||'ACTIVE').toUpperCase(),Array.isArray(p.Permissions)?p.Permissions:[]);
  audit_(actor,'CREATE_USER','ACCESS_CONTROL',id,'Portal user created');
  return ok_({UserID:id,SIWESID:sid,Email:email,Role:role},'Portal user created.');
}

function deletePortalUser_(token,p) {
  const actor=require_(token); requireSuperAdmin_(actor); ensureAccessSheets_();
  const id=String(p.UserID||p.userId||''); const target=rows_(SHEETS.USERS).find(function(x){return String(x.UserID)===id;});
  if(!target) return err_('User not found.','NOT_FOUND');
  if(String(target.Email||'').toLowerCase()===SUPER_ADMIN_EMAIL) return err_('The primary Super Admin cannot be deleted.','PROTECTED');
  updateById_(SHEETS.USERS,'UserID',id,{Status:'DELETED',UpdatedAt:new Date()});
  updateAnyById_('ACCESS_USERS','UserID',id,{Status:'DELETED',UpdatedAt:new Date()});
  audit_(actor,'DELETE_USER','ACCESS_CONTROL',id,'User disabled as deleted');
  return ok_({UserID:id,Status:'DELETED'},'User deleted.');
}

function setRolePermissions_(token,p) {
  const actor=require_(token); requireSuperAdmin_(actor); ensureAccessSheets_();
  const role=String(p.Role||p.role||'').toUpperCase(); if(ACCESS_CONTROL_.ROLES.indexOf(role)<0) return err_('Invalid role.','VALIDATION');
  const perms=(Array.isArray(p.Permissions)?p.Permissions:[]).filter(function(x){return ACCESS_CONTROL_.PERMISSIONS.indexOf(x)>=0;});
  const sh=sheetAny_('ACCESS_ROLES'); const data=sh.getDataRange().getValues(); const h=data[0].map(String); const ri=h.indexOf('Role');
  let found=-1; for(let i=1;i<data.length;i++) if(String(data[i][ri]).toUpperCase()===role){found=i+1;break;}
  const obj={Role:role,Description:role+' portal role',Permissions:perms.join(','),Status:'ACTIVE',UpdatedAt:new Date()};
  if(found>1) updateAnyById_('ACCESS_ROLES','Role',role,obj); else appendAny_('ACCESS_ROLES',obj);
  audit_(actor,'UPDATE_ROLE_PERMISSIONS','ACCESS_CONTROL',role,'Role permission set updated');
  return ok_({Role:role,Permissions:perms},'Role permissions updated.');
}

function requirePermission_(token,permission){
  const u=require_(token); if(!hasPermission_(u,permission)) throw Error('Permission denied: '+permission); return u;
}
function hasPermission_(u,permission){
  if(String(u.Email||'').toLowerCase()===SUPER_ADMIN_EMAIL || String(u.Role||'').toUpperCase()==='SUPER_ADMIN') return true;
  ensureAccessSheets_(); const rows=rowsAny_('ACCESS_ROLES'); const role=String(u.Role||'STUDENT').toUpperCase();
  const r=rows.find(function(x){return String(x.Role||'').toUpperCase()===role;});
  const perms=r?String(r.Permissions||'').split(',').map(function(x){return x.trim();}).filter(Boolean):((ACCESS_CONTROL_.DEFAULTS[role]||[]));
  return perms.indexOf('*')>=0 || perms.indexOf(permission)>=0;
}
function requireSuperAdmin_(u){if(String(u.Email||'').toLowerCase()!==SUPER_ADMIN_EMAIL || String(u.Role||'').toUpperCase()!=='SUPER_ADMIN') throw Error('Super Admin permission required.');}

function ensureAccessSheets_(){
  const ss=SpreadsheetApp.openById(SHEET_ID), now=new Date();
  const defs={
    ACCESS_ROLES:['Role','Description','Permissions','Status','UpdatedAt'],
    ACCESS_PERMISSIONS:['Permission','Module','Description','Status'],
    ACCESS_USERS:['UserID','Email','Role','Status','Permissions','UpdatedAt']
  };
  Object.keys(defs).forEach(function(name){let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);const h=defs[name];if(sh.getLastRow()===0)sh.getRange(1,1,1,h.length).setValues([h]);sh.setFrozenRows(1);});
  const pr=sheetAny_('ACCESS_PERMISSIONS'); if(pr.getLastRow()<2){const rows=ACCESS_CONTROL_.PERMISSIONS.map(function(p){const parts=p.split('.');return [p,parts[0],parts[1]||'Portal permission','ACTIVE'];});pr.getRange(2,1,rows.length,4).setValues(rows);}
  const rr=sheetAny_('ACCESS_ROLES'); const existing=rowsAny_('ACCESS_ROLES'); ACCESS_CONTROL_.ROLES.forEach(function(role){if(!existing.some(function(x){return String(x.Role||'').toUpperCase()===role;})){const d=ACCESS_CONTROL_.DEFAULTS[role];appendAny_('ACCESS_ROLES',{Role:role,Description:role+' portal role',Permissions:Array.isArray(d)?d.join(','):String(d||'*'),Status:'ACTIVE',UpdatedAt:now});}});
  const users=rows_(SHEETS.USERS); users.forEach(function(u){if(!rowsAny_('ACCESS_USERS').some(function(x){return String(x.UserID)===String(u.UserID);}))upsertAccessUser_(u.UserID,u.Email,u.Role,u.Status,[]);});
}
function permissionList_(userId,role,roleRows){const r=roleRows.find(function(x){return String(x.Role||'').toUpperCase()===String(role||'').toUpperCase();});const p=r?String(r.Permissions||'').split(',').map(function(x){return x.trim();}).filter(Boolean):[];return p.indexOf('*')>=0?ACCESS_CONTROL_.PERMISSIONS.slice():p;}
function upsertAccessUser_(id,email,role,status,permissions){ensureAccessSheetOnce_();const sh=sheetAny_('ACCESS_USERS'),data=sh.getDataRange().getValues(),h=data[0].map(String),idx=h.indexOf('UserID');for(let i=1;i<data.length;i++){if(String(data[i][idx])===String(id)){const o={Email:email,Role:role,Status:status,Permissions:permissions.join(','),UpdatedAt:new Date()};updateAnyById_('ACCESS_USERS','UserID',id,o);return;}}appendAny_('ACCESS_USERS',{UserID:id,Email:email,Role:role,Status:status,Permissions:permissions.join(','),UpdatedAt:new Date()});}
function ensureAccessSheetOnce_(){const ss=SpreadsheetApp.openById(SHEET_ID);['ACCESS_ROLES','ACCESS_PERMISSIONS','ACCESS_USERS'].forEach(function(name){if(!ss.getSheetByName(name)){const headers=name==='ACCESS_ROLES'?['Role','Description','Permissions','Status','UpdatedAt']:name==='ACCESS_PERMISSIONS'?['Permission','Module','Description','Status']:['UserID','Email','Role','Status','Permissions','UpdatedAt'];ss.insertSheet(name).getRange(1,1,1,headers.length).setValues([headers]);}});}
function sheetAny_(name){const sh=SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);if(!sh)throw Error('Missing access sheet: '+name);return sh;}
function rowsAny_(name){const sh=sheetAny_(name),v=sh.getDataRange().getValues();if(v.length<2)return[];const h=v[0].map(String);return v.slice(1).filter(function(r){return r.some(function(x){return x!==''&&x!==null;});}).map(function(r){const o={};h.forEach(function(k,i){if(k)o[k]=r[i] instanceof Date?r[i].toISOString():r[i];});return o;});}
function appendAny_(name,obj){const sh=sheetAny_(name),h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);sh.appendRow(h.map(function(k){return obj[k]===undefined?'':obj[k];}));}
function updateAnyById_(name,idField,id,data){const sh=sheetAny_(name),v=sh.getDataRange().getValues(),h=v[0].map(String),idx=h.indexOf(idField);if(idx<0)throw Error('Missing id field: '+idField);for(let i=1;i<v.length;i++){if(String(v[i][idx])===String(id)){Object.keys(data).forEach(function(k){const c=h.indexOf(k);if(c>=0)sh.getRange(i+1,c+1).setValue(data[k]);});return true;}}return false;}

function dispatchAccessControl_(action,token,p){
  switch(action){
    case 'accessControl': return accessControl_(token);
    case 'updateUserAccess': return updateUserAccess_(token,p);
    case 'createPortalUser': return createPortalUser_(token,p);
    case 'deletePortalUser': return deletePortalUser_(token,p);
    case 'setRolePermissions': return setRolePermissions_(token,p);
    default: return null;
  }
}
