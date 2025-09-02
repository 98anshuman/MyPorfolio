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
  backToProjectsBtn: document.getElementById("backToProjectsBtn"),
  mobileMenuToggle: document.getElementById("mobileMenuToggle"),
  navMenu: document.getElementById("navMenu"),
  pdfMergeLink: document.getElementById("pdfMergeLink"),
  pdfMergeModal: document.getElementById("pdfMergeModal"),
  closePdfMergeBtn: document.getElementById("closePdfMergeBtn"),
  backFromPdfMergeBtn: document.getElementById("backFromPdfMergeBtn"),
  pdfFileInput: document.getElementById("pdfFileInput"),
  fileList: document.getElementById("fileList"),
  mergePdfBtn: document.getElementById("mergePdfBtn"),
  mergeStatus: document.getElementById("mergeStatus"),
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
  const shortDesc = proj.description.length > 100 ? proj.description.substring(0, 100) + '...' : proj.description;
  
  tile.innerHTML = `
    <h3>${proj.title}</h3>
    <div class="desc">${shortDesc}</div>
    <div class="click-hint">Click to view details</div>
    ${editButton}
  `;

  tile.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) return;
    openProjectDetail(proj);
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



function openProjectDetail(project) {
  DOM.detailProjectTitle.textContent = project.title;
  DOM.detailProjectDescription.textContent = project.description;
  DOM.projectDetailModal.style.display = "block";
  document.body.style.overflow = "hidden";
  
  // Scroll to top of modal
  DOM.projectDetailModal.scrollTop = 0;
}

function closeProjectDetail() {
  DOM.projectDetailModal.style.display = "none";
  document.body.style.overflow = "";
}

DOM.closeProjectDetailBtn.addEventListener("click", closeProjectDetail);
DOM.backToProjectsBtn.addEventListener("click", closeProjectDetail);

// Close on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && DOM.projectDetailModal.style.display === "block") {
    closeProjectDetail();
  }
});

// Prevent closing when clicking inside the modal content
DOM.projectDetailModal.addEventListener("click", e => {
  if (e.target === DOM.projectDetailModal) {
    closeProjectDetail();
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

// PDF Merge functionality
let selectedFiles = [];

function initPdfMerge() {
  DOM.pdfMergeLink.addEventListener('click', (e) => {
    e.preventDefault();
    DOM.pdfMergeModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  DOM.closePdfMergeBtn.addEventListener('click', closePdfMerge);
  DOM.backFromPdfMergeBtn.addEventListener('click', closePdfMerge);

  DOM.pdfFileInput.addEventListener('change', handleFileSelection);
  DOM.mergePdfBtn.addEventListener('click', mergePdfs);
}

function closePdfMerge() {
  DOM.pdfMergeModal.style.display = 'none';
  document.body.style.overflow = '';
}

function handleFileSelection(e) {
  selectedFiles = Array.from(e.target.files);
  updateFileList();
  DOM.mergePdfBtn.disabled = selectedFiles.length < 2;
}

function updateFileList() {
  DOM.fileList.innerHTML = '';
  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.draggable = true;
    fileItem.dataset.index = index;
    fileItem.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span class="drag-handle">⋮⋮</span>
        <span>${file.name}</span>
      </div>
      <button onclick="removeFile(${index})" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Remove</button>
    `;
    
    // Add drag event listeners
    fileItem.addEventListener('dragstart', handleDragStart);
    fileItem.addEventListener('dragover', handleDragOver);
    fileItem.addEventListener('drop', handleDrop);
    fileItem.addEventListener('dragend', handleDragEnd);
    
    DOM.fileList.appendChild(fileItem);
  });
}

let draggedIndex = null;

function handleDragStart(e) {
  draggedIndex = parseInt(e.target.dataset.index);
  e.target.classList.add('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.target.classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  const dropIndex = parseInt(e.target.dataset.index);
  
  if (draggedIndex !== null && draggedIndex !== dropIndex) {
    // Reorder the files array
    const draggedFile = selectedFiles[draggedIndex];
    selectedFiles.splice(draggedIndex, 1);
    selectedFiles.splice(dropIndex, 0, draggedFile);
    updateFileList();
  }
  
  e.target.classList.remove('drag-over');
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.file-item').forEach(item => {
    item.classList.remove('drag-over');
  });
  draggedIndex = null;
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  updateFileList();
  DOM.mergePdfBtn.disabled = selectedFiles.length < 2;
}

async function mergePdfs() {
  if (selectedFiles.length < 2) return;
  
  DOM.mergeStatus.textContent = 'Merging PDFs...';
  DOM.mergePdfBtn.disabled = true;
  
  try {
    const mergedPdf = await PDFLib.PDFDocument.create();
    
    for (const file of selectedFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    
    const pdfBytes = await mergedPdf.save();
    
    // Create download link
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged-document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    DOM.mergeStatus.textContent = 'PDFs merged successfully! Download started.';
  } catch (error) {
    DOM.mergeStatus.textContent = 'Error merging PDFs: ' + error.message;
  } finally {
    DOM.mergePdfBtn.disabled = false;
  }
}

// Mobile menu functionality
function initMobileMenu() {
  DOM.mobileMenuToggle.addEventListener('click', () => {
    DOM.mobileMenuToggle.classList.toggle('active');
    DOM.navMenu.classList.toggle('show');
  });

  // Close mobile menu when clicking nav links
  DOM.navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      DOM.mobileMenuToggle.classList.remove('active');
      DOM.navMenu.classList.remove('show');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!DOM.mobileMenuToggle.contains(e.target) && !DOM.navMenu.contains(e.target)) {
      DOM.mobileMenuToggle.classList.remove('active');
      DOM.navMenu.classList.remove('show');
    }
  });
}



// Smooth header shrinking with transform
function initScrollHeader() {
  const header = document.querySelector('header');
  let lastScrollY = 0;
  
  function updateHeader() {
    const scrollY = window.scrollY;
    const maxScroll = 150;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);
    const scale = 1 - (scrollProgress * 0.4);
    
    header.style.transform = `scaleY(${scale})`;
    lastScrollY = scrollY;
  }
  
  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateHeader);
  }, { passive: true });
}

async function init() {
  await reloadProjects();
  await reloadSkills();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize PDF merge
  initPdfMerge();
  
  // Initialize smooth header
  initScrollHeader();
  
  // Hide edit elements in production
  if (!isDevelopment) {
    document.body.classList.add('production-mode');
    DOM.editSkillsBtn.style.display = 'none';
    DOM.addNewBtn.style.display = 'none';
  }
  
  // Add smooth scrolling for navigation links
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

init();
