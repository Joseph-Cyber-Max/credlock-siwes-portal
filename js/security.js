export function sanitizeText(value){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
export function roleOf(user){return String(user?.Role||user?.role||'Student').toLowerCase()}
export function can(user,action){const role=roleOf(user);if(role.includes('superadmin'))return true;if(role.includes('admin'))return !['deleteSystem','manageSuperAdmin'].includes(action);if(role.includes('supervisor'))return ['view','attendance','logbook','assessment','student'].includes(action);return ['view','attendance','logbook','learning'].includes(action)}
export function safeOpen(url){try{const u=new URL(url);if(['https:'].includes(u.protocol))window.open(u.href,'_blank','noopener,noreferrer')}catch{}}
