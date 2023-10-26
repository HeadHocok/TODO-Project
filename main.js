const themeButton = document.querySelector('#theme-btn');
const form = document.querySelector("#form");
const textInput = document.querySelector("#text-input");
const dateInput = document.querySelector("#date-input");
const tasksList = document.querySelector('#tasks-list');
const executeAllButton = document.querySelector('#execute-all-button');
const deleteAllButton = document.querySelector('#delete-all-button');
const emptyListMessage = document.querySelector('#empty-list-message');
const editDateInput = document.querySelector("#edit-date-input");

form.addEventListener('submit', addTask);

tasksList.addEventListener('click', deleteTask);

tasksList.addEventListener('click', doneTask);

tasksList.addEventListener('click', editTask);

tasksList.addEventListener('click', saveTask);

executeAllButton.addEventListener('click', doneAll);

deleteAllButton.addEventListener('click', deleteAll);

document.addEventListener('mousemove', multipleSelection)

let isDarkTheme = false;

let IsEditing = false;

let currentTaskNumber = 1;

let isSelecting = false;
let isSingleSelecting = false;
let selectedElements = [];

document.addEventListener('DOMContentLoaded', loadTasksFromLocalStorage);

if (editDateInput) {
    editDateInput.addEventListener('input', function () {
        validateDateInput(editDateInput);
    });
} else {
    dateInput.addEventListener('input', function () {
        validateDateInput(dateInput);
    });
}

document.addEventListener('mousedown', function (event) {
    if (event.target.type === "button" || event.target.type === "text") {
        return;
    }

    isSelecting = true;
    isSingleSelecting = true;
    selectedElements = []; // Сбрасываем
});

document.addEventListener('mouseup', function (event) {
    if(!isSelecting) {
        return;
    }

    if (isSingleSelecting){
        singleSelection(event);
    }

    isSelecting = false;
    isSingleSelecting = false;
});

themeButton.addEventListener("click", function () {
    const body = document.body;
    const themeButton = document.querySelector("#theme-btn");
    const themeImg = themeButton.querySelector("#theme-img");
    const themeStatus = themeButton.querySelector("#theme-status-img");

    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        themeImg.src = "assets/icon/toggle-off.svg";
        themeStatus.src = "assets/icon/light-theme.svg";
        isDarkTheme = false;
    } else {
        body.classList.add('dark-theme');
        themeImg.src = "assets/icon/toggle-on.svg";
        themeStatus.src = "assets/icon/dark-theme.svg";
        isDarkTheme = true;
    }

    localStorage.setItem('isDarkTheme', isDarkTheme.toString());
});

function validateDateInput(input) {
    const datePattern = /^\d{2}\.\d{2}\.\d{2}$/;
    const errorMessage = input.parentElement.querySelector('.error-message');

    if (input.value === "") {
        if (errorMessage) errorMessage.textContent = ''
        else input.setCustomValidity("");
        return true;
    } else if (!datePattern.test(input.value)) {
        if (errorMessage) errorMessage.textContent = "ДД.ММ.ГГ";
        else input.setCustomValidity("Введите дату в формате ДД.ММ.ГГ");
        return false;
    } else {
        if (errorMessage) errorMessage.textContent = ''
        else input.setCustomValidity("");
        return true;
    }
}

function multipleSelection(event) {
    if (!isSelecting) {
        return;
    }

    const childTaskItem = event.target.closest('.task-item');
    if (childTaskItem === null) {
        return;
    }

    const taskItem = childTaskItem.closest('.task-item');

    if (taskItem.classList.contains('done-task')) { //чтобы консолька не вопела
        return;
    }

    isSingleSelecting = false;

    const elements = document.querySelectorAll('.task-item');
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const rect = element.getBoundingClientRect();

        if (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        ) {
            if (!selectedElements.includes(element)) {
                element.classList.add('selected');
                selectedElements.push(element);
            }
        }
    }
}

function singleSelection(event) {
    if (!event.target.closest('.task-item')) {
        return;
    }

    const childTaskItem = event.target.closest('.task-item');
    if (childTaskItem === null) {
        return;
    }

    const taskItem = childTaskItem.closest('.task-item');

    if (taskItem.classList.contains('done-task')) {
        return;
    }

    const taskColor = event.target.closest('.task-item');

    if (taskColor.classList.contains('selected')) {
        taskColor.classList.remove('selected');
    } else {
        taskColor.classList.add('selected');
    }
}

