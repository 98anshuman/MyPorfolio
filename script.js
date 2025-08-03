import { ref, get, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { db } from "./firebase-init.js";

const isGitHubPages = window.location.hostname.includes("github.io");

// Cache DOM references once
const DOM = {
  projectGrid: document.getElementById("projectGrid"),
  skillsList: document.getElementById("skillsList"),
  addNewBtn: document.getElementById("addNewProject"),
  modal: document.getElementById("projectModal"),
  modalTitle: document.getElementById("modalTitle"),
  projectTitleInput: document.getElementById("projectTitleInput"),
  projectDescInput: document.getElementById("projectDescInput"),
  saveProjectBtn: document.getElementById("saveProjectBtn"),
  cancelProjectBtn: document.getElementById("cancelProjectBtn"),
  editSkillsBtn: document.getElementById("editSkillsBtn"),
  skillsModal: document.getElementById("skillsModal"),
  skillsInput: document.getElementById("skillsInput"),
  saveSkillsBtn: document.getElementById("saveSkillsBtn"),
  cancelSkillsBtn: document.getElementById("cancelSkillsBtn"),
  writeWithMeEl: document.getElementById("writeWithMe"),
  projectDetailModal: document.getElementById("projectDetailModal"),
  detailProjectTitle: document.getElementById("detailProjectTitle"),
  detailProjectDescription: document.getElementById("detailProjectDescription"),
  closeProjectDetailBtn: document.getElementById("closeProjectDetailBtn"),
};

let editingProjectIndex = null;
let projectsData = [];
let skillsData = [];

// Toggle Add/Edit controls and "Write with me" message visibility
function toggleEditUI() {
  const showEdit = !isGitHubPages;
  if (DOM.addNewBtn) DOM.addNewBtn.style.display = showEdit ? "" : "none";
  if (DOM.editSkillsBtn) DOM.editSkillsBtn.style.display = showEdit ? "" : "none";
  DOM.writeWithMeEl.style.display = showEdit ? "none" : "block";

  // Edit buttons inside project tiles (dynamically generated),
  // so hide/show after render if needed
  DOM.projectGrid.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.display = showEdit ? "" : "none";
  });
}

// Async Firebase helpers with default fallback data
async function loadData(path, defaultData) {
  try {
    const snapshot = await get(ref(db, path));
    return snapshot.exists() ? snapshot.val() : defaultData;
  } catch (err) {
    console.error(`Error loading ${path}:`, err);
    return defaultData;
  }
}

async function saveData(path, data) {
  try {
    await set(ref(db, path), data);
  } catch (err) {
    console.error(`Error saving ${path}:`, err);
  }
}

async function loadProjects() {
  return loadData("projects", [
    {
      title: "Network Vulnerability Scanner",
      description: "Built an automated scanner for open ports, outdated protocols, and known vulnerabilities across enterprise infrastructure."
    },
    {
      title: "Web Application Security Testing",
      description: "Found and reported CVSS-9+ vulnerabilities in client web apps; automated scripting for SQLi, XSS, CSRF and business logic flaws."
    }
  ]);
}

async function saveProjects(projects) {
  return saveData("projects", projects);
}

async function loadSkills() {
  return loadData("skills", [
    "Penetration Testing", "Network Security", "SIEM Operations", "Incident Response",
    "Python & Bash Scripting", "Cryptography", "Cloud Security (AWS/Azure)",
    "Threat Intelligence", "Malware Analysis"
  ]);
}

async function saveSkills(skills) {
  return saveData("skills", skills);
}

// Create project tile with conditional edit button and click handlers
function createProjectTile(proj, index) {
  const tile = document.createElement("div");
  tile.className = "project-tile";

  tile.innerHTML = `
    <h3>${proj.title}</h3>
    <div class="desc" style="display:none;">${proj.description}</div>
    ${!isGitHubPages ? '<button class="edit-btn">Edit</button>' : ''}
  `;

  // Click on tile opens fullscreen detail modal except on edit button clicks
  tile.addEventListener("click", e => {
    if (e.target.classList.contains("edit-btn")) return;
    DOM.detailProjectTitle.textContent = proj.title;
    DOM.detailProjectDescription.textContent = proj.description;
    DOM.projectDetailModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  // Edit button click opens edit modal locally
  if (!isGitHubPages) {
    const editBtn = tile.querySelector(".edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", evt => {
        evt.stopPropagation();
        openProjectModal(index);
      });
    }
  }

  return tile;
}

function renderProjects() {
  DOM.projectGrid.innerHTML = "";
  projectsData.forEach((proj, idx) => {
    DOM.projectGrid.appendChild(createProjectTile(proj, idx));
  });
  if (!isGitHubPages && DOM.addNewBtn) DOM.projectGrid.appendChild(DOM.addNewBtn);

  // After rendering, toggle edit buttons visibility (for safety)
  toggleEditUI();
}

function renderSkills(expanded = false) {
  DOM.skillsList.innerHTML = "";
  if (expanded) {
    DOM.skillsList.classList.remove("compact");
    DOM.skillsList.classList.add("expanded");
    skillsData.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill;
      DOM.skillsList.appendChild(li);
    });
  } else {
    DOM.skillsList.classList.add("compact");
    DOM.skillsList.classList.remove("expanded");
    DOM.skillsList.setAttribute("data-summary", `${skillsData.length} skills (click to expand)`);
  }
}

