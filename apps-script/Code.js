// ============================================================
// Code.gs — Entry points and shared response helpers
// ============================================================

function doGet(){
  let title = 'Credlock SIWES Portal';
  try { title = getConfig_('PortalName') || title; } catch (_) {}
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(title)
    .addMetaTag('viewport','width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(name){
  if (!name) return '';
  return HtmlService.createHtmlOutputFromFile(String(name)).getContent();
}

function sanitizeResponse_(value, seen) {
  if (value === null || value === undefined) return value;
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  seen = seen || [];
  if (t === 'object') {
    if (seen.indexOf(value) >= 0) return '[Circular]';
    seen.push(value);
    if (Array.isArray(value)) return value.map(function(v){ return sanitizeResponse_(v, seen); });
    const out = {};
    Object.keys(value).forEach(function(k){ out[k] = sanitizeResponse_(value[k], seen); });
    return out;
  }
  return String(value);
}

function jsonSafe_(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(jsonSafe_);
  if (value && typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach(function(k) { out[k] = jsonSafe_(value[k]); });
    return out;
  }
  return value;
}

function ok(data,msg){
  return { success:true, message:msg||'Success', data:sanitizeResponse_(data === undefined || data === null ? {} : data) };
}
function err(msg,code){return{success:false,message:msg,errorCode:code||'ERROR'}}
function api(fn){
  try {
    const result = fn();
    if (result === undefined || result === null) return err('Server function returned an empty response.', 'EMPTY_SERVER_RESPONSE');
    if (typeof result !== 'object') return err('Server function returned an invalid response.', 'INVALID_SERVER_RESPONSE');
    return result;
  } catch(e) {
    Logger.log('SERVER_ERROR: ' + (e && e.stack ? e.stack : e));
    return err((e && e.message) || 'Server error', 'SERVER_ERROR');
  }
}

function pingPortal(){
  return ok({ status: 'ONLINE', serverTime: new Date().toISOString(), runtime: 'Apps Script V8' }, 'CREDLOCK SIWES server is responding.');
}
