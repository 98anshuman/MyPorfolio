import { ref, get, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { db } from "./firebase-init.js";

const isGitHubPages = window.location.hostname.includes("github.io");

const projectGrid = document.getElementById("projectGrid");
const skillsList = document.getElementById("skillsList");
const addNewBtn = document.getElementById("addNewProject");

const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const projectTitleInput = document.getElementById("projectTitleInput");
const projectDescInput = document.getElementById("projectDescInput");
const saveProjectBtn = document.getElementById("saveProjectBtn");
const cancelProjectBtn = document.getElementById("cancelProjectBtn");

const editSkillsBtn = document.getElementById("editSkillsBtn");
const skillsModal = document.getElementById("skillsModal");
const skillsInput = document.getElementById("skillsInput");
const saveSkillsBtn = document.getElementById("saveSkillsBtn");
const cancelSkillsBtn = document.getElementById("cancelSkillsBtn");

const writeWithMeEl = document.getElementById("writeWithMe");

const projectDetailModal = document.getElementById("projectDetailModal");
const detailProjectTitle = document.getElementById("detailProjectTitle");
const detailProjectDescription = document.getElementById("detailProjectDescription");
const closeProjectDetailBtn = document.getElementById("closeProjectDetailBtn");

let editingProjectIndex = null;
let projectsData = [];
let skillsData = [];

// Toggle Add/Edit controls visibility based on environment
function toggleEditUI() {
  if (isGitHubPages) {
    if (addNewBtn) addNewBtn.style.display = "none";
    document.querySelectorAll(".edit-btn").forEach((btn) => (btn.style.display = "none"));
    if (editSkillsBtn) editSkillsBtn.style.display = "none";
    if (writeWithMeEl) writeWithMeEl.style.display = "block";
  } else {
    if (addNewBtn) addNewBtn.style.display = "";
    document.querySelectorAll(".edit-btn").forEach((btn) => (btn.style.display = ""));
    if (editSkillsBtn) editSkillsBtn.style.display = "";
    if (writeWithMeEl) writeWithMeEl.style.display = "none";
  }
}

// Fetch projects from Firebase, or default sample when none exist
async function loadProjects() {
  try {
    const snapshot = await get(ref(db, "projects"));
    return snapshot.exists()
      ? snapshot.val()
      : [
          {
            title: "Network Vulnerability Scanner",
            description:
              "Built an automated scanner for open ports, outdated protocols, and known vulnerabilities across enterprise infrastructure.",
          },
          {
            title: "Web Application Security Testing",
            description:
              "Found and reported CVSS-9+ vulnerabilities in client web apps; automated scripting for SQLi, XSS, CSRF and business logic flaws.",
          },
        ];
  } catch (err) {
    console.error("Error loading projects:", err);
    return [];
  }
}

// Save all projects to Firebase
async function saveProjects(projects) {
  try {
    await set(ref(db, "projects"), projects);
  } catch (err) {
    console.error("Error saving projects:", err);
  }
}

// Fetch skills from Firebase, or default sample when none exist
async function loadSkills() {
  try {
    const snapshot = await get(ref(db, "skills"));
    return snapshot.exists()
      ? snapshot.val()
      : [
          "Penetration Testing",
          "Network Security",
          "SIEM Operations",
          "Incident Response",
          "Python & Bash Scripting",
          "Cryptography",
          "Cloud Security (AWS/Azure)",
          "Threat Intelligence",
          "Malware Analysis",
        ];
  } catch (err) {
    console.error("Error loading skills:", err);
    return [];
  }
}

// Save all skills to Firebase
async function saveSkills(skills) {
  try {
    await set(ref(db, "skills"), skills);
  } catch (err) {
    console.error("Error saving skills:", err);
  }
}

// Create project tile element with conditional edit button
function createProjectTile(proj, index) {
  const tile = document.createElement("div");
  tile.className = "project-tile";

  tile.innerHTML = `
    <h3>${proj.title}</h3>
    <div class="desc" style="display:none;">${proj.description}</div>
    ${!isGitHubPages ? '<button class="edit-btn">Edit</button>' : ''}
  `;

  // Open fullscreen modal on project tile click (except Edit)
  tile.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) return;
    detailProjectTitle.textContent = proj.title;
    detailProjectDescription.textContent = proj.description;
    projectDetailModal.style.display = "flex";
    document.body.style.overflow = "hidden"; // disable body scroll
  });

  // Bind Edit button for local editing
  if (!isGitHubPages && tile.querySelector(".edit-btn")) {
    tile.querySelector(".edit-btn").addEventListener("click", (evt) => {
      evt.stopPropagation();
      openProjectModal(index);
    });
  }

  return tile;
}

