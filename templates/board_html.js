
function getTaskTemplate(task) {
  return `
     <div class="card">

        <button class="${task.category}">
        ${formatCategory(task.category)}
        </button>
        <h4>${task.title}</h4>
        <p>${task.description}</p>
        <span>${task.priority}</span>
    </div>
    `;
}
