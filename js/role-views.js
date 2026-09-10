import {api,getSession} from './api.js';
export const ROLE_META={SUPER_ADMIN:{label:'Super Admin',landing:'dashboard'},ADMIN:{label:'Administrator',landing:'dashboard'},HR:{label:'HR',landing:'people'},COORDINATOR:{label:'SIWES Coordinator',landing:'dashboard'},SUPERVISOR:{label:'Supervisor',landing:'dashboard'},SUPPORT:{label:'Technical Support',landing:'dashboard'},STUDENT:{label:'Student',landing:'dashboard'}};
export function currentRole(){return String(getSession()?.Role||'STUDENT').toUpperCase()}
export async function loadNotifications(){return api.notifications()}
export async function openHRDashboard(){return api.dashboard()}
export async function approveStudent(studentId){return api.hrApproveStudent?api.hrApproveStudent(studentId):null}