function addTask(event) {
    event.preventDefault();

    if (textInput.value === "") {
        return;
    }

    const taskText = textInput.value;
    const taskDate = dateInput.value;

    const taskHTML = `
                    <tr class="task-item" data-action="task" id="task-item" data-selected="false">
                        <th scope="row" class="task-number">${currentTaskNumber}</th>
                        <td class="task-text">
                            <span class="task-content">${taskText}</span>
                            <input type="text" class="editInput" placeholder="Редактировать задачу..." hidden>
                        </td>
                        <td style="vertical-align: middle;" class="task-date">
                            <span class="task-date-content">${taskDate}</span>
                            <input type="text" class="editDateInput" id="edit-date-input" placeholder="⌚" hidden>
                            <span class="error-message"></span>
                        </td>
                        <td class="text-end">
                            <button type="button" data-action="edit" class="btn edit-btn">
                                <svg width="25" height="25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.707,5.565,18.435,2.293a1,1,0,0,0-1.414,0L3.93,15.384a.991.991,0,0,0-.242.39l-1.636,4.91A1,1,0,0,0,3,22a.987.987,0,0,0,.316-.052l4.91-1.636a.991.991,0,0,0,.39-.242L21.707,6.979A1,1,0,0,0,21.707,5.565ZM7.369,18.489l-2.788.93.93-2.788,8.943-8.944,1.859,1.859ZM17.728,8.132l-1.86-1.86,1.86-1.858,1.858,1.858Z"/></svg>
                            </button>
                            <button type="button" data-action="save" class="btn save-btn" hidden>
                                <svg width="25" height="25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 612"><path d="M606.2 120.8L489.9 4.6C487.4 2.1 482.5 0 477.4 0H434.3H176H40.7C18.2 0.4 0 18.7 0 41.1v529.7c0 22.5 18.3 40.7 40.7 40.7h86.3h368.7h75.6c22.5 0 40.7-18.3 40.7-40.7V131.7C611.1 128.4 609.5 124.2 606.2 120.8zM419.3 31.2v136.2H376 376v-136.2H419.3zM344.6 31.2v137H192.6c-0.8 0-0.8-0.8-0.8-0.8V31.2H344.6zM141.9 580.9V390.7c0-35.7 29.1-64.7 64.7-64.7h208.4c35.7 0 64.7 29.1 64.7 64.7v190.1H141.9V580.9zM580.4 570.9c0 5-4.2 10-10 10h-59.8V390.7c0-52.3-43.2-95.5-95.5-95.5H207.5c-52.3 0-95.5 43.2-95.5 95.5v190.1H40.6c-5 0-10-4.2-10-10V41.1c0-5 4.2-10 10-10h120.4v136.2c0 17.5 14.1 31.5 31.5 31.5h225.9c17.5 0 31.5-14.1 31.5-31.5V31.2h23.2l107.1 107.1L580.4 570.9z M422.6 490.3c0 8.3-6.6 14.9-14.9 14.9H217.5c-8.3 0-14.9-6.6-14.9-14.9 0-8.3 6.6-14.9 14.9-14.9h189.3C415.9 475.4 422.6 482.1 422.6 490.3z M422.6 410.7c0 8.3-6.6 14.9-14.9 14.9H217.5c-8.3 0-14.9-6.6-14.9-14.9 0-8.3 6.6-14.9 14.9-14.9h189.3C415.9 394.8 422.6 401.6 422.6 410.7z"/></svg>                            
                            </button>
                            <button type="button" data-action="empty" class="btn btn-empty" hidden>
                                <img src="assets/icon/empty-button.svg" width="25" height="25" alt="empty">
                            </button>
                            <button type="button" data-action="delete" class="btn delete-btn">
                                <img src="assets/icon/delete.svg"  alt="delete">
                            </button>
                        </td>
                    </tr>`;

    tasksList.insertAdjacentHTML('beforeend', taskHTML);

    textInput.value = "";
    dateInput.value = "";
    textInput.focus();

    checkEmptyMessage();
    updateTaskNumbers();

    saveTasksToLocalStorage();
}

function doneTask(event) {
    if (event.target.dataset.action !== 'done') {
        return;
    }

    const parentNode = event.target.closest('.task-item');

    parentNode.classList.add('done-task');
}

function deleteTask(event) {
    if (event.target.dataset.action !== 'delete' || IsEditing === true) {
        return;
    }

    const parentNode = event.target.closest('.task-item')
    parentNode.remove();

    checkEmptyMessage();
    updateTaskNumbers();

    saveTasksToLocalStorage();
}

