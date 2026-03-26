// Lightweight Logger for browser (adapted from user's logger.js)
(function(window){
  const Logger = {
    logFile: 'log-output.txt',
    _opts: {},
    init: function(opts){ this._opts = opts || {}; window.Logger = this; if(this._opts.autoCapture) this._attachAuto(); },
    _attachAuto: function(){ if(this._autoAttached) return; this._autoAttached = true; document.addEventListener('click', e=>{ if(e.target && e.target.tagName === 'BUTTON') this.log('Button clicked: ' + (e.target.id || e.target.textContent || '[no id/text]')); }); },
    log: function(msg){ try{
      const timestamp = new Date().toISOString();
      const fullMsg = `[${timestamp}] ${msg}`;
      console.log(fullMsg);
      // Capacitor write preserved but optional; only attempt if enabled in opts
      if(this._opts && this._opts.writeToFile && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem){
        try{
          window.Capacitor.Plugins.Filesystem.mkdir({ path: 'TESTING', directory: 'DOCUMENTS', recursive: true }).catch(()=>{});
          window.Capacitor.Plugins.Filesystem.appendFile({ path: this.logFile, data: fullMsg + '\n', directory: 'DOCUMENTS', encoding: 'utf8' }).catch(e=>{ console.warn('Logger file write failed:', e); });
        }catch(e){ console.warn('Logger file write error', e); }
      }
    }catch(e){ try{ console.warn('Logger.log error', e); }catch(_){} } }
  };
  // expose globally
  window.Logger = Logger;
})(window);
