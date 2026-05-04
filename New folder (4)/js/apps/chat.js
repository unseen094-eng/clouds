/**
 * CloudsOS — Chat App
 * Unique implementation with simulated AI contacts and message history.
 */
(() => {
  function render() {
    return `
      <div class="chat-app">
        <div class="chat-sidebar">
          <div class="chat-search">
            <input type="text" placeholder="Search contacts..." />
          </div>
          <div class="chat-contacts" id="chat-contacts">
             <div class="chat-contact active" data-id="bot">
                <div class="contact-avatar">🤖</div>
                <div class="contact-info">
                   <div class="contact-name">Cloud AI</div>
                   <div class="contact-last">Online</div>
                </div>
             </div>
             <div class="chat-contact" data-id="admin">
                <div class="contact-avatar">🛡️</div>
                <div class="contact-info">
                   <div class="contact-name">System Admin</div>
                   <div class="contact-last">Away</div>
                </div>
             </div>
          </div>
        </div>
        <div class="chat-main">
          <div class="chat-header">
            <div class="contact-avatar">🤖</div>
            <div class="contact-name">Cloud AI</div>
          </div>
          <div class="chat-messages app-scroll" id="chat-messages">
            <div class="msg-bubble bot">Hello! I am the Cloud OS assistant. How can I help you today?</div>
          </div>
          <div class="chat-input-area">
             <input type="text" id="chat-in" placeholder="Type a message..." />
             <button id="chat-send">Send</button>
          </div>
        </div>
      </div>
    `;
  }

  async function onOpen(wid) {
    const win = OSUtils.el(wid);
    const msgs = win.querySelector('#chat-messages');
    const input = win.querySelector('#chat-in');
    const send = win.querySelector('#chat-send');

    function addMsg(text, type) {
      const b = document.createElement('div');
      b.className = `msg-bubble ${type}`;
      b.textContent = text;
      msgs.appendChild(b);
      msgs.scrollTop = msgs.scrollHeight;
    }

    send.onclick = async () => {
      const val = input.value.trim();
      if (!val) return;
      addMsg(val, 'user');
      input.value = '';

      // Simulated typing
      const loader = document.createElement('div');
      loader.className = 'msg-bubble bot loading';
      loader.textContent = '...';
      msgs.appendChild(loader);

      const res = await CloudAPI.ai.chat(val);
      loader.remove();
      addMsg(res.data.message, 'bot');
    };

    input.onkeydown = (e) => { if(e.key === 'Enter') send.onclick(); };
  }

  OSAppRegistry.register({
    id: 'chat',
    name: 'Messenger',
    icon: CloudAPI.ICONS.chat,
    category: 'communication',
    color: 'linear-gradient(135deg, #a855f7, #ec4899)',
    defaultWidth: 750, defaultHeight: 550,
    render, onOpen,
  });
})();
