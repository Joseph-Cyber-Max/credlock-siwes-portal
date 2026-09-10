const API='https://script.google.com/macros/s/AKfycbyTj3mbqgJA9ySkyr1gDUxS5tYKQs_r5hbMG53ol36pjjSkXBEUxjlG226woRADwUR-qg/exec';
const TIMEOUT_MS=15000;
const CACHE_TTL=30000;
const memoryCache=new Map();
export function getSession(){try{return JSON.parse(sessionStorage.getItem('credlock_user')||'null')}catch{return null}}
export function saveSession(value){sessionStorage.setItem('credlock_user',JSON.stringify(value))}
export function clearSession(){sessionStorage.removeItem('credlock_user')}
const key=(a,p)=>a+':'+JSON.stringify(p||{});
function cached(a,p){const x=memoryCache.get(key(a,p));return x&&Date.now()-x.time<CACHE_TTL?x.value:null}
function put(a,p,v){memoryCache.set(key(a,p),{time:Date.now(),value:v});return v}
async function call(action,payload={},publicCall=false){
 const s=getSession()||{},token=s.token||s.Token||'',body={action,payload:{...payload,...(publicCall?{}:{token})}},controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
 try{
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(body),redirect:'follow',cache:'no-store',signal:controller.signal});
  if(!r.ok)throw new Error(`Backend connection failed (${r.status}).`);
  const text=await r.text();let j;try{j=JSON.parse(text)}catch{throw new Error('Backend returned an invalid response. Verify the Apps Script Web App deployment.')}
  if(!j.success)throw new Error(j.message||'Request failed');return j.data??j;
 }catch(e){if(e.name==='AbortError')throw new Error('Backend connection timed out. Please try again.');if(e instanceof TypeError)throw new Error('Unable to connect to the Apps Script backend. Check the Web App URL and access settings.');throw e}finally{clearTimeout(timer)}
}
async function read(a,p={}){const hit=cached(a,p);if(hit!==null)return hit;return put(a,p,await call(a,p))}
export const adminCall=(action,payload={})=>call(action,payload,false);
export const api={
 login:(email,pin)=>call('login',{email,password:pin,pin,key:email,siwesId:email},true),register:p=>call('register',p,true),resetRequest:email=>call('requestPasswordReset',{email},true),reset:(token,newPassword)=>call('resetPassword',{token,newPassword},true),changePassword:(oldPassword,newPassword)=>call('changePassword',{oldPassword,newPassword}),profile:()=>read('profile'),updateMyProfile:p=>call('updateMyProfile',p),
 dashboard:()=>read('dashboard'),students:()=>read('students'),attendance:()=>read('attendance'),logs:()=>read('dailyLogs'),tickets:()=>read('tickets'),learning:()=>read('learningPlan'),assessments:()=>read('assessments'),config:()=>read('config'),notifications:()=>read('notifications'),unreadCount:()=>read('unreadCount'),
 markNotificationRead:id=>call('markNotificationRead',{NotificationID:id}),markAllNotificationsRead:()=>call('markAllNotificationsRead'),hrDashboard:()=>read('hrDashboard'),hrReviewStudents:()=>read('hrReviewStudents'),hrApproveStudent:id=>call('hrApproveStudent',{StudentID:id}),hrRejectStudent:(id,reason)=>call('hrRejectStudent',{StudentID:id,Reason:reason}),hrAssignPlacement:p=>call('hrAssignPlacement',p),hrResetUserPassword:(id,password)=>call('hrResetUserPassword',{UserID:id,NewPassword:password}),
 saveStudent:p=>call('saveStudent',p),updateStudent:p=>call('saveStudent',p),deleteStudent:id=>adminCall('deletePortalUser',{UserID:id}),saveLog:p=>call('saveDailyLog',p),saveTicket:p=>call('saveTicket',p),saveAttendance:p=>call('saveAttendance',p),lookups:()=>read('lookups'),logout:()=>call('logout')
};
export {API};