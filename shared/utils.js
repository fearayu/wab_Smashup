(function(root){
  'use strict';
  function escapeHtml(value){return String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  root.SmashUtils={escapeHtml,escape:escapeHtml};
  if(typeof module!=='undefined')module.exports=root.SmashUtils;
})(typeof window==='undefined'?globalThis:window);