/**
 * CloudsOS — AI Assistant App
 * Powered by CloudAPI.ai
 */
(() => {
  function render() {
    return `
      <div class="ai-body">
        <div class="ai-header">
          <div class="ai-logo">✨</div>
          <div class="ai-title">Cloud Assistant</div>
          <div class="ai-status" id="ai-status">Online</div>
        </div>
        <div class="ai-chat app-scroll" id="ai-chat">
          <div class="ai-msg ai-msg-bot">Hello! I am your Clouds OS Assistant. How can I help you explore the cloud today?</div>
        </div>
        <div class="ai-input-wrap">
          <input type="text" id="ai-input" placeholder="Ask me anything..." autocomplete="off" />
          <button id="ai-send">Send</button>
        </div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;

    const chat = win.querySelector('#ai-chat');
    const input = win.querySelector('#ai-input');
    const sendBtn = win.querySelector('#ai-send');
    const status = win.querySelector('#ai-status');

    function appendMsg(text, type) {
      const msg = OSUtils.make('div', { className: `ai-msg ai-msg-${type}` }, text);
      chat.appendChild(msg);
      chat.scrollTop = chat.scrollHeight;
    }

    async function sendMessage() {
      const prompt = input.value.trim();
      if (!prompt) return;

      input.value = '';
      appendMsg(prompt, 'user');
      
      status.textContent = 'Thinking...';
      status.classList.add('typing');
      
      const res = await CloudAPI.ai.chat(prompt);
      
      status.textContent = 'Online';
      status.classList.remove('typing');
      
      if (res.success) {
        appendMsg(res.data.message, 'bot');
      } else {
        appendMsg('Sorry, I encountered an error connecting to the cloud.', 'bot');
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    sendBtn.addEventListener('click', sendMessage);
  }

  OSAppRegistry.register({
    id: 'ai',
    name: 'AI Assistant',
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" fill="url(#ag1)"/><path d="M12 7l-2 4h4l-2 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="ag1" x1="3" y1="3" x2="21" y2="21"><stop stop-color="#7c6ff7"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs></svg>',
    category: 'productivity',
    color: 'linear-gradient(135deg,rgba(124,111,247,0.25),rgba(56,189,248,0.2))',
    defaultWidth: 400, defaultHeight: 550,
    render, onOpen,
  });
})();
