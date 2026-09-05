/* =========================================
   NEXUS
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   LOGIN SYSTEM
========================================= */

function login() {

    const input =
        document.getElementById(
            "usernameInput"
        );


    if (!input) return;


    const name =
        input.value.trim();


    if (!name) {

        alert("Please enter your name.");

        return;

    }


    localStorage.setItem(
        "nexusUser",
        name
    );


    window.location.href =
        "dashboard.html";

}


/* =========================================
   CHECK LOGIN
========================================= */

function checkLogin() {

    const isDashboard =
        window.location.pathname
            .toLowerCase()
            .includes("dashboard");


    const user =
        localStorage.getItem(
            "nexusUser"
        );


    if (isDashboard && !user) {

        window.location.href =
            "index.html";

        return;

    }


    if (!isDashboard && user) {

        const usernameInput =
            document.getElementById(
                "usernameInput"
            );

        if (usernameInput) {

            usernameInput.value =
                user;

        }

    }

}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    localStorage.removeItem(
        "nexusUser"
    );


    window.location.href =
        "index.html";

}


/* =========================================
   USER DATA
========================================= */

let tasks =
    JSON.parse(
        localStorage.getItem(
            "nexusTasks"
        )
    ) || [];


let xp =
    Number(
        localStorage.getItem(
            "nexusXP"
        )
    ) || 0;


let level =
    Number(
        localStorage.getItem(
            "nexusLevel"
        )
    ) || 1;


let completed =
    Number(
        localStorage.getItem(
            "nexusCompleted"
        )
    ) || 0;


let focusMinutes =
    Number(
        localStorage.getItem(
            "nexusFocus"
        )
    ) || 0;


/* =========================================
   TIMER
========================================= */

let timerSeconds =
    25 * 60;


let timerInterval =
    null;


let timerRunning =
    false;


/* =========================================
   ELEMENTS
========================================= */

const taskModal =
    document.getElementById(
        "taskModal"
    );


const taskInput =
    document.getElementById(
        "taskInput"
    );


const priorityInput =
    document.getElementById(
        "priorityInput"
    );


const dashboardTasks =
    document.getElementById(
        "dashboardTasks"
    );


const allTasks =
    document.getElementById(
        "allTasks"
    );


const quickNotes =
    document.getElementById(
        "quickNotes"
    );


const mainNotes =
    document.getElementById(
        "mainNotes"
    );


/* =========================================
   NAVIGATION
========================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.section;


                showSection(
                    section
                );

            }
        );

    });


function showSection(section) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    const selectedPage =
        document.getElementById(
            section
        );


    if (selectedPage) {

        selectedPage.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.section ===
                section
            ) {

                button.classList.add(
                    "active"
                );

            }

        });

}


/* =========================================
   TASK MODAL
========================================= */

function openTaskModal() {

    if (!taskModal) return;


    taskModal.classList.add(
        "show"
    );


    if (taskInput) {

        taskInput.focus();

    }

}


function closeTaskModal() {

    if (!taskModal) return;


    taskModal.classList.remove(
        "show"
    );


    if (taskInput) {

        taskInput.value = "";

    }

}


if (taskModal) {

    taskModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                taskModal
            ) {

                closeTaskModal();

            }

        }
    );

}


/* =========================================
   ADD TASK
========================================= */

function addTask() {

    if (!taskInput) return;


    const name =
        taskInput.value.trim();


    const priority =
        priorityInput.value;


    if (!name) {

        showToast(
            "Write a task first!"
        );

        return;

    }


    const task = {

        id: Date.now(),

        name: name,

        priority: priority,

        completed: false

    };


    tasks.push(task);


    saveData();


    renderTasks();


    closeTaskModal();


    showToast(
        "Task created! 🚀"
    );

}


/* =========================================
   TOGGLE TASK
========================================= */

function toggleTask(id) {

    const task =
        tasks.find(
            item =>
                item.id === id
        );


    if (!task) return;


    if (!task.completed) {

        task.completed =
            true;


        completed++;


        earnXP(10);


        showToast(
            "Task completed! +10 XP ⭐"
        );

    }

    else {

        task.completed =
            false;


        completed--;


        earnXP(-10);

    }


    saveData();


    renderTasks();


    updateStats();

}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(id) {

    tasks =
        tasks.filter(
            task =>
                task.id !== id
        );


    saveData();


    renderTasks();


    updateStats();


    showToast(
        "Task deleted."
    );

}


/* =========================================
   CREATE TASK ELEMENT
========================================= */