// Render all projects and add "Add New Project" tile if allowed
function renderProjects() {
  projectGrid.innerHTML = "";
  projectsData.forEach((proj, idx) => projectGrid.appendChild(createProjectTile(proj, idx)));
  if (!isGitHubPages && addNewBtn) projectGrid.appendChild(addNewBtn);
}

// Render skills list compact or expanded
function renderSkills(expanded = false) {
  skillsList.innerHTML = "";
  if (expanded) {
    skillsList.classList.remove("compact");
    skillsList.classList.add("expanded");
    skillsData.forEach((skill) => {
      const li = document.createElement("li");
      li.textContent = skill;
      skillsList.appendChild(li);
    });
  } else {
    skillsList.classList.add("compact");
    skillsList.classList.remove("expanded");
    skillsList.setAttribute("data-summary", `${skillsData.length} skills (click to expand)`);
  }
}

// Toggle skills expand/collapse on click
skillsList.addEventListener("click", () => {
  if (skillsList.classList.contains("compact")) renderSkills(true);
  else renderSkills(false);
});

// Open Add/Edit Project modal, fill or clear inputs accordingly
function openProjectModal(index = null) {
  editingProjectIndex = index;
  if (index !== null && projectsData[index]) {
    modalTitle.textContent = "Edit Project";
    projectTitleInput.value = projectsData[index].title;
    projectDescInput.value = projectsData[index].description;
  } else {
    modalTitle.textContent = "Add New Project";
    projectTitleInput.value = "";
    projectDescInput.value = "";
  }
  modal.style.display = "flex";
}

// Show Add Project modal on button click
addNewBtn?.addEventListener("click", () => openProjectModal());

// Save new or edited project on modal Save button
saveProjectBtn.addEventListener("click", async () => {
  const title = projectTitleInput.value.trim();
  const desc = projectDescInput.value.trim();
  if (!title || !desc) {
    alert("Please fill in both fields.");
    return;
  }
  if (editingProjectIndex !== null) {
    projectsData[editingProjectIndex] = { title, description: desc };
  } else {
    projectsData.push({ title, description: desc });
  }
  await saveProjects(projectsData);
  modal.style.display = "none";
  await reloadProjects();
});

// Close modal on Cancel or clicking outside modal-content
cancelProjectBtn.addEventListener("click", () => (modal.style.display = "none"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Open Skills modal and prefill textarea
function openSkillsModal() {
  skillsInput.value = skillsData.join(", ");
  skillsModal.style.display = "flex";
}

editSkillsBtn?.addEventListener("click", openSkillsModal);

// Save edited skills
saveSkillsBtn.addEventListener("click", async () => {
  const skillsText = skillsInput.value.trim();
  if (!skillsText) {
    alert("Please enter at least one skill.");
    return;
  }
  skillsData = skillsText.split(",").map((s) => s.trim()).filter(Boolean);
  await saveSkills(skillsData);
  skillsModal.style.display = "none";
  renderSkills(false);
});

// Close skills modal similarly
cancelSkillsBtn.addEventListener("click", () => (skillsModal.style.display = "none"));
skillsModal.addEventListener("click", (e) => {
  if (e.target === skillsModal) skillsModal.style.display = "none";
});

// Close fullscreen project detail modal
closeProjectDetailBtn.addEventListener("click", () => {
  projectDetailModal.style.display = "none";
  document.body.style.overflow = "";
});
projectDetailModal.addEventListener("click", (e) => {
  if (e.target === projectDetailModal) {
    projectDetailModal.style.display = "none";
    document.body.style.overflow = "";
  }
});

// Reload projects data and render
async function reloadProjects() {
  projectsData = await loadProjects();
  renderProjects();
}

// Reload skills data and render
async function reloadSkills() {
  skillsData = await loadSkills();
  renderSkills(false);
}

// Initialization: toggle UI & load data
async function init() {
  toggleEditUI();
  await Promise.all([reloadProjects(), reloadSkills()]);
}

init();