function editTask(event) {
    if (event.target.dataset.action !== 'edit' || IsEditing === true) {
        return;
    }

    const doneCheck = event.target.closest('.task-item');

    if (doneCheck.classList.contains('done-task')) {
        return;
    }

    const parentTaskItem = event.target.closest('.task-item');
    const taskTitle = parentTaskItem.querySelector(".task-text");

    if (taskTitle.classList.contains('done-task')) {
        return;
    }


    IsEditing = true;
    const parentNode = event.target.closest('.task-item');
    const taskContent = parentNode.querySelector(".task-content");
    const editInput = parentNode.querySelector(".editInput");
    const taskDateContent = parentNode.querySelector(".task-date-content");
    const editDateInput = parentNode.querySelector(".editDateInput");
    const editButton = parentNode.querySelector(".edit-btn");
    const saveButton = parentNode.querySelector(".save-btn");

    editInput.value = taskContent.textContent;
    editInput.hidden = false;
    taskContent.hidden = true;

    editDateInput.value = taskDateContent.textContent;
    editDateInput.hidden = false;
    taskDateContent.hidden = true;

    editButton.hidden = true;
    saveButton.hidden = false;

    editInput.focus();

    editInput.addEventListener('input', function () {
        validateDateInput(editInput);
    });
    editDateInput.addEventListener('input', function () {
        validateDateInput(editDateInput);
    });

    saveTasksToLocalStorage();
}

function saveTask(event) {
    const parentNode = event.target.closest('.task-item');
    const taskContent = parentNode.querySelector(".task-content");
    const editInput = parentNode.querySelector(".editInput");
    const taskDateContent = parentNode.querySelector(".task-date-content");
    const editDateInput = parentNode.querySelector(".editDateInput");
    const editButton = parentNode.querySelector(".edit-btn");
    const saveButton = parentNode.querySelector(".save-btn");

    if (event.target.dataset.action !== 'save' || editInput.value === "") {
        return;
    }

    if (!validateDateInput(editDateInput)) {
        return;
    }

    taskContent.textContent = editInput.value;
    taskContent.hidden = false;
    editInput.hidden = true;

    taskDateContent.textContent = editDateInput.value;
    taskDateContent.hidden = false;
    editDateInput.hidden = true;

    editButton.hidden = false;
    saveButton.hidden = true;

    IsEditing = false;

    saveTasksToLocalStorage();
}

function checkEmptyMessage () {
    if (tasksList.childElementCount === 0) {
        emptyListMessage.removeAttribute('hidden');
        executeAllButton.setAttribute('hidden', 'true');
        deleteAllButton.setAttribute('hidden', 'true');
    } else {
        emptyListMessage.setAttribute('hidden', 'true');
        executeAllButton.removeAttribute('hidden');
        deleteAllButton.removeAttribute('hidden');
    }
}

function doneAll() {
    if (IsEditing === true) {
        return;
    }

    const checkboxes = document.querySelectorAll('.selected');
    for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const childTaskItem = checkbox.closest('.task-item');
        const taskItem = childTaskItem.closest('.task-item');

        if (taskItem) {
            const parentNode = taskItem.closest('.task-item');

            parentNode.classList.add('done-task');
            parentNode.classList.remove('selected');

            const editButton = parentNode.querySelector(".edit-btn");
            const emptyButton = parentNode.querySelector(".btn-empty");
            if (editButton) {
                editButton.remove();
                emptyButton.hidden = false;
            }
        }
    }

    checkEmptyMessage();
    updateTaskNumbers();

    saveTasksToLocalStorage();
}

function deleteAll() {
    if (IsEditing === true) {
        return;
    }

    const checkboxes = document.querySelectorAll('.selected');
    for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const taskItem = checkbox.closest('.task-item');
        if (taskItem) {
            taskItem.remove();
        }
    }

    checkEmptyMessage();
    updateTaskNumbers();

    saveTasksToLocalStorage();
}
function updateTaskNumbers() {
    const taskItems = document.querySelectorAll('.task-item');
    for (let i = 0; i < taskItems.length; i++) {
        const taskItem = taskItems[i];
        const taskNumberCell = taskItem.querySelector('.task-number');
        taskNumberCell.innerHTML = (i + 1).toString();
    }
}