function createTaskElement(task) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "task-item";


    wrapper.innerHTML = `

        <div
            class="task-check ${
                task.completed
                    ? "done"
                    : ""
            }"
            onclick="toggleTask(${task.id})"
        >
            ${
                task.completed
                    ? "✓"
                    : ""
            }
        </div>


        <div
            class="task-name ${
                task.completed
                    ? "done-text"
                    : ""
            }"
        >
            ${escapeHTML(task.name)}
        </div>


        <span
            class="priority ${task.priority}"
        >
            ${task.priority}
        </span>


        <button
            class="delete-task"
            onclick="deleteTask(${task.id})"
        >
            ×
        </button>

    `;


    return wrapper;

}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    if (
        !dashboardTasks ||
        !allTasks
    ) {

        return;

    }


    dashboardTasks.innerHTML =
        "";


    allTasks.innerHTML =
        "";


    if (tasks.length === 0) {

        const empty = `

            <div class="empty-state">

                <div>📋</div>

                <h3>
                    No tasks yet
                </h3>

                <p>
                    Add your first task
                    and start earning XP.
                </p>

            </div>

        `;


        dashboardTasks.innerHTML =
            empty;


        allTasks.innerHTML =
            empty;


        return;

    }


    tasks.forEach(task => {

        const element =
            createTaskElement(
                task
            );


        dashboardTasks.appendChild(
            element.cloneNode(true)
        );


        allTasks.appendChild(
            element
        );

    });

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================
   XP SYSTEM
========================================= */

function earnXP(amount) {

    xp += amount;


    if (xp < 0) {

        xp = 0;

    }


    while (xp >= 100) {

        xp -= 100;

        level++;


        showToast(
            `LEVEL UP! Level ${level} 🎉`
        );

    }


    saveData();


    updateStats();

}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

    const completedElement =
        document.getElementById(
            "completedCount"
        );


    const focusElement =
        document.getElementById(
            "focusTime"
        );


    const xpElement =
        document.getElementById(
            "totalXp"
        );


    if (completedElement) {

        completedElement.textContent =
            completed;

    }


    if (focusElement) {

        focusElement.textContent =
            formatFocusTime();

    }


    if (xpElement) {

        xpElement.textContent =
            xp;

    }


    const profileLevel =
        document.getElementById(
            "profileLevel"
        );


    const sideLevel =
        document.getElementById(
            "sideLevel"
        );


    const bigLevel =
        document.getElementById(
            "bigLevel"
        );


    if (profileLevel) {

        profileLevel.textContent =
            level;

    }


    if (sideLevel) {

        sideLevel.textContent =
            level;

    }


    if (bigLevel) {

        bigLevel.textContent =
            level;

    }


    const sideXpText =
        document.getElementById(
            "sideXpText"
        );


    const progressXp =
        document.getElementById(
            "progressXp"
        );


    if (sideXpText) {

        sideXpText.textContent =
            xp;

    }


    if (progressXp) {

        progressXp.textContent =
            xp;

    }


    const percentage =
        Math.min(
            xp,
            100
        );


    const sideXp =
        document.getElementById(
            "sideXp"
        );


    const largeXp =
        document.getElementById(
            "largeXp"
        );


    if (sideXp) {

        sideXp.style.width =
            percentage + "%";

    }


    if (largeXp) {

        largeXp.style.width =
            percentage + "%";

    }


    /* PROGRESS */

    const totalTasks =
        tasks.length;


    let progress = 0;


    if (totalTasks > 0) {

        progress =
            Math.round(
                (
                    completed /
                    totalTasks
                ) * 100
            );

    }


    const progressPercent =
        document.getElementById(
            "progressPercent"
        );


    if (progressPercent) {

        progressPercent.textContent =
            progress + "%";

    }


    const circle =
        document.getElementById(
            "progressCircle"
        );


    if (circle) {

        circle.style.background =
            `conic-gradient(
                var(--accent)
                ${progress * 3.6}deg,
                #252a36
                ${progress * 3.6}deg
            )`;

    }

}


/* =========================================
   FOCUS TIMER
========================================= */

function startFocus() {

    if (timerRunning) return;


    timerRunning =
        true;


    const status =
        document.getElementById(
            "focusStatus"
        );


    if (status) {

        status.textContent =
            "Focus mode activated. Lock in. 🔥";

    }


    timerInterval =
        setInterval(
            () => {

                timerSeconds--;


                updateTimerDisplay();


                if (
                    timerSeconds <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );


                    timerRunning =
                        false;


                    focusMinutes +=
                        25;


                    timerSeconds =
                        25 * 60;


                    earnXP(25);


                    saveData();


                    updateTimerDisplay();


                    updateStats();


                    showToast(
                        "Focus complete! +25 XP 🔥"
                    );

                }

            },
            1000
        );

}


/* =========================================
   PAUSE TIMER
========================================= */

function pauseFocus() {

    if (!timerRunning)
        return;


    clearInterval(
        timerInterval
    );


    timerRunning =
        false;


    const status =
        document.getElementById(
            "focusStatus"
        );


    if (status) {

        status.textContent =
            "Paused. Take a breath.";

    }

}