// Toggle skills expanded/compact mode on click
DOM.skillsList.addEventListener("click", () => {
  const isCompact = DOM.skillsList.classList.contains("compact");
  renderSkills(!isCompact);
});

// Show the add/edit project modal in add or edit mode
function openProjectModal(index = null) {
  editingProjectIndex = index;
  if (index !== null && projectsData[index]) {
    DOM.modalTitle.textContent = "Edit Project";
    DOM.projectTitleInput.value = projectsData[index].title;
    DOM.projectDescInput.value = projectsData[index].description;
  } else {
    DOM.modalTitle.textContent = "Add New Project";
    DOM.projectTitleInput.value = "";
    DOM.projectDescInput.value = "";
  }
  DOM.modal.style.display = "flex";
}

// Event handler: open add new project modal
DOM.addNewBtn?.addEventListener("click", () => openProjectModal());

// Event handler: save project changes
DOM.saveProjectBtn.addEventListener("click", async () => {
  const title = DOM.projectTitleInput.value.trim();
  const description = DOM.projectDescInput.value.trim();

  if (!title || !description) {
    alert("Please fill in both fields.");
    return;
  }
  if (editingProjectIndex !== null) {
    projectsData[editingProjectIndex] = { title, description };
  } else {
    projectsData.push({ title, description });
  }
  await saveProjects(projectsData);
  DOM.modal.style.display = "none";
  await reloadProjects();
});

// Event handler: cancel project modal
DOM.cancelProjectBtn.addEventListener("click", () => (DOM.modal.style.display = "none"));

// Close modal when clicking outside modal content
DOM.modal.addEventListener("click", e => {
  if (e.target === DOM.modal) DOM.modal.style.display = "none";
});

// Open the skills edit modal with current skills
function openSkillsModal() {
  DOM.skillsInput.value = skillsData.join(", ");
  DOM.skillsModal.style.display = "flex";
}

// Edit skills button handler
DOM.editSkillsBtn?.addEventListener("click", openSkillsModal);

// Save skills changes
DOM.saveSkillsBtn.addEventListener("click", async () => {
  const skillsText = DOM.skillsInput.value.trim();
  if (!skillsText) {
    alert("Please enter at least one skill.");
    return;
  }
  skillsData = skillsText.split(",").map(s => s.trim()).filter(Boolean);
  await saveSkills(skillsData);
  DOM.skillsModal.style.display = "none";
  renderSkills(false);
});

// Cancel skills modal
DOM.cancelSkillsBtn.addEventListener("click", () => (DOM.skillsModal.style.display = "none"));
DOM.skillsModal.addEventListener("click", e => {
  if (e.target === DOM.skillsModal) DOM.skillsModal.style.display = "none";
});

// Close fullscreen project detail modal, restore scrolling
DOM.closeProjectDetailBtn.addEventListener("click", () => {
  DOM.projectDetailModal.style.display = "none";
  document.body.style.overflow = "";
});
DOM.projectDetailModal.addEventListener("click", e => {
  if (e.target === DOM.projectDetailModal) {
    DOM.projectDetailModal.style.display = "none";
    document.body.style.overflow = "";
  }
});

// Reload projects from Firebase and render UI
async function reloadProjects() {
  projectsData = await loadProjects();
  renderProjects();
}

// Reload skills from Firebase and render UI
async function reloadSkills() {
  skillsData = await loadSkills();
  renderSkills(false);
}

// Initialization function to prepare UI and fetch data
async function init() {
  toggleEditUI(); // show/hide UI properly
  await Promise.all([reloadProjects(), reloadSkills()]);
}

// Start everything
init();
