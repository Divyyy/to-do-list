const inputBox = document.getElementById("input-box");
const listCont = document.getElementById("list-container");
const container = document.getElementById("container");
const modeIcon = document.getElementById("mode-icon");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const reminderInput = document.getElementById("reminder-time");

// Function to add a task
function addtask() {
    if (inputBox.value === '') {
        alert("No task was added!");
        return;
    }

    // Create the task item
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;

    // Add reminder if set
    if (reminderInput.value) {
        const reminderTime = new Date(reminderInput.value).getTime();
        li.setAttribute("data-reminder", reminderTime); // Store reminder in attribute
        scheduleReminder(li, reminderTime);
    }

    // Add delete button to task
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
    listCont.appendChild(li);

    // Clear input fields
    inputBox.value = "";
    reminderInput.value = "";

    saveData(); // Save task to localStorage
    updateProgress(); // Update progress bar
}

// Event listener to mark tasks or remove them
listCont.addEventListener("click", function(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("tick");
        updateProgress();
    } else if (e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
        saveData();
        updateProgress();
    }
}, false);

// Function to enable task editing
function editTask(taskElement) {
    const currentText = taskElement.textContent.replace("\u00d7", "").trim(); // Exclude the delete button
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "edit-input";

    // Replace the task content with the input field
    taskElement.innerHTML = "";
    taskElement.appendChild(input);

    // Focus on the input and add event listeners
    input.focus();
    input.addEventListener("blur", () => saveEdit(taskElement, input)); // Save on blur
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit(taskElement, input); // Save on Enter
    });
}

// Save edited task
function saveEdit(taskElement, input) {
    const newText = input.value.trim();
    if (newText === "") {
        alert("Task cannot be empty!");
        input.focus();
        return;
    }
    taskElement.innerHTML = newText;

    // Add delete button back
    const span = document.createElement("span");
    span.innerHTML = "\u00d7";
    taskElement.appendChild(span);

    saveData(); // Save changes to localStorage
}

// Modify event listener for editing tasks
listCont.addEventListener("dblclick", function (e) {
    if (e.target.tagName === "LI") {
        editTask(e.target);
    }
});


// Function to schedule a reminder
function scheduleReminder(taskElement, reminderTime) {
    const currentTime = Date.now();
    const timeDifference = reminderTime - currentTime;

    if (timeDifference > 0) {
        setTimeout(() => {
            alert(`Reminder: ${taskElement.innerText}`);
        }, timeDifference);
    }
}

// Load saved tasks and set reminders on page load
function showTask() {
    listCont.innerHTML = localStorage.getItem("data") || "";
    const reminders = JSON.parse(localStorage.getItem("reminders") || "{}");

    Array.from(listCont.children).forEach(taskElement => {
        const reminderTime = reminders[taskElement.innerText];
        if (reminderTime) {
            taskElement.setAttribute("data-reminder", reminderTime);
            scheduleReminder(taskElement, reminderTime);
        }
    });

    updateProgress();
}

// Show the current date
function showDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("current-date").textContent = today.toLocaleDateString(undefined, options);
}

// Toggle night mode
function toggleNightMode() {
    container.classList.toggle("night-mode");
    modeIcon.src = container.classList.contains("night-mode") ? "moon.png" : "sun.png";
}



function changeBackground() {
    const backgroundSelector = document.getElementById("background-selector");
    const selectedBackground = backgroundSelector.value;

    // Remove previous background classes
    container.classList.remove("default-background", "background1", "background2", "background3");

    // Apply selected background class
    if (selectedBackground === "default") {
        container.classList.add("default-background");
    } else if (selectedBackground === "background1") {
        container.classList.add("background1");
    } else if (selectedBackground === "background2") {
        container.classList.add("background2");
    } else if (selectedBackground === "background3") {
        container.classList.add("background3");
    }
}


// Update progress bar
function updateProgress() {
    const allTasks = Array.from(listCont.querySelectorAll("li"));
    const completedTasks = allTasks.filter(task => task.classList.contains("tick"));
    const totalTasks = allTasks.filter(task => task.style.display !== 'none').length;
    const completedCount = completedTasks.filter(task => task.style.display !== 'none').length;

 
    if (totalTasks === 0) {
        progressText.innerText = "No task";
        progressBar.value = 0;
    } else {
        const progress = (completedCount / totalTasks) * 100;
        progressBar.value = progress;
        progressText.innerText = `${Math.round(progress)}% completed`;
    }
}
// Right-click to toggle task priority
function markAsPriority(taskElement) {
    taskElement.classList.toggle("high-priority");
    saveData();
}

listCont.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    if (e.target.tagName === "LI") {
        markAsPriority(e.target);
    }
});

// Initialize functions on page load
window.onload = function() {
    showDate();
    showTask();
};
