/**
 * CloudsOS — Terminal App
 */
(() => {
  const COMMANDS = {
    help: {
      desc: 'Show available commands',
      exec: () => [
        'Available commands:',
        ...Object.keys(COMMANDS).map(cmd => `  ${cmd.padEnd(12)} - ${COMMANDS[cmd].desc}`)
      ]
    },
    ls: {
      desc: 'List directory contents',
      exec: (args, state) => {
        const path = args[0] || state.cwd;
        // Mock directory listing
        return ['Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Desktop'];
      }
    },
    clear: {
      desc: 'Clear the terminal screen',
      exec: (args, state, win) => {
        win.querySelector('#term-output').innerHTML = '';
        return null;
      }
    },
    neofetch: {
      desc: 'Show system information',
      exec: () => [
        '         .---.         Clouds OS 1.0.0',
        '        /     \\        ---------------',
        '       | () () |       OS: Clouds OS (Vanilla JS)',
        '        \\  ^  /        Kernel: Event-Driven 1.0',
        '         \'---\'         Shell: CloudShell v1.0',
        '       /|     |\\       Uptime: 2 mins',
        '      / |     | \\      Resolution: ' + window.innerWidth + 'x' + window.innerHeight,
        '     /  |_____|  \\     WM: CloudsWindowManager',
        '    /   |     |   \\    Theme: Glassmorphism / Dark'
      ]
    },
    echo: {
      desc: 'Print text to terminal',
      exec: (args) => [args.join(' ')]
    },
    whoami: {
      desc: 'Show current user',
      exec: () => [OSState.get('user')?.name || 'Cloud User']
    },
    date: {
      desc: 'Show current date and time',
      exec: () => [new Date().toLocaleString()]
    },
    calc: {
      desc: 'Evaluate a mathematical expression',
      exec: (args) => {
        try {
          const res = eval(args.join(' '));
          return [res.toString()];
        } catch(e) {
          return ['Error: Invalid expression'];
        }
      }
    },
    open: {
      desc: 'Launch an application',
      exec: async (args) => {
        const appId = args[0];
        if (!appId) return ['Usage: open <app_id>'];
        await OSAppRegistry.launch(appId);
        return [`Launching ${appId}...`];
      }
    },
    run: {
      desc: 'Execute a CloudScript file',
      exec: async (args) => {
        const path = args[0];
        if (!path) return ['Usage: run <path>'];
        const res = await CloudAPI.files.read(path);
        if (res.success && res.data) {
          await CloudScript.execute(res.data.content);
          return [`Execution of ${path} complete.`];
        } else {
          return [`Error: Could not read file ${path}`];
        }
      }
    },
    ask: {
      desc: 'Ask the Cloud AI Assistant',
      exec: async (args) => {
        const prompt = args.join(' ');
        if (!prompt) return ['Usage: ask <question>'];
        const res = await CloudAPI.ai.chat(prompt);
        return [res.data.message];
      }
    },
    history: {
      desc: 'Show command history',
      exec: (args, state) => state.history
    },
    exit: {
      desc: 'Close the terminal',
      exec: (args, state, win, wid) => {
        OSWindowManager.close(wid);
        return null;
      }
    }
  };

  function render() {
    return `
      <div class="terminal-body" id="terminal-body">
        <div class="terminal-output" id="term-output">
          <div>Welcome to Clouds OS Terminal v1.0.0</div>
          <div>Type 'help' to see available commands.</div>
          <br>
        </div>
        <div class="terminal-input-row">
          <span class="terminal-prompt" id="term-prompt">user@clouds:~$</span>
          <input type="text" class="terminal-input" id="term-input" spellcheck="false" autocomplete="off" autofocus />
        </div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;

    const input = win.querySelector('#term-input');
    const output = win.querySelector('#term-output');
    const state = {
      cwd: '/',
      history: [],
      histIdx: -1
    };

    function appendLine(text, type = '') {
      const line = document.createElement('div');
      if (type) line.className = `term-line-${type}`;
      line.textContent = text;
      output.appendChild(line);
      win.querySelector('.terminal-body').scrollTop = output.scrollHeight;
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const raw = input.value.trim();
        if (!raw) return;
        
        appendLine(`${win.querySelector('#term-prompt').textContent} ${raw}`, 'cmd');
        state.history.push(raw);
        state.histIdx = state.history.length;
        
        const [cmd, ...args] = raw.split(' ');
        const handler = COMMANDS[cmd.toLowerCase()];
        
        if (handler) {
          (async () => {
            const result = await handler.exec(args, state, win, wid);
            if (result) {
              result.forEach(line => appendLine(line));
            }
          })();
        } else {
          appendLine(`Command not found: ${cmd}`, 'error');
        }
        
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        if (state.histIdx > 0) {
          state.histIdx--;
          input.value = state.history[state.histIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (state.histIdx < state.history.length - 1) {
          state.histIdx++;
          input.value = state.history[state.histIdx];
        } else {
          state.histIdx = state.history.length;
          input.value = '';
        }
      }
    });

    // Auto-focus input when clicking anywhere in terminal
    win.querySelector('.terminal-body').addEventListener('click', () => input.focus());
    input.focus();
  }

  OSAppRegistry.register({
    id: 'terminal',
    name: 'Terminal',
    icon: CloudAPI.ICONS.terminal,
    category: 'system',
    color: 'linear-gradient(135deg,rgba(148,163,184,0.25),rgba(71,85,105,0.2))',
    defaultWidth: 650, defaultHeight: 400,
    render, onOpen,
  });
})();
