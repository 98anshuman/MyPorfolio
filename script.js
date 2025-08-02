// Show Add/Edit bars only when running locally (VS Code/Live Server)
if (window.location.hostname.includes("github.io")) {
  const addNew = document.getElementById("addNewProject");
  if (addNew) addNew.style.display = "none";
  const editBtns = document.querySelectorAll(".edit-btn");
  editBtns.forEach(btn => btn.style.display = "none");

  // Also hide the Skills edit button
  const skillEditBtn = document.getElementById("editSkillsBtn");
  if(skillEditBtn) skillEditBtn.style.display = "none";
}

// LocalStorage keys
const STORAGE_PROJECTS = "anshuman_projects";
const STORAGE_SKILLS = "anshuman_skills";

// Elements
const projectGrid = document.getElementById("projectGrid");
const skillsList = document.getElementById("skillsList");

// Load from localStorage or default projects
function loadProjects() {
  const saved = localStorage.getItem(STORAGE_PROJECTS);
  if (saved) return JSON.parse(saved);
  return [
    {
      title: "Network Vulnerability Scanner",
      description: "Built an automated scanner for open ports, outdated protocols, and known vulnerabilities across enterprise infrastructure."
    },
    {
      title: "Web Application Security Testing",
      description: "Found and reported CVSS-9+ vulnerabilities in client web apps; automated scripting for SQLi, XSS, CSRF and business logic flaws."
    }
  ];
}

// Load skills from localStorage or default
function loadSkills() {
  const saved = localStorage.getItem(STORAGE_SKILLS);
  if (saved) return JSON.parse(saved);
  return [
    "Penetration Testing",
    "Network Security",
    "SIEM Operations",
    "Incident Response",
    "Python & Bash Scripting",
    "Cryptography",
    "Cloud Security (AWS/Azure)",
    "Threat Intelligence",
    "Malware Analysis"
  ];
}

// Save to localStorage
function saveProjects(projects) {
  localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(projects));
}

function saveSkills(skills) {
  localStorage.setItem(STORAGE_SKILLS, JSON.stringify(skills));
}

// Render projects with compact expand toggle
function renderProjects() {
  const projects = loadProjects();

  // Clear projectGrid except add-new tile (inserted at end)
  const addNewTile = document.getElementById("addNewProject");
  projectGrid.innerHTML = "";

  projects.forEach(proj => {
    const tile = document.createElement("div");
    tile.className = "project-tile";

    tile.innerHTML = `
      <h3>${proj.title}</h3>
      <div class="desc">${proj.description}</div>
      <button class="edit-btn">Edit</button>
    `;

    // Toggle expanded state on tile click except on edit button
    tile.addEventListener("click", e => {
      if (e.target.classList.contains("edit-btn")) return;
      tile.classList.toggle("expanded");
    });

    projectGrid.appendChild(tile);
  });

  // Append the add new project tile last
  if (addNewTile) projectGrid.appendChild(addNewTile);
}

// Skills compact/expanded rendering
function renderSkills(expanded = false) {
  const skills = loadSkills();
  skillsList.innerHTML = "";

  if (expanded) {
    skillsList.classList.remove("compact");
    skillsList.classList.add("expanded");
    skills.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill;
      skillsList.appendChild(li);
    });
  } else {
    skillsList.classList.add("compact");
    skillsList.classList.remove("expanded");
    skillsList.setAttribute("data-summary", `${skills.length} skills (click to expand)`);
  }
}

// Toggle skills expand/compact on click
skillsList.addEventListener("click", () => {
  if (skillsList.classList.contains("compact")) {
    renderSkills(true);
  } else {
    renderSkills(false);
  }
});

// Initialize rendering on page load
function init() {
  renderProjects();
  renderSkills(false);
}
init();

// ------- Project Modal Logic -------

const addNewBtn = document.getElementById("addNewProject");
const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const projectTitleInput = document.getElementById("projectTitleInput");
const projectDescInput = document.getElementById("projectDescInput");
const saveProjectBtn = document.getElementById("saveProjectBtn");
const cancelProjectBtn = document.getElementById("cancelProjectBtn");

let editingProjectIndex = null;

// Open add new project modal
addNewBtn.onclick = () => {
  editingProjectIndex = null;
  modalTitle.textContent = "Add New Project";
  projectTitleInput.value = "";
  projectDescInput.value = "";
  modal.style.display = "flex";
};

// Edit button click (delegated)
projectGrid.addEventListener("click", e => {
  if (e.target.classList.contains("edit-btn")) {
    const tile = e.target.closest(".project-tile");
    const title = tile.querySelector("h3").textContent;
    const description = tile.querySelector(".desc").textContent;
    const projects = loadProjects();
    editingProjectIndex = projects.findIndex(p => p.title === title && p.description === description);
    if (editingProjectIndex === -1) editingProjectIndex = null;

    modalTitle.textContent = "Edit Project";
    projectTitleInput.value = title;
    projectDescInput.value = description;
    modal.style.display = "flex";
  }
});

// Save add/edit project
saveProjectBtn.onclick = () => {
  const title = projectTitleInput.value.trim();
  const desc = projectDescInput.value.trim();
  if (!title || !desc) {
    alert("Please fill in both fields.");
    return;
  }
  let projects = loadProjects();
  if (editingProjectIndex !== null) {
    // Edit existing
    projects[editingProjectIndex] = { title, description: desc };
  } else {
    // Add new
    projects.push({ title, description: desc });
  }
  saveProjects(projects);
  modal.style.display = "none";
  renderProjects();
};

// Cancel project modal
cancelProjectBtn.onclick = () => {
  modal.style.display = "none";
};

// Close project modal on outside click
modal.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};

// ------- Skills Modal Logic -------

const editSkillsBtn = document.getElementById("editSkillsBtn");
const skillsModal = document.getElementById("skillsModal");
const skillsInput = document.getElementById("skillsInput");
const saveSkillsBtn = document.getElementById("saveSkillsBtn");
const cancelSkillsBtn = document.getElementById("cancelSkillsBtn");

// Open skills modal
editSkillsBtn.addEventListener("click", () => {
  const skills = loadSkills();
  skillsInput.value = skills.join(", ");
  skillsModal.style.display = "flex";
});

// Save skills modal
saveSkillsBtn.addEventListener("click", () => {
  const skillsText = skillsInput.value.trim();
  if (!skillsText) {
    alert("Please enter at least one skill.");
    return;
  }
  const newSkills = skillsText.split(",").map(s => s.trim()).filter(s => s.length > 0);
  saveSkills(newSkills);
  skillsModal.style.display = "none";
  renderSkills(false);
});

// Cancel skills modal
cancelSkillsBtn.addEventListener("click", () => {
  skillsModal.style.display = "none";
});

// Close skills modal on outside click
skillsModal.addEventListener("click", e => {
  if (e.target === skillsModal) skillsModal.style.display = "none";
});

// ------- Write with me message for GitHub Pages --------

if (window.location.hostname.includes("github.io")) {
  const writeWithMeEl = document.getElementById("writeWithMe");
  if (writeWithMeEl) writeWithMeEl.style.display = "block";
}
