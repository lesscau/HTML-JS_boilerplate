import './style.css';

class Task {
  constructor(text) {
    this.text = text;
    this.done = false;
    this.startTime = new Date().toLocaleTimeString();
    this.endTime = null;
  }
}

const openTaskListElement = document.querySelector("#openTasks");
const doneTaskListElement = document.querySelector("#doneTasks");
const newTaskInputElement = document.querySelector("#newTaskInput");
const addNewTaskButtonElement = document.querySelector("#newTaskButton");
const clearOpenTasksButtonElement = document.querySelector("#clearOpenTasksButton");
const clearDoneTasksButtonElement = document.querySelector("#clearDoneTasksButton");
const tasksSorters = document.querySelectorAll(".tasksSorter");
const headerSearchElement = document.querySelector("#hsearch");

addNewTaskButtonElement.addEventListener("click", () => createTask());
clearOpenTasksButtonElement.addEventListener("click", () => openTaskListElement.innerHTML = "");
clearDoneTasksButtonElement.addEventListener("click", () => doneTaskListElement.innerHTML = "");

tasksSorters.forEach(selector => {
  selector.addEventListener("change", event => {
    let taskList = event.target.parentNode.parentNode.querySelector(".taskList");

    let taskListElems = sortElems(taskList.children, selector.value);
    taskList.innerHTML="";
    taskListElems.forEach(elem => taskList.appendChild(elem));
  })
});

headerSearchElement.addEventListener("keyup", handleSearch);
  
function handleSearch() {
  let searched = headerSearchElement.value;
  let tasks = document.querySelectorAll(".taskItem");
  tasks.forEach(task => {
    let text = task.querySelector("p").textContent;
    if (text.indexOf(searched) < 0){
      task.style.display = "none";
    } else {
      task.style.display = "flex";
    }
  });
}

function sortElems(taskList, mode) {
  switch(mode) {
    case 'date_asc':
      return Array.from(taskList).sort((a, b) => getCreatedTime(a).localeCompare(getCreatedTime(b)));
    case 'date_desc':
      return Array.from(taskList).sort((a, b) => getCreatedTime(b).localeCompare(getCreatedTime(a)));
    case 'text_asc':
      return Array.from(taskList).sort((a, b) => getText(b).localeCompare(getText(a)));
    case 'text_desc':
      return Array.from(taskList).sort((a, b) => getText(a).localeCompare(getText(b)));
  }
}

function getCreatedTime(task) {
  return task.querySelector(".startTimeText").textContent;
}

function getText(task) {
  return task.querySelector("p").textContent;
}

  function createTask() {
    let taskText = newTaskInputElement.value;
    if (taskText === "") return;
    newTaskInputElement.value = "";
    const task = new Task(taskText);
    createTaskElement(task);
  }

  function createTaskElement(task) {
    let taskElem = document.createElement("div");
    taskElem.className = "taskItem";
    openTaskListElement.insertBefore(taskElem, openTaskListElement.firstChild);

    let doneCheckbox = document.createElement('input');
    doneCheckbox.type = 'checkbox';
    taskElem.appendChild(doneCheckbox)
    doneCheckbox.onchange = event => { 
      let task = doneCheckbox.parentNode;
      if (event.target.checked) {
        task.querySelector(".endTimeText").textContent = new Date().toLocaleTimeString();
        openTaskListElement.removeChild(task);
        doneTaskListElement.appendChild(task);
      } else {
        openTaskListElement.appendChild(task);
        doneTaskListElement.removeChild(task);
      }
    };
    let paragraph = document.createElement('p');
    paragraph.textContent = task.text;
    taskElem.appendChild(paragraph)
    paragraph.ondblclick = event => {
      let input = document.createElement('input');
      input.value = paragraph.textContent;
      taskElem.removeChild(paragraph);
      taskElem.insertBefore(input, timeBlock);
      input.addEventListener("keydown", e => {
        if (e.keyCode == 13) {
          paragraph.textContent = input.value;
          taskElem.removeChild(input);
          taskElem.insertBefore(paragraph, timeBlock);
        } else if (e.keyCode == 27) {
          taskElem.removeChild(input);
          taskElem.insertBefore(paragraph, timeBlock);
        }
      })
    }

    let timeBlock = document.createElement('div');
    timeBlock.className = "timeBlock alignright";
    taskElem.appendChild(timeBlock);
    let startTimeElem = document.createElement('p');
    startTimeElem.className = "startTimeText";
    startTimeElem.textContent = task.startTime;
    timeBlock.appendChild(startTimeElem)
    let endTimeElem = document.createElement('p');
    endTimeElem.className = "endTimeText";
    timeBlock.appendChild(endTimeElem)

    let deleteButton = document.createElement('button');
    deleteButton.className="deleteButton";
    taskElem.appendChild(deleteButton);
    deleteButton.onclick = () => {
      let task = deleteButton.parentNode;
      task.parentNode.removeChild(task);
    }
  }

