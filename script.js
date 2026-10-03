// --- Mobile Sidebar Toggle ---
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const menuToggle = document.getElementById('menu-toggle');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
}

if (overlay) {
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}

// --- Navigation ---
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById('page-' + pageId).classList.add('active');
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }

  // Close sidebar on mobile item selection
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// --- Format Currency (LKR / Rs.) ---
function formatRs(amount) {
  return "Rs. " + Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- Local Storage Data ---
let tasks = JSON.parse(localStorage.getItem('suite_tasks')) || [];
let notes = JSON.parse(localStorage.getItem('suite_notes')) || [];
let transactions = JSON.parse(localStorage.getItem('suite_transactions')) || [];
let goals = JSON.parse(localStorage.getItem('suite_goals')) || [];

// --- PAGE 1: STOPWATCH ---
let swStartTime = 0, swElapsedTime = 0, swInterval = null, swIsRunning = false;
let swSplitStartTime = 0, swSplitElapsedTime = 0, swSplitCount = 0;

function formatTime(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const milli = ms % 1000;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${milli.toString().padStart(3, '0')}`;
}

function updateSwDisplays() {
  const now = Date.now();
  const total = swElapsedTime + (now - swStartTime);
  const split = swSplitElapsedTime + (now - swSplitStartTime);
  document.getElementById('sw-main-time').textContent = formatTime(total);
  document.getElementById('sw-split-time').textContent = formatTime(split);
}

function toggleStopwatch() {
  const startBtn = document.getElementById('sw-start-btn');
  const splitBtn = document.getElementById('sw-split-btn');

  if (!swIsRunning) {
    swStartTime = Date.now();
    swSplitStartTime = Date.now();
    swInterval = setInterval(updateSwDisplays, 10);
    swIsRunning = true;
    startBtn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
    splitBtn.disabled = false;
  } else {
    clearInterval(swInterval);
    swElapsedTime += Date.now() - swStartTime;
    swSplitElapsedTime += Date.now() - swSplitStartTime;
    swIsRunning = false;
    startBtn.innerHTML = '<i class="fa-solid fa-play"></i> START';
    splitBtn.disabled = true;
  }
}

function recordSplit() {
  if (!swIsRunning) return;
  const now = Date.now();
  const total = swElapsedTime + (now - swStartTime);
  const split = swSplitElapsedTime + (now - swSplitStartTime);
  swSplitCount++;

  const li = document.createElement('li');
  li.innerHTML = `<span>SPLIT ${swSplitCount}</span><span>${formatTime(total)}</span><span>${formatTime(split)}</span>`;
  document.getElementById('sw-laps').prepend(li);

  swSplitStartTime = Date.now();
  swSplitElapsedTime = 0;
}

function resetStopwatch() {
  clearInterval(swInterval);
  swStartTime = swElapsedTime = swSplitStartTime = swSplitElapsedTime = swSplitCount = 0;
  swIsRunning = false;
  document.getElementById('sw-main-time').textContent = '0:00:00.000';
  document.getElementById('sw-split-time').textContent = '0:00:00.000';
  document.getElementById('sw-start-btn').innerHTML = '<i class="fa-solid fa-play"></i> START';
  document.getElementById('sw-split-btn').disabled = true;
  document.getElementById('sw-laps').innerHTML = '';
}

// --- PAGE 2: TASKS ---
function renderTasks() {
  const container = document.getElementById('tasks-container');
  container.innerHTML = tasks.length === 0 ? '<p style="color:var(--text-muted); font-size:14px;">No tasks added yet.</p>' : '';
  
  tasks.forEach((task, index) => {
    const item = document.createElement('div');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;
    item.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
        <span>${task.text}</span>
      </div>
      <i class="fa-solid fa-trash action-icon" onclick="deleteTask(${index})"></i>
    `;
    container.appendChild(item);
  });
  localStorage.setItem('suite_tasks', JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById('task-input');
  if (!input.value.trim()) return;
  tasks.push({ text: input.value.trim(), completed: false });
  input.value = '';
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

// --- PAGE 3: NOTES ---
function renderNotes() {
  const container = document.getElementById('notes-container');
  container.innerHTML = notes.length === 0 ? '<p style="color:var(--text-muted); font-size:14px; grid-column:1/-1;">No saved notes.</p>' : '';

  notes.forEach((note, index) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <div>
        <div class="note-title">${note.title}</div>
        <div class="note-body">${note.content}</div>
      </div>
      <div class="note-footer">
        <span>${note.date}</span>
        <i class="fa-solid fa-trash action-icon" onclick="deleteNote(${index})"></i>
      </div>
    `;
    container.appendChild(card);
  });
  localStorage.setItem('suite_notes', JSON.stringify(notes));
}

function addNote() {
  const title = document.getElementById('note-title').value.trim();
  const content = document.getElementById('note-content').value.trim();
  if (!title || !content) return;

  notes.push({
    title,
    content,
    date: new Date().toLocaleDateString()
  });
  document.getElementById('note-title').value = '';
  document.getElementById('note-content').value = '';
  renderNotes();
}

function deleteNote(index) {
  notes.splice(index, 1);
  renderNotes();
}

// --- PAGE 4: MONEY & SAVINGS ---
function renderMoney() {
  let income = 0, expenses = 0, savedGoals = 0;

  const txList = document.getElementById('tx-list');
  txList.innerHTML = transactions.length === 0 ? '<li style="color:var(--text-muted); font-size:13px;">No recorded transactions.</li>' : '';

  transactions.forEach((tx, index) => {
    if (tx.type === 'income') income += Number(tx.amount);
    else expenses += Number(tx.amount);

    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.innerHTML = `
      <div>
        <div style="font-weight:600; font-size:14px;">${tx.desc}</div>
        <div style="font-size:12px; color:var(--text-muted);">${tx.date}</div>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <span class="tx-amount ${tx.type}">${tx.type === 'income' ? '+' : '-'} ${formatRs(tx.amount)}</span>
        <i class="fa-solid fa-trash action-icon" title="Delete Transaction" onclick="deleteTransaction(${index})"></i>
      </div>
    `;
    txList.appendChild(li);
  });

  const goalsContainer = document.getElementById('goals-container');
  goalsContainer.innerHTML = goals.length === 0 ? '<p style="color:var(--text-muted); font-size:13px;">No savings goals defined.</p>' : '';

  goals.forEach((goal, index) => {
    savedGoals += Number(goal.saved);
    const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100)) || 0;

    const goalCard = document.createElement('div');
    goalCard.className = 'goal-card';
    goalCard.innerHTML = `
      <div class="goal-header">
        <span style="font-weight:700; font-size:14px;">${goal.name}</span>
        <i class="fa-solid fa-trash action-icon" title="Delete Goal" onclick="deleteGoal(${index})"></i>
      </div>
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:6px;">
        ${formatRs(goal.saved)} / ${formatRs(goal.target)} (${percent}%)
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${percent}%;"></div>
      </div>
      <div class="goal-actions">
        <button class="btn btn-primary btn-xs" onclick="adjustGoal(${index}, 1000)">+ Rs. 1,000</button>
        <button class="btn btn-danger btn-xs" onclick="adjustGoal(${index}, -1000)">- Rs. 1,000</button>
      </div>
    `;
    goalsContainer.appendChild(goalCard);
  });

  const totalBalance = income - expenses;
  document.getElementById('stat-balance').textContent = formatRs(totalBalance);
  document.getElementById('stat-income').textContent = formatRs(income);
  document.getElementById('stat-expenses').textContent = formatRs(expenses);
  document.getElementById('stat-saved').textContent = formatRs(savedGoals);

  localStorage.setItem('suite_transactions', JSON.stringify(transactions));
  localStorage.setItem('suite_goals', JSON.stringify(goals));
}

function addTransaction() {
  const type = document.getElementById('tx-type').value;
  const amount = document.getElementById('tx-amount').value;
  const desc = document.getElementById('tx-desc').value.trim();

  if (!amount || amount <= 0 || !desc) return;

  transactions.unshift({
    type,
    amount: Number(amount),
    desc,
    date: new Date().toLocaleDateString()
  });

  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-desc').value = '';
  renderMoney();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  renderMoney();
}

function clearAllTransactions() {
  if (confirm('Are you sure you want to delete all transactions?')) {
    transactions = [];
    renderMoney();
  }
}

function addGoal() {
  const name = document.getElementById('goal-name').value.trim();
  const target = document.getElementById('goal-target').value;

  if (!name || !target || target <= 0) return;

  goals.push({
    name,
    target: Number(target),
    saved: 0
  });

  document.getElementById('goal-name').value = '';
  document.getElementById('goal-target').value = '';
  renderMoney();
}

function adjustGoal(index, amount) {
  goals[index].saved = Math.max(0, goals[index].saved + amount);
  renderMoney();
}

function deleteGoal(index) {
  goals.splice(index, 1);
  renderMoney();
}

// Initial Calls
renderTasks();
renderNotes();
renderMoney();