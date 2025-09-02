import { DataManager } from "./data-manager.js";

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
  projectDetailModal: document.getElementById("projectDetailModal"),
  detailProjectTitle: document.getElementById("detailProjectTitle"),
  detailProjectDescription: document.getElementById("detailProjectDescription"),
  closeProjectDetailBtn: document.getElementById("closeProjectDetailBtn"),
};

let editingProjectIndex = null;
let projectsData = [];
let skillsData = [];

// Check if running in development mode
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

async function loadProjects() {
  return await DataManager.loadProjects();
}

async function saveProjects(projects) {
  await DataManager.saveProjects(projects);
}

async function loadSkills() {
  return await DataManager.loadSkills();
}

async function saveSkills(skills) {
  await DataManager.saveSkills(skills);
}

function createProjectTile(proj, index) {
  const tile = document.createElement("div");
  tile.className = "project-tile";

  const editButton = isDevelopment ? '<button class="edit-btn">Edit</button>' : '';
  tile.innerHTML = `
    <h3>${proj.title}</h3>
    <div class="desc">${proj.description}</div>
    ${editButton}
  `;

  tile.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) return;
    DOM.detailProjectTitle.textContent = proj.title;
    DOM.detailProjectDescription.textContent = proj.description;
    DOM.projectDetailModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  if (isDevelopment) {
    tile.querySelector(".edit-btn").addEventListener("click", evt => {
      evt.stopPropagation();
      openProjectModal(index);
    });
  }

  return tile;
}

function renderSkills() {
  DOM.skillsList.innerHTML = "";
  skillsData.forEach(skill => {
    const li = document.createElement("li");
    li.textContent = skill;
    DOM.skillsList.appendChild(li);
  });
}

function renderProjects() {
  DOM.projectGrid.innerHTML = "";
  projectsData.forEach((proj, idx) => DOM.projectGrid.appendChild(createProjectTile(proj, idx)));
  if (isDevelopment) {
    DOM.projectGrid.appendChild(DOM.addNewBtn);
  }
}



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

DOM.editSkillsBtn.addEventListener("click", openSkillsModal);

DOM.saveSkillsBtn.addEventListener("click", async () => {
  const skillsText = DOM.skillsInput.value.trim();
  if (!skillsText) {
    alert("Please enter at least one skill.");
    return;
  }
  skillsData = skillsText.split(",").map(s => s.trim()).filter(Boolean);
  await saveSkills(skillsData);
  DOM.skillsModal.style.display = "none";
  renderSkills();
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
  renderSkills();
}

async function init() {
  await reloadProjects();
  await reloadSkills();
  
  // Hide edit elements in production
  if (!isDevelopment) {
    document.body.classList.add('production-mode');
    DOM.editSkillsBtn.style.display = 'none';
    DOM.addNewBtn.style.display = 'none';
  }
}

init();
