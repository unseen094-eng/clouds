/**
 * CloudsOS — Tasks App
 * A unique task manager with priority sorting and local persistence.
 */
(() => {
  function render() {
    return `
      <div class="tasks-app">
        <div class="tasks-sidebar">
          <div class="tasks-nav active">📥 All Tasks</div>
          <div class="tasks-nav">⭐ Important</div>
          <div class="tasks-nav">📅 Planned</div>
          <div class="tasks-nav">✅ Completed</div>
        </div>
        <div class="tasks-main">
          <div class="tasks-header">
            <h1>My Tasks</h1>
            <div class="tasks-input-row">
              <input type="text" id="task-in" placeholder="Add a new task..." />
              <button id="task-add">Add</button>
            </div>
          </div>
          <div class="tasks-list app-scroll" id="task-list"></div>
        </div>
      </div>
    `;
  }

  async function onOpen(wid) {
    const win = OSUtils.el(wid);
    const list = win.querySelector('#task-list');
    const input = win.querySelector('#task-in');
    const addBtn = win.querySelector('#task-add');

    let tasks = OSStorage.load('tasks_data') || [
      { id: 1, text: 'Welcome to Clouds Tasks', completed: false, important: true },
      { id: 2, text: 'Check out the App Store', completed: true, important: false }
    ];

    function save() {
      OSStorage.save('tasks_data', tasks);
      renderTasks();
    }

    function renderTasks() {
      list.innerHTML = '';
      tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        item.innerHTML = `
          <div class="task-check" id="check-${task.id}">${task.completed ? '✓' : ''}</div>
          <div class="task-text">${task.text}</div>
          <div class="task-star ${task.important ? 'active' : ''}" id="star-${task.id}">★</div>
          <div class="task-del" id="del-${task.id}">✕</div>
        `;

        item.querySelector(`#check-${task.id}`).onclick = () => {
          task.completed = !task.completed;
          save();
        };
        item.querySelector(`#star-${task.id}`).onclick = () => {
          task.important = !task.important;
          save();
        };
        item.querySelector(`#del-${task.id}`).onclick = () => {
          tasks = tasks.filter(t => t.id !== task.id);
          save();
        };

        list.appendChild(item);
      });
    }

    addBtn.onclick = () => {
      const text = input.value.trim();
      if (!text) return;
      tasks.unshift({ id: Date.now(), text, completed: false, important: false });
      input.value = '';
      save();
    };

    input.onkeydown = (e) => { if(e.key === 'Enter') addBtn.onclick(); };

    renderTasks();
  }

  OSAppRegistry.register({
    id: 'tasks',
    name: 'Tasks',
    icon: CloudAPI.ICONS.tasks,
    category: 'productivity',
    color: 'linear-gradient(135deg, #3b82f6, #2dd4bf)',
    defaultWidth: 600, defaultHeight: 500,
    render, onOpen,
  });
})();