/* =========================================
   RESET TIMER
========================================= */

function resetFocus() {

    clearInterval(
        timerInterval
    );


    timerRunning =
        false;


    timerSeconds =
        25 * 60;


    updateTimerDisplay();


    const status =
        document.getElementById(
            "focusStatus"
        );


    if (status) {

        status.textContent =
            "Ready when you are.";

    }

}


/* =========================================
   UPDATE TIMER
========================================= */

function updateTimerDisplay() {

    const minutes =
        Math.floor(
            timerSeconds / 60
        );


    const seconds =
        timerSeconds % 60;


    const display =

        String(minutes)
            .padStart(2, "0")

        +

        ":"

        +

        String(seconds)
            .padStart(2, "0");


    const dashboardTimer =
        document.getElementById(
            "dashboardTimer"
        );


    const bigTimer =
        document.getElementById(
            "bigTimer"
        );


    if (dashboardTimer) {

        dashboardTimer.textContent =
            display;

    }


    if (bigTimer) {

        bigTimer.textContent =
            display;

    }

}


/* =========================================
   NOTES
========================================= */

function saveNotes() {

    if (!mainNotes)
        return;


    localStorage.setItem(
        "nexusNotes",
        mainNotes.value
    );


    if (quickNotes) {

        quickNotes.value =
            mainNotes.value;

    }


    const saved =
        document.getElementById(
            "notesSaved"
        );


    if (saved) {

        saved.textContent =
            "✓ Notes saved successfully";

    }


    showToast(
        "Notes saved! 📝"
    );

}


/* =========================================
   QUICK NOTES AUTO SAVE
========================================= */

if (quickNotes) {

    quickNotes.addEventListener(
        "input",
        () => {

            localStorage.setItem(
                "nexusNotes",
                quickNotes.value
            );


            if (mainNotes) {

                mainNotes.value =
                    quickNotes.value;

            }

        }
    );

}


/* =========================================
   MAIN NOTES AUTO SYNC
========================================= */

if (mainNotes) {

    mainNotes.addEventListener(
        "input",
        () => {

            localStorage.setItem(
                "nexusNotes",
                mainNotes.value
            );


            if (quickNotes) {

                quickNotes.value =
                    mainNotes.value;

            }

        }
    );

}


/* =========================================
   TOAST
========================================= */

let toastTimeout;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast)
        return;


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================
   FORMAT FOCUS TIME
========================================= */

function formatFocusTime() {

    if (
        focusMinutes < 60
    ) {

        return (
            focusMinutes +
            "m"
        );

    }


    const hours =
        Math.floor(
            focusMinutes / 60
        );


    const minutes =
        focusMinutes % 60;


    return (
        hours +
        "h " +
        minutes +
        "m"
    );

}


/* =========================================
   SAVE DATA
========================================= */

function saveData() {

    localStorage.setItem(
        "nexusTasks",
        JSON.stringify(tasks)
    );


    localStorage.setItem(
        "nexusXP",
        xp
    );


    localStorage.setItem(
        "nexusLevel",
        level
    );


    localStorage.setItem(
        "nexusCompleted",
        completed
    );


    localStorage.setItem(
        "nexusFocus",
        focusMinutes
    );

}


/* =========================================
   LOAD NOTES
========================================= */

function loadNotes() {

    const savedNotes =
        localStorage.getItem(
            "nexusNotes"
        );


    if (!savedNotes)
        return;


    if (quickNotes) {

        quickNotes.value =
            savedNotes;

    }


    if (mainNotes) {

        mainNotes.value =
            savedNotes;

    }

}


/* =========================================
   LOAD USER
========================================= */

function loadUser() {

    const user =
        localStorage.getItem(
            "nexusUser"
        );


    if (!user)
        return;


    const welcomeName =
        document.getElementById(
            "welcomeName"
        );


    const profileName =
        document.getElementById(
            "profileName"
        );


    const avatar =
        document.getElementById(
            "avatar"
        );


    if (welcomeName) {

        welcomeName.textContent =
            user;

    }


    if (profileName) {

        profileName.textContent =
            user;

    }


    if (avatar) {

        avatar.textContent =
            user
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================================
   KEYBOARD SHORTCUTS
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeTaskModal();

        }


        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            openTaskModal();

        }


        if (
            event.key === "Enter" &&
            document.activeElement ===
            taskInput
        ) {

            addTask();

        }

    }
);


/* =========================================
   INITIALIZE
========================================= */

checkLogin();


if (
    window.location.pathname
        .toLowerCase()
        .includes("dashboard")
) {

    loadUser();

    loadNotes();

    renderTasks();

    updateStats();

    updateTimerDisplay();

}