function saveTasksToLocalStorage() {
    const taskItems = document.querySelectorAll('.task-item');
    const tasks = [];

    for (let i = 0; i < taskItems.length; i++) {
        const taskItem = taskItems[i];
        const taskContent = taskItem.querySelector(".task-content").textContent;
        const taskDateContent = taskItem.querySelector(".task-date-content").textContent;
        const isDone = taskItem.classList.contains('done-task');

        tasks.push({ content: taskContent, date: taskDateContent, done: isDone });
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const tasksData = JSON.parse(localStorage.getItem('tasks')) || [];

    isDarkTheme = localStorage.getItem('isDarkTheme') === 'true';

    const body = document.body;
    const themeButton = document.querySelector("#theme-btn");
    const themeImg = themeButton.querySelector("#theme-img");
    const themeStatus = themeButton.querySelector("#theme-status-img");

    if (isDarkTheme) {
        body.classList.add('dark-theme');
        themeImg.src = "assets/icon/toggle-on.svg";
        themeStatus.src = "assets/icon/dark-theme.svg";
    } else {
        body.classList.remove('dark-theme');
        themeImg.src = "assets/icon/toggle-off.svg";
        themeStatus.src = "assets/icon/light-theme.svg";
    }

    for (let i = 0; i < tasksData.length; i++) {
        const taskData = tasksData[i];

        const taskHTML = `
            <tr class="task-item" data-action="task" id="task-item" data-selected="false">
                <th scope="row" class="task-number">${currentTaskNumber}</th>
                <td class="task-text">
                    <span class="task-content">${taskData.content}</span>
                    <input type="text" class="editInput" placeholder="Редактировать задачу..." hidden>
                </td>
                <td style="vertical-align: middle;" class="task-date">
                    <span class="task-date-content">${taskData.date}</span>
                    <input type="text" class="editDateInput" placeholder="⌚" hidden>
                    <span class="error-message"></span>
                </td>
                <td class="text-end">
                    <button type="button" data-action="edit" class="btn edit-btn">
                        <svg width="25" height="25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.707,5.565,18.435,2.293a1,1,0,0,0-1.414,0L3.93,15.384a.991.991,0,0,0-.242.39l-1.636,4.91A1,1,0,0,0,3,22a.987.987,0,0,0,.316-.052l4.91-1.636a.991.991,0,0,0,.39-.242L21.707,6.979A1,1,0,0,0,21.707,5.565ZM7.369,18.489l-2.788.93.93-2.788,8.943-8.944,1.859,1.859ZM17.728,8.132l-1.86-1.86,1.86-1.858,1.858,1.858Z"/></svg>
                    </button>
                    <button type="button" data-action="save" class="btn save-btn" hidden>
                        <svg width="25" height="25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 612"><path d="M606.2 120.8L489.9 4.6C487.4 2.1 482.5 0 477.4 0H434.3H176H40.7C18.2 0.4 0 18.7 0 41.1v529.7c0 22.5 18.3 40.7 40.7 40.7h86.3h368.7h75.6c22.5 0 40.7-18.3 40.7-40.7V131.7C611.1 128.4 609.5 124.2 606.2 120.8zM419.3 31.2v136.2H376 376v-136.2H419.3zM344.6 31.2v137H192.6c-0.8 0-0.8-0.8-0.8-0.8V31.2H344.6zM141.9 580.9V390.7c0-35.7 29.1-64.7 64.7-64.7h208.4c35.7 0 64.7 29.1 64.7 64.7v190.1H141.9V580.9zM580.4 570.9c0 5-4.2 10-10 10h-59.8V390.7c0-52.3-43.2-95.5-95.5-95.5H207.5c-52.3 0-95.5 43.2-95.5 95.5v190.1H40.6c-5 0-10-4.2-10-10V41.1c0-5 4.2-10 10-10h120.4v136.2c0 17.5 14.1 31.5 31.5 31.5h225.9c17.5 0 31.5-14.1 31.5-31.5V31.2h23.2l107.1 107.1L580.4 570.9z M422.6 490.3c0 8.3-6.6 14.9-14.9 14.9H217.5c-8.3 0-14.9-6.6-14.9-14.9 0-8.3 6.6-14.9 14.9-14.9h189.3C415.9 475.4 422.6 482.1 422.6 490.3z M422.6 410.7c0 8.3-6.6 14.9-14.9 14.9H217.5c-8.3 0-14.9-6.6-14.9-14.9 0-8.3 6.6-14.9 14.9-14.9h189.3C415.9 394.8 422.6 401.6 422.6 410.7z"/></svg>                            
                    </button>
                    <button type="button" data-action="empty" class="btn btn-empty" hidden>
                        <img src="assets/icon/empty-button.svg" width="25" height="25" alt="empty">
                    </button>
                    <button type="button" data-action="delete" class="btn delete-btn">
                        <img src="assets/icon/delete.svg"  alt="delete">
                    </button>
                </td>
            </tr>`;

        tasksList.insertAdjacentHTML('beforeend', taskHTML);

        if (taskData.done) {
            const taskItem = tasksList.lastElementChild;
            taskItem.classList.add('done-task');

            const editButton = taskItem.querySelector(".edit-btn");
            const emptyButton = taskItem.querySelector(".btn-empty");
            if (editButton) {
                editButton.remove();
                emptyButton.hidden = false;
            }
        }
    }

    updateTaskNumbers();
    checkEmptyMessage();
}