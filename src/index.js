import './style.css';

class Task {
  constructor(text) {
    this.text = text;
    this.startTime = new Date().toLocaleTimeString();
    this.endTime = null;
    this.done = false;
  }
}

const openTaskListElement = document.querySelector('#openTasks');
const doneTaskListElement = document.querySelector('#doneTasks');
const newTaskInputElement = document.querySelector('#newTaskInput');
const addNewTaskButtonElement = document.querySelector('#newTaskButton');
const tasksSorters = document.querySelectorAll('.tasksSorter');
const headerSearchElement = document.querySelector('#hsearch');
const clearOpenTasksButtonElement = document.querySelector(
  '#clearOpenTasksButton',
);
const clearDoneTasksButtonElement = document.querySelector(
  '#clearDoneTasksButton',
);

addNewTaskButtonElement.addEventListener('click', () => handleTaskCreation());

clearOpenTasksButtonElement.addEventListener(
  'click',
  () => (openTaskListElement.innerHTML = ''),
);

clearDoneTasksButtonElement.addEventListener(
  'click',
  () => (doneTaskListElement.innerHTML = ''),
);

tasksSorters.forEach(selector => {
  selector.addEventListener('change', event => handleListSort(event, selector));
});

headerSearchElement.addEventListener('keyup', handleSearch);

function handleTaskCreation() {
  let taskText = newTaskInputElement.value;
  if (taskText === '') return;
  newTaskInputElement.value = '';
  const task = new Task(taskText);
  let taskJson = JSON.stringify(task);
  console.log(taskJson);
  createTaskElement(task);
  updateLocalStorage();
}

function createTaskElement(task) {
  let taskElem = document.createElement('div');
  taskElem.className = 'taskItem';
  task.done
    ? doneTaskListElement.insertBefore(taskElem, doneTaskListElement.firstChild)
    : openTaskListElement.insertBefore(
        taskElem,
        openTaskListElement.firstChild,
      );

  let doneCheckbox = document.createElement('input');
  doneCheckbox.type = 'checkbox';
  doneCheckbox.checked = task.done;
  taskElem.appendChild(doneCheckbox);
  doneCheckbox.onchange = event => handleTaskCheckbox(event);

  let paragraph = document.createElement('p');
  paragraph.textContent = task.text;
  taskElem.appendChild(paragraph);
  paragraph.ondblclick = event =>
    handleTextEdit(paragraph, taskElem, timeBlock);

  let timeBlock = document.createElement('div');
  timeBlock.className = 'timeBlock alignright';
  taskElem.appendChild(timeBlock);
  let startTimeElem = document.createElement('p');
  startTimeElem.className = 'startTimeText';
  startTimeElem.textContent = task.startTime;
  timeBlock.appendChild(startTimeElem);
  let endTimeElem = document.createElement('p');
  endTimeElem.className = 'endTimeText';
  endTimeElem.textContent = task.endTime;
  timeBlock.appendChild(endTimeElem);

  let deleteButton = document.createElement('button');
  deleteButton.className = 'deleteButton';
  taskElem.appendChild(deleteButton);
  deleteButton.onclick = () => handleTaskRemoval(deleteButton);
}

function handleTaskRemoval(deleteButton) {
  let task = deleteButton.parentNode;
  task.parentNode.removeChild(task);
  updateLocalStorage();
}

function handleTextEdit(paragraph, taskElem, timeBlock) {
  let input = document.createElement('input');
  input.value = paragraph.textContent;
  taskElem.removeChild(paragraph);
  taskElem.insertBefore(input, timeBlock);
  input.addEventListener('keydown', e => {
    if (e.keyCode == 13) {
      paragraph.textContent = input.value;
      taskElem.removeChild(input);
      taskElem.insertBefore(paragraph, timeBlock);
    } else if (e.keyCode == 27) {
      taskElem.removeChild(input);
      taskElem.insertBefore(paragraph, timeBlock);
    }
    updateLocalStorage();
  });
}

function handleTaskCheckbox(event) {
  let task = event.target.parentNode;
  if (event.target.checked) {
    task.querySelector(
      '.endTimeText',
    ).textContent = new Date().toLocaleTimeString();
    doneTaskListElement.appendChild(task);
  } else {
    task.querySelector('.endTimeText').textContent = '';
    openTaskListElement.appendChild(task);
  }
  updateLocalStorage();
}

function handleListSort(event, selector) {
  let taskList = event.target.parentNode.parentNode.querySelector('.taskList');
  let taskListElems = sortTasks(taskList.children, selector.value);
  buildTaskList(taskListElems, taskList);

  localStorage.setItem(
    'selectors',
    [...tasksSorters].map(selector => selector.value),
  );
  updateLocalStorage();
}

function sortTasks(taskList, mode) {
  switch (mode) {
    case 'date_asc':
      return [...taskList].sort((a, b) =>
        getLastTime(a).localeCompare(getLastTime(b)),
      );
    case 'date_desc':
      return [...taskList].sort((a, b) =>
      getLastTime(b).localeCompare(getLastTime(a)),
      );
    case 'text_asc':
      return [...taskList].sort((a, b) => getText(b).localeCompare(getText(a)));
    case 'text_desc':
      return [...taskList].sort((a, b) => getText(a).localeCompare(getText(b)));
  }
}

function buildTaskList(elems, taskList) {
  taskList.innerHTML = '';
  elems.forEach(elem => taskList.appendChild(elem));
}

function handleSearch() {
  let searched = headerSearchElement.value;
  let tasks = document.querySelectorAll('.taskItem');
  tasks.forEach(task => {
    let text = getText(task);
    if (text.indexOf(searched) < 0) {
      task.style.display = 'none';
    } else {
      task.style.display = 'flex';
    }
  });
}

function getStartTime(task) {
  return task.querySelector('.startTimeText').textContent;
}

function getEndTime(task) {
  return task.querySelector('.endTimeText').textContent;
}

function getLastTime(task) {
  return getEndTime(task) ? getEndTime(task) : getStartTime(task);
}

function getText(task) {
  return task.querySelector('p').textContent;
}

function updateLocalStorage() {
  let openTaskElems = openTaskListElement.children;
  let doneTaskElems = doneTaskListElement.children;
  let openTasks = [...openTaskElems].map(task => convertTask(task)).reverse();
  let doneTasks = [...doneTaskElems]
    .map(task => convertTask(task, true))
    .reverse();
  localStorage.setItem('openTasks', JSON.stringify(openTasks));
  localStorage.setItem('doneTasks', JSON.stringify(doneTasks));
}

function convertTask(elem, done = false) {
  let task = new Task();
  task.text = getText(elem);
  task.startTime = getStartTime(elem);
  task.endTime = getEndTime(elem);
  task.done = done;
  return task;
}

function restoreFromLocalStorage() {
  let openTasks = JSON.parse(localStorage.getItem('openTasks')) || [];
  let doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
  openTasks.forEach(task => createTaskElement(task));
  doneTasks.forEach(task => createTaskElement(task));

  let selectors = localStorage.getItem('selectors') || "date_desc";

  selectors.split(',')
    .forEach((selector, index) => (tasksSorters[index].value = selector));
}

restoreFromLocalStorage();
