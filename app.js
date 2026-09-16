const defaultItems = [
  { name: "国語の教科書", icon: "📕", xp: 10 },
  { name: "算数の教科書", icon: "📘", xp: 10 },
  { name: "筆箱", icon: "✏️", xp: 10 },
  { name: "連絡帳", icon: "📓", xp: 10 },
  { name: "体操服", icon: "👕", xp: 10 },
];

const state = {
  items: JSON.parse(localStorage.getItem("quest-items") || "null") || defaultItems,
  completed: JSON.parse(localStorage.getItem("quest-completed") || "[]"),
  totalXp: Number(localStorage.getItem("quest-xp") || 0),
};

const $ = (id) => document.getElementById(id);

function save() {
  localStorage.setItem("quest-items", JSON.stringify(state.items));
  localStorage.setItem("quest-completed", JSON.stringify(state.completed));
  localStorage.setItem("quest-xp", String(state.totalXp));
}

function render() {
  const completed = state.items.filter((_, index) => state.completed.includes(index)).length;
  const total = state.items.length;
  $("questList").innerHTML = state.items.map((item, index) => {
    const done = state.completed.includes(index);
    return `<article class="quest-item ${done ? "done" : ""}">
      <span class="item-icon" aria-hidden="true">${item.icon}</span>
      <span class="item-name">${escapeHtml(item.name)}</span>
      <span class="item-xp">+${item.xp} XP</span>
      <button class="check" type="button" data-index="${index}" aria-label="${escapeHtml(item.name)}を${done ? "未完了に戻す" : "完了にする"}">${done ? "✓" : ""}</button>
    </article>`;
  }).join("");
  $("completedCount").textContent = completed;
  $("totalCount").textContent = total;
  $("progressBar").style.width = total ? `${completed / total * 100}%` : "0%";
  $("xpValue").textContent = state.totalXp;
  $("progressText").textContent = completed === total && total ? "クエストコンプリート！すごい！" : completed ? "いい調子！あと少しだよ" : "まずはひとつ選んでみよう";
  $("heroMessage").textContent = completed === total && total ? "明日の準備はばっちり！ゆっくり休もう。" : "ひとつずつで大丈夫。きみならできるよ。";
  const level = Math.floor(state.totalXp / 100) + 1;
  $("levelValue").textContent = level;
  $("levelXp").textContent = state.totalXp % 100;
  $("levelBar").style.width = `${state.totalXp % 100}%`;
  $("questList").querySelectorAll(".check").forEach((button) => button.addEventListener("click", () => toggle(Number(button.dataset.index))));
}

function toggle(index) {
  const position = state.completed.indexOf(index);
  if (position === -1) {
    state.completed.push(index);
    state.totalXp += state.items[index].xp;
  } else {
    state.completed.splice(position, 1);
    state.totalXp = Math.max(0, state.totalXp - state.items[index].xp);
  }
  save();
  render();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function showModal() {
  $("modal").hidden = false;
  $("itemName").focus();
}

$("addButton").addEventListener("click", showModal);
$("closeModal").addEventListener("click", () => $("modal").hidden = true);
$("modal").addEventListener("click", (event) => { if (event.target === $("modal")) $("modal").hidden = true; });
$("addForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.items.push({ name: form.get("itemName").trim(), icon: form.get("itemIcon"), xp: 10 });
  save();
  render();
  event.currentTarget.reset();
  $("modal").hidden = true;
});
$("resetButton").addEventListener("click", () => {
  if (state.completed.length && window.confirm("今日の進み具合をリセットしますか？")) {
    state.completed = [];
    state.totalXp = 0;
    save();
    render();
  }
});

const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
const today = new Date();
$("dateLabel").textContent = `${today.getMonth() + 1}月${today.getDate()}日（${dayNames[today.getDay()]}）`;
render();
