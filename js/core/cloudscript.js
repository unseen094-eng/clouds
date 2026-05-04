/**
 * CloudScript — Custom Scripting Language for Clouds OS
 * Simple, powerful, and native to the cloud.
 */
const CloudScript = (() => {
  
  // ── Environment ──
  const _globals = {
    // System Commands
    print: (...args) => console.log('[CloudScript]', ...args),
    notify: (title, body, type) => OSNotifications.show({ title, body, type }),
    openApp: (id) => OSAppRegistry.launch(id),
    closeWindow: (wid) => OSWindowManager.close(wid),
    createFile: async (path, content) => await CloudAPI.files.write(path, content),
    deleteFile: async (path) => await CloudAPI.files.delete(path),
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    setWallpaper: (type) => OSWallpaper.setWallpaper(type),
    setTheme: (theme) => {
      if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
    }
  };

  /**
   * Extremely simple "Lisp-like" or "Functional" interpreter for Cloud OS.
   * Syntax: command(arg1, arg2) or simple JS-like statements.
   * For this demo, we'll use a safer eval-like approach or a basic parser.
   */
  async function execute(code) {
    console.log('[CloudScript] Executing script...');
    
    // For a real language, we'd build a full Lexer/Parser.
    // For this demonstration, we'll implement a restricted Sandbox evaluator
    // that interprets lines as function calls to our _globals.
    
    const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
    const context = { ..._globals, vars: {} };

    for (let line of lines) {
      try {
        await _interpretLine(line, context);
      } catch (err) {
        console.error('[CloudScript] Error:', err);
        _globals.notify('Script Error', err.message, 'error');
        break;
      }
    }
  }

  async function _interpretLine(line, ctx) {
    // Basic match for: funcName(arg1, arg2, ...)
    const match = line.match(/^(\w+)\((.*)\)$/);
    if (match) {
      const funcName = match[1];
      const argsStr = match[2];
      
      // Parse arguments (very basic)
      const args = argsStr.split(',').map(arg => {
        arg = arg.trim();
        if (arg.startsWith('"') && arg.endsWith('"')) return arg.slice(1, -1);
        if (!isNaN(arg)) return Number(arg);
        if (arg === 'true') return true;
        if (arg === 'false') return false;
        return ctx.vars[arg] !== undefined ? ctx.vars[arg] : arg;
      });

      if (ctx[funcName]) {
        return await ctx[funcName](...args);
      } else {
        throw new Error(`Unknown command: ${funcName}`);
      }
    }

    // Basic assignment: var x = value
    const assignMatch = line.match(/^var\s+(\w+)\s*=\s*(.*)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      let value = assignMatch[2].trim();
      if (value.startsWith('"')) value = value.slice(1, -1);
      else if (!isNaN(value)) value = Number(value);
      ctx.vars[varName] = value;
      return;
    }

    // Basic if statement (very crude)
    if (line.startsWith('if')) {
       // Complexity limited for this demo
    }
  }

  return { execute, globals: _globals };
})();
