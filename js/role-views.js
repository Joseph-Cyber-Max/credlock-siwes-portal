import {api,getSession} from './api.js';
export const ROLE_META={SUPER_ADMIN:{label:'Super Admin',landing:'dashboard'},ADMIN:{label:'Administrator',landing:'dashboard'},HR:{label:'HR',landing:'people'},COORDINATOR:{label:'SIWES Coordinator',landing:'dashboard'},SUPERVISOR:{label:'Supervisor',landing:'dashboard'},SUPPORT:{label:'Technical Support',landing:'dashboard'},STUDENT:{label:'Student',landing:'dashboard'}};
export function currentRole(){return String(getSession()?.Role||'STUDENT').toUpperCase()}
export const roleLabel=()=>ROLE_META[currentRole()]?.label||currentRole();
export const loadNotifications=()=>api.notifications();
export const openHRDashboard=()=>api.hrDashboard();
export const approveStudent=studentId=>api.hrApproveStudent(studentId);
export const rejectStudent=(studentId,reason)=>api.hrRejectStudent(studentId,reason);
