import { ref, get, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { db } from "./firebase-init.js";

const isGitHubPages = window.location.hostname.includes("github.io");

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

function toggleEditUI() {
  const showEdit = !isGitHubPages;
  if (DOM.addNewBtn) DOM.addNewBtn.style.display = showEdit ? "" : "none";
  if (DOM.editSkillsBtn) DOM.editSkillsBtn.style.display = showEdit ? "" : "none";
  DOM.writeWithMeEl.style.display = showEdit ? "none" : "block";
}

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

function createProjectTile(proj, index) {
  const tile = document.createElement("div");
  tile.className = "project-tile";

  tile.innerHTML = `
    <h3>${proj.title}</h3>
    <div class="desc">${proj.description}</div>
    ${!isGitHubPages ? '<button class="edit-btn">Edit</button>' : ''}
  `;

  tile.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) return;
    DOM.detailProjectTitle.textContent = proj.title;
    DOM.detailProjectDescription.textContent = proj.description;
    DOM.projectDetailModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  if (!isGitHubPages && tile.querySelector(".edit-btn")) {
    tile.querySelector(".edit-btn").addEventListener("click", evt => {
      evt.stopPropagation();
      openProjectModal(index);
    });
  }

  return tile;
}

function renderProjects() {
  DOM.projectGrid.innerHTML = "";
  projectsData.forEach((proj, idx) => DOM.projectGrid.appendChild(createProjectTile(proj, idx)));
  if (!isGitHubPages && DOM.addNewBtn) DOM.projectGrid.appendChild(DOM.addNewBtn);
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

DOM.skillsList.addEventListener("click", () => {
  renderSkills(DOM.skillsList.classList.contains("compact"));
});

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

DOM.addNewBtn?.addEventListener("click", () => openProjectModal());

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

DOM.cancelProjectBtn.addEventListener("click", () => (DOM.modal.style.display = "none"));
DOM.modal.addEventListener("click", e => {
  if (e.target === DOM.modal) DOM.modal.style.display = "none";
});

function openSkillsModal() {
  DOM.skillsInput.value = skillsData.join(", ");
  DOM.skillsModal.style.display = "flex";
}

DOM.editSkillsBtn?.addEventListener("click", openSkillsModal);

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

DOM.cancelSkillsBtn.addEventListener("click", () => (DOM.skillsModal.style.display = "none"));
DOM.skillsModal.addEventListener("click", e => {
  if (e.target === DOM.skillsModal) DOM.skillsModal.style.display = "none";
});

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

async function reloadProjects() {
  projectsData = await loadProjects();
  renderProjects();
}

async function reloadSkills() {
  skillsData = await loadSkills();
  renderSkills(false);
}

async function init() {
  toggleEditUI();
  await Promise.all([reloadProjects(), reloadSkills()]);
}

init();
