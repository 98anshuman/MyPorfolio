import { DataManager } from "./data-manager.js?v=20250103001";

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
  pdfScannerLink: document.getElementById("pdfScannerLink"),
  pdfScannerModal: document.getElementById("pdfScannerModal"),
  closePdfScannerBtn: document.getElementById("closePdfScannerBtn"),
  backFromPdfScannerBtn: document.getElementById("backFromPdfScannerBtn"),
  scanFileInput: document.getElementById("scanFileInput"),
  scanPreview: document.getElementById("scanPreview"),
  scanToPdfBtn: document.getElementById("scanToPdfBtn"),
  scanStatus: document.getElementById("scanStatus"),
  cameraScannerLink: document.getElementById("cameraScannerLink"),
  cameraScannerModal: document.getElementById("cameraScannerModal"),
  closeCameraScannerBtn: document.getElementById("closeCameraScannerBtn"),
  backFromCameraScannerBtn: document.getElementById("backFromCameraScannerBtn"),
  cameraVideo: document.getElementById("cameraVideo"),
  cameraCanvas: document.getElementById("cameraCanvas"),
  startCameraBtn: document.getElementById("startCameraBtn"),
  captureBtn: document.getElementById("captureBtn"),
  stopCameraBtn: document.getElementById("stopCameraBtn"),
  capturedImages: document.getElementById("capturedImages"),
  createPdfFromCameraBtn: document.getElementById("createPdfFromCameraBtn"),
  cameraStatus: document.getElementById("cameraStatus"),
  pdfReducerLink: document.getElementById("pdfReducerLink"),
  pdfReducerModal: document.getElementById("pdfReducerModal"),
  closePdfReducerBtn: document.getElementById("closePdfReducerBtn"),
  backFromPdfReducerBtn: document.getElementById("backFromPdfReducerBtn"),
  reducerFileInput: document.getElementById("reducerFileInput"),
  reducerFileInfo: document.getElementById("reducerFileInfo"),
  reducePdfBtn: document.getElementById("reducePdfBtn"),
  reduceStatus: document.getElementById("reduceStatus"),
};

let editingProjectIndex = null;
let projectsData = [];
let skillsData = [];

// Check if running in development mode
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' || 
                     window.location.hostname === '' ||
                     window.location.protocol === 'file:' ||
                     window.location.port === '5500' ||
                     window.location.port === '3000';

// Performance and error tracking
const performance = {
  startTime: Date.now(),
  errors: [],
  logError: (error, context) => {
    console.error(`Error in ${context}:`, error);
    performance.errors.push({ error: error.message, context, timestamp: Date.now() });
  }
};

// Debounce utility for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function loadProjects() {
  return await DataManager.loadProjects();
}

async function saveProjects(projects) {
  await DataManager.saveProjects(projects);
  // Auto-export updated data for easy GitHub sync
  if (isDevelopment) {
    autoExportData();
  }
}

async function loadSkills() {
  return await DataManager.loadSkills();
}

async function saveSkills(skills) {
  await DataManager.saveSkills(skills);
  // Auto-export updated data for easy GitHub sync
  if (isDevelopment) {
    autoExportData();
  }
}

function createProjectTile(proj, index) {
  const tile = document.createElement("div");
  tile.className = "project-tile";

  const editButton = isDevelopment ? '<button class="edit-btn">Edit</button>' : '';
  const deleteButton = isDevelopment ? '<button class="delete-btn">Delete</button>' : '';
  const shortDesc = proj.description.length > 100 ? proj.description.substring(0, 100) + '...' : proj.description;
  
  tile.innerHTML = `
    <h3>${proj.title}</h3>
    <div class="desc">${shortDesc}</div>
    <div class="click-hint">Click to view details</div>
    <div class="tile-actions">
      ${editButton}
      ${deleteButton}
    </div>
  `;

  tile.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn") || e.target.classList.contains("delete-btn")) return;
    openProjectDetail(proj);
  });

  if (isDevelopment) {
    const editBtn = tile.querySelector(".edit-btn");
    const deleteBtn = tile.querySelector(".delete-btn");
    
    if (editBtn) {
      editBtn.addEventListener("click", evt => {
        evt.stopPropagation();
        openProjectModal(index);
      });
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener("click", evt => {
        evt.stopPropagation();
        deleteProject(index);
      });
    }
  }

  return tile;
}

function renderSkills() {
  DOM.skillsList.innerHTML = "";
  skillsData.forEach((skill, index) => {
    const li = document.createElement("li");
    li.className = "skill-item";
    
    if (isDevelopment) {
      li.innerHTML = `
        <span class="skill-text">${skill}</span>
        <button class="skill-delete-btn" onclick="deleteSkill(${index})" title="Delete skill">×</button>
      `;
    } else {
      li.textContent = skill;
    }
    
    DOM.skillsList.appendChild(li);
  });
}

function renderProjects() {
  try {
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Clear existing content
    DOM.projectGrid.innerHTML = "";
    
    // Add project tiles
    projectsData.forEach((proj, idx) => {
      const tile = createProjectTile(proj, idx);
      fragment.appendChild(tile);
    });
    
    // Add "Add New" button for development
    if (isDevelopment) {
      fragment.appendChild(DOM.addNewBtn);
    }
    
    // Single DOM update
    DOM.projectGrid.appendChild(fragment);
  } catch (error) {
    performance.logError(error, 'renderProjects');
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
  
  // Force refresh to ensure tiles are visible
  setTimeout(() => {
    renderProjects();
  }, 100);
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

// PDF Scanner functionality
let selectedImages = [];

// Camera Scanner functionality
let capturedPhotos = [];
let cameraStream = null;

// PDF Reducer functionality
let selectedPdfFile = null;

function initPdfMerge() {
  DOM.pdfMergeLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = 'pdf-merge';
    DOM.pdfMergeModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  DOM.closePdfMergeBtn.addEventListener('click', closePdfMerge);
  DOM.backFromPdfMergeBtn.addEventListener('click', closePdfMerge);

  DOM.pdfFileInput.addEventListener('change', handleFileSelection);
  DOM.mergePdfBtn.addEventListener('click', mergePdfs);
}

function initPdfScanner() {
  DOM.pdfScannerLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = 'pdf-scanner';
    DOM.pdfScannerModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  DOM.closePdfScannerBtn.addEventListener('click', closePdfScanner);
  DOM.backFromPdfScannerBtn.addEventListener('click', closePdfScanner);

  DOM.scanFileInput.addEventListener('change', handleImageSelection);
  DOM.scanToPdfBtn.addEventListener('click', createPdfFromImages);
}

function closePdfScanner() {
  window.location.hash = '';
  DOM.pdfScannerModal.style.display = 'none';
  document.body.style.overflow = '';
}

function handleImageSelection(e) {
  selectedImages = Array.from(e.target.files);
  updateImagePreview();
  DOM.scanToPdfBtn.disabled = selectedImages.length === 0;
}

function updateImagePreview() {
  DOM.scanPreview.innerHTML = '';
  selectedImages.forEach((file, index) => {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.draggable = true;
    previewItem.dataset.index = index;
    previewItem.style.cssText = 'display: flex; align-items: center; margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; cursor: grab; transition: all 0.3s ease; border: 2px solid transparent;';
    
    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '⋮⋮';
    dragHandle.style.cssText = 'color: #3cc2ff; margin-right: 10px; cursor: grab;';
    
    const img = document.createElement('img');
    img.style.cssText = 'width: 60px; height: 60px; object-fit: cover; border-radius: 5px; margin-right: 10px;';
    img.src = URL.createObjectURL(file);
    
    const fileName = document.createElement('span');
    fileName.textContent = file.name;
    fileName.style.flex = '1';
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.style.cssText = 'background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;';
    removeBtn.addEventListener('click', () => removeImage(index));
    
    // Add drag event listeners
    previewItem.addEventListener('dragstart', handleImageDragStart);
    previewItem.addEventListener('dragover', handleImageDragOver);
    previewItem.addEventListener('drop', handleImageDrop);
    previewItem.addEventListener('dragend', handleImageDragEnd);
    
    previewItem.appendChild(dragHandle);
    previewItem.appendChild(img);
    previewItem.appendChild(fileName);
    previewItem.appendChild(removeBtn);
    DOM.scanPreview.appendChild(previewItem);
  });
}

function removeImage(index) {
  selectedImages.splice(index, 1);
  updateImagePreview();
  DOM.scanToPdfBtn.disabled = selectedImages.length === 0;
}

async function createPdfFromImages() {
  if (selectedImages.length === 0) return;
  
  DOM.scanStatus.textContent = 'Creating PDF from images...';
  DOM.scanToPdfBtn.disabled = true;
  DOM.scanToPdfBtn.classList.add('loading');
  
  try {
    const pdfDoc = await PDFLib.PDFDocument.create();
    
    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      DOM.scanStatus.textContent = `Processing image ${i + 1} of ${selectedImages.length}...`;
      
      const arrayBuffer = await file.arrayBuffer();
      let image;
      
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(arrayBuffer);
      } else {
        continue;
      }
      
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
      
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    DOM.scanStatus.textContent = 'Finalizing PDF...';
    const pdfBytes = await pdfDoc.save();
    
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scanned-document-${new Date().toISOString().split('T')[0]}.pdf`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    DOM.scanStatus.textContent = 'PDF created successfully! Download started.';
  } catch (error) {
    performance.logError(error, 'createPdfFromImages');
    DOM.scanStatus.textContent = 'Error creating PDF. Please try again.';
  } finally {
    DOM.scanToPdfBtn.disabled = false;
    DOM.scanToPdfBtn.classList.remove('loading');
  }
}

let draggedImageIndex = null;

function handleImageDragStart(e) {
  draggedImageIndex = parseInt(e.target.dataset.index);
  e.target.classList.add('dragging');
  e.target.style.opacity = '0.5';
}

function handleImageDragOver(e) {
  e.preventDefault();
  e.target.classList.add('drag-over');
  e.target.style.borderColor = '#3cc2ff';
  e.target.style.background = 'rgba(60, 194, 255, 0.2)';
}

function handleImageDrop(e) {
  e.preventDefault();
  const dropIndex = parseInt(e.target.dataset.index);
  
  if (draggedImageIndex !== null && draggedImageIndex !== dropIndex) {
    const draggedImage = selectedImages[draggedImageIndex];
    selectedImages.splice(draggedImageIndex, 1);
    selectedImages.splice(dropIndex, 0, draggedImage);
    updateImagePreview();
  }
  
  e.target.classList.remove('drag-over');
  e.target.style.borderColor = 'transparent';
  e.target.style.background = 'rgba(255,255,255,0.1)';
}

function handleImageDragEnd(e) {
  e.target.classList.remove('dragging');
  e.target.style.opacity = '1';
  document.querySelectorAll('.preview-item').forEach(item => {
    item.classList.remove('drag-over');
    item.style.borderColor = 'transparent';
    item.style.background = 'rgba(255,255,255,0.1)';
  });
  draggedImageIndex = null;
}

function initCameraScanner() {
  DOM.cameraScannerLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = 'camera-scanner';
    DOM.cameraScannerModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  DOM.closeCameraScannerBtn.addEventListener('click', closeCameraScanner);
  DOM.backFromCameraScannerBtn.addEventListener('click', closeCameraScanner);

  DOM.startCameraBtn.addEventListener('click', startCamera);
  DOM.captureBtn.addEventListener('click', capturePhoto);
  DOM.stopCameraBtn.addEventListener('click', stopCamera);
  DOM.createPdfFromCameraBtn.addEventListener('click', createPdfFromCamera);
}

function closeCameraScanner() {
  window.location.hash = '';
  stopCamera();
  DOM.cameraScannerModal.style.display = 'none';
  document.body.style.overflow = '';
}

async function startCamera() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera not supported on this device');
    }
    
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920, min: 640 },
        height: { ideal: 1080, min: 480 }
      }
    };
    
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    DOM.cameraVideo.srcObject = cameraStream;
    DOM.cameraVideo.style.display = 'block';
    DOM.startCameraBtn.style.display = 'none';
    DOM.captureBtn.style.display = 'inline-block';
    DOM.captureBtn.disabled = false;
    DOM.stopCameraBtn.style.display = 'inline-block';
    DOM.stopCameraBtn.disabled = false;
    DOM.cameraStatus.textContent = 'Camera ready! Position document and capture.';
  } catch (error) {
    let errorMessage = 'Camera access denied or not available.';
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera permission denied. Please allow camera access.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera found on this device.';
    }
    DOM.cameraStatus.textContent = errorMessage;
    performance.logError(error, 'startCamera');
  }
}

function capturePhoto() {
  const canvas = DOM.cameraCanvas;
  const video = DOM.cameraVideo;
  const context = canvas.getContext('2d');
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  
  canvas.toBlob((blob) => {
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    capturedPhotos.push(file);
    updateCapturedImages();
    DOM.createPdfFromCameraBtn.disabled = false;
    DOM.cameraStatus.textContent = `Captured ${capturedPhotos.length} photo(s). Continue capturing or create PDF.`;
  }, 'image/jpeg', 0.9);
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  DOM.cameraVideo.style.display = 'none';
  DOM.startCameraBtn.style.display = 'inline-block';
  DOM.captureBtn.style.display = 'none';
  DOM.stopCameraBtn.style.display = 'none';
}

function updateCapturedImages() {
  DOM.capturedImages.innerHTML = '';
  capturedPhotos.forEach((file, index) => {
    const imageItem = document.createElement('div');
    imageItem.className = 'captured-image';
    imageItem.draggable = true;
    imageItem.dataset.index = index;
    imageItem.style.cssText = 'display: flex; align-items: center; margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; cursor: grab; transition: all 0.3s ease; border: 2px solid transparent;';
    
    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '⋮⋮';
    dragHandle.style.cssText = 'color: #3cc2ff; margin-right: 10px; cursor: grab;';
    
    const img = document.createElement('img');
    img.style.cssText = 'width: 60px; height: 60px; object-fit: cover; border-radius: 5px; margin-right: 10px;';
    img.src = URL.createObjectURL(file);
    
    const fileName = document.createElement('span');
    fileName.textContent = `Photo ${index + 1}`;
    fileName.style.flex = '1';
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.style.cssText = 'background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;';
    removeBtn.addEventListener('click', () => removeCapturedPhoto(index));
    
    // Add drag event listeners
    imageItem.addEventListener('dragstart', handleCameraDragStart);
    imageItem.addEventListener('dragover', handleCameraDragOver);
    imageItem.addEventListener('drop', handleCameraDrop);
    imageItem.addEventListener('dragend', handleCameraDragEnd);
    
    imageItem.appendChild(dragHandle);
    imageItem.appendChild(img);
    imageItem.appendChild(fileName);
    imageItem.appendChild(removeBtn);
    DOM.capturedImages.appendChild(imageItem);
  });
}

function removeCapturedPhoto(index) {
  capturedPhotos.splice(index, 1);
  updateCapturedImages();
  DOM.createPdfFromCameraBtn.disabled = capturedPhotos.length === 0;
}

let draggedCameraIndex = null;

function handleCameraDragStart(e) {
  draggedCameraIndex = parseInt(e.target.dataset.index);
  e.target.classList.add('dragging');
  e.target.style.opacity = '0.5';
}

function handleCameraDragOver(e) {
  e.preventDefault();
  e.target.classList.add('drag-over');
  e.target.style.borderColor = '#3cc2ff';
  e.target.style.background = 'rgba(60, 194, 255, 0.2)';
}

function handleCameraDrop(e) {
  e.preventDefault();
  const dropIndex = parseInt(e.target.dataset.index);
  
  if (draggedCameraIndex !== null && draggedCameraIndex !== dropIndex) {
    const draggedPhoto = capturedPhotos[draggedCameraIndex];
    capturedPhotos.splice(draggedCameraIndex, 1);
    capturedPhotos.splice(dropIndex, 0, draggedPhoto);
    updateCapturedImages();
  }
  
  e.target.classList.remove('drag-over');
  e.target.style.borderColor = 'transparent';
  e.target.style.background = 'rgba(255,255,255,0.1)';
}

function handleCameraDragEnd(e) {
  e.target.classList.remove('dragging');
  e.target.style.opacity = '1';
  document.querySelectorAll('.captured-image').forEach(item => {
    item.classList.remove('drag-over');
    item.style.borderColor = 'transparent';
    item.style.background = 'rgba(255,255,255,0.1)';
  });
  draggedCameraIndex = null;
}

async function createPdfFromCamera() {
  if (capturedPhotos.length === 0) return;
  
  DOM.cameraStatus.textContent = 'Creating PDF from captured photos...';
  DOM.createPdfFromCameraBtn.disabled = true;
  DOM.createPdfFromCameraBtn.classList.add('loading');
  
  try {
    const pdfDoc = await PDFLib.PDFDocument.create();
    
    for (let i = 0; i < capturedPhotos.length; i++) {
      const file = capturedPhotos[i];
      DOM.cameraStatus.textContent = `Processing photo ${i + 1} of ${capturedPhotos.length}...`;
      
      const arrayBuffer = await file.arrayBuffer();
      const image = await pdfDoc.embedJpg(arrayBuffer);
      
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
      
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    DOM.cameraStatus.textContent = 'Finalizing PDF...';
    const pdfBytes = await pdfDoc.save();
    
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camera-scan-${new Date().toISOString().split('T')[0]}.pdf`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    DOM.cameraStatus.textContent = 'PDF created successfully! Download started.';
  } catch (error) {
    performance.logError(error, 'createPdfFromCamera');
    DOM.cameraStatus.textContent = 'Error creating PDF. Please try again.';
  } finally {
    DOM.createPdfFromCameraBtn.disabled = false;
    DOM.createPdfFromCameraBtn.classList.remove('loading');
  }
}

// Make functions globally accessible
window.removeCapturedPhoto = removeCapturedPhoto;

// Auto-export functionality for development
async function autoExportData() {
  try {
    const projects = await DataManager.loadProjects();
    const skills = await DataManager.loadSkills();
    
    const data = {
      projects: projects,
      skills: skills
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create invisible download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.json';
    a.style.display = 'none';
    
    // Show notification instead of auto-download
    showUpdateNotification(url, a);
    
  } catch (error) {
    console.error('Auto-export failed:', error);
  }
}

function showUpdateNotification(url, downloadLink) {
  // Remove existing notification
  const existing = document.getElementById('update-notification');
  if (existing) existing.remove();
  
  // Create notification
  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #1976d2, #3cc2ff);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.9rem;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;
  
  notification.innerHTML = `
    <div style="margin-bottom: 10px;">📁 Data Updated!</div>
    <div style="font-size: 0.8rem; margin-bottom: 15px; opacity: 0.9;">
      Download updated portfolio-data.json for GitHub
    </div>
    <div style="display: flex; gap: 10px;">
      <button id="download-btn" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
      ">Download</button>
      <button id="dismiss-btn" style="
        background: transparent;
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
      ">Dismiss</button>
    </div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Add event listeners
  notification.querySelector('#download-btn').addEventListener('click', () => {
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    notification.remove();
  });
  
  notification.querySelector('#dismiss-btn').addEventListener('click', () => {
    URL.revokeObjectURL(url);
    notification.remove();
  });
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      URL.revokeObjectURL(url);
      notification.remove();
    }
  }, 10000);
}

// Delete project function
async function deleteProject(index) {
  if (confirm(`Are you sure you want to delete "${projectsData[index].title}"?`)) {
    projectsData.splice(index, 1);
    await saveProjects(projectsData);
    renderProjects();
  }
}

// Delete skill function
async function deleteSkill(index) {
  if (confirm(`Are you sure you want to delete "${skillsData[index]}"?`)) {
    skillsData.splice(index, 1);
    await saveSkills(skillsData);
    renderSkills();
  }
}

// Make deleteSkill globally accessible
window.deleteSkill = deleteSkill;

// Make removeImage globally accessible
window.removeImage = removeImage;

function closePdfMerge() {
  window.location.hash = '';
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
    
    const fileInfo = document.createElement('div');
    fileInfo.style.display = 'flex';
    fileInfo.style.alignItems = 'center';
    
    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '⋮⋮';
    
    const fileName = document.createElement('span');
    fileName.textContent = file.name;
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.style.cssText = 'background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;';
    removeBtn.addEventListener('click', () => removeFile(index));
    
    fileInfo.appendChild(dragHandle);
    fileInfo.appendChild(fileName);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeBtn);
    
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

// Make removeFile globally accessible
window.removeFile = removeFile;

function initUtilitiesMenu() {
  const utilitiesBtn = document.getElementById('utilitiesBtn');
  const utilitiesMenu = document.getElementById('utilitiesMenu');
  
  utilitiesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = utilitiesMenu.style.display === 'block';
    utilitiesMenu.style.display = isVisible ? 'none' : 'block';
    utilitiesBtn.setAttribute('aria-expanded', !isVisible);
  });
  
  // Keyboard navigation
  utilitiesBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      utilitiesBtn.click();
    }
  });
  
  // Close menu when clicking outside or pressing Escape
  document.addEventListener('click', () => {
    utilitiesMenu.style.display = 'none';
    utilitiesBtn.setAttribute('aria-expanded', 'false');
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      utilitiesMenu.style.display = 'none';
      utilitiesBtn.setAttribute('aria-expanded', 'false');
    }
  });
  
  utilitiesMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Make utility items keyboard accessible
  document.querySelectorAll('.utility-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
}

function initProductionOptimizations() {
  // Viewport height fix for mobile browsers
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  setVH();
  window.addEventListener('resize', debounce(setVH, 100));
  window.addEventListener('orientationchange', () => setTimeout(setVH, 100));
  
  // Preload critical resources
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      if (!window.pdfjsLib) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(link);
      }
    });
  }
  
  // Error boundary
  window.addEventListener('error', (e) => {
    console.error('Production Error:', e.error);
  });
}

function initPdfReducer() {
  DOM.pdfReducerLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = 'pdf-reducer';
    DOM.pdfReducerModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  DOM.closePdfReducerBtn.addEventListener('click', closePdfReducer);
  DOM.backFromPdfReducerBtn.addEventListener('click', closePdfReducer);

  DOM.reducerFileInput.addEventListener('change', handlePdfFileSelection);
  DOM.reducePdfBtn.addEventListener('click', reducePdfSize);
  
  // Add compression level change listener
  document.addEventListener('change', (e) => {
    if (e.target.name === 'compression' && selectedPdfFile) {
      updateSizePreview(selectedPdfFile.size);
    }
  });
}

function closePdfReducer() {
  window.location.hash = '';
  DOM.pdfReducerModal.style.display = 'none';
  document.body.style.overflow = '';
  selectedPdfFile = null;
  DOM.reducerFileInfo.innerHTML = '';
  DOM.reducePdfBtn.disabled = true;
  DOM.reduceStatus.textContent = '';
}

function handlePdfFileSelection(e) {
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    selectedPdfFile = file;
    updatePdfFileInfo(file);
    DOM.reducePdfBtn.disabled = false;
  } else {
    selectedPdfFile = null;
    DOM.reducerFileInfo.innerHTML = '';
    DOM.reducePdfBtn.disabled = true;
  }
}

function updatePdfFileInfo(file) {
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  DOM.reducerFileInfo.innerHTML = `
    <div class="file-details">
      <div class="file-name">${file.name}</div>
      <div class="file-size">Current size: ${sizeInMB} MB</div>
      <div class="size-preview" id="sizePreview"></div>
    </div>
  `;
  updateSizePreview(file.size);
}

function updateSizePreview(originalSize) {
  const compressionLevel = document.querySelector('input[name="compression"]:checked')?.value || 'low';
  const reductionRates = { low: 0.15, medium: 0.35, high: 0.55, extreme: 0.85 };
  const estimatedReduction = reductionRates[compressionLevel];
  const estimatedSize = originalSize * (1 - estimatedReduction);
  
  const originalMB = (originalSize / (1024 * 1024)).toFixed(2);
  const estimatedMB = (estimatedSize / (1024 * 1024)).toFixed(2);
  const savingsMB = (originalMB - estimatedMB).toFixed(2);
  
  const previewEl = document.getElementById('sizePreview');
  if (previewEl) {
    previewEl.innerHTML = `
      <div class="size-estimate">
        <div class="estimate-title">📊 Estimated Result:</div>
        <div class="estimate-details">
          <div>Expected size: ~${estimatedMB} MB</div>
          <div>Potential savings: ~${savingsMB} MB (${(estimatedReduction * 100).toFixed(0)}%)</div>
        </div>
      </div>
    `;
  }
}

async function reducePdfSize() {
  if (!selectedPdfFile) return;
  
  const compressionLevel = document.querySelector('input[name="compression"]:checked').value;
  
  DOM.reduceStatus.textContent = 'Loading PDF...';
  DOM.reducePdfBtn.disabled = true;
  DOM.reducePdfBtn.classList.add('loading');
  
  try {
    // Load PDF.js for rendering
    if (!window.pdfjsLib) {
      await loadPdfJs();
    }
    
    const arrayBuffer = await selectedPdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    DOM.reduceStatus.textContent = 'Converting pages to images...';
    
    const quality = getCompressionQuality(compressionLevel);
    const compressedDoc = await PDFLib.PDFDocument.create();
    
    for (let i = 1; i <= pdf.numPages; i++) {
      DOM.reduceStatus.textContent = `Processing page ${i} of ${pdf.numPages}...`;
      
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: quality.scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({ canvasContext: context, viewport }).promise;
      
      // Convert canvas to compressed JPEG
      const imageData = canvas.toDataURL('image/jpeg', quality.jpegQuality);
      const imageBytes = dataURLToBytes(imageData);
      
      // Embed compressed image in new PDF
      const image = await compressedDoc.embedJpg(imageBytes);
      const newPage = compressedDoc.addPage([viewport.width, viewport.height]);
      newPage.drawImage(image, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
      
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    DOM.reduceStatus.textContent = 'Finalizing PDF...';
    
    const compressedPdfBytes = await compressedDoc.save();
    
    const originalSize = selectedPdfFile.size;
    const compressedSize = compressedPdfBytes.length;
    const reductionPercent = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    // Create download
    const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${selectedPdfFile.name}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    const originalMB = (originalSize / (1024 * 1024)).toFixed(2);
    const compressedMB = (compressedSize / (1024 * 1024)).toFixed(2);
    
    DOM.reduceStatus.innerHTML = `
      <div class="compression-result">
        <div>✅ PDF compressed successfully!</div>
        <div>Original: ${originalMB} MB → Compressed: ${compressedMB} MB</div>
        <div>Size reduction: ${reductionPercent}%</div>
      </div>
    `;
  } catch (error) {
    performance.logError(error, 'reducePdfSize');
    DOM.reduceStatus.textContent = 'Error compressing PDF. Please try again.';
  } finally {
    DOM.reducePdfBtn.disabled = false;
    DOM.reducePdfBtn.classList.remove('loading');
  }
}

async function loadPdfJs() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function dataURLToBytes(dataURL) {
  const base64 = dataURL.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function getCompressionQuality(level) {
  switch (level) {
    case 'low':
      return { scale: 1.5, jpegQuality: 0.8 };
    case 'medium':
      return { scale: 1.2, jpegQuality: 0.6 };
    case 'high':
      return { scale: 1.0, jpegQuality: 0.4 };
    case 'extreme':
      return { scale: 0.7, jpegQuality: 0.2 };
    default:
      return { scale: 1.5, jpegQuality: 0.8 };
  }
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
  
  // Initialize PDF scanner
  initPdfScanner();
  
  // Initialize camera scanner
  initCameraScanner();
  
  // Initialize PDF reducer
  initPdfReducer();
  
  // Initialize utilities menu
  initUtilitiesMenu();
  
  // Initialize smooth header
  initScrollHeader();
  
  // Production optimizations
  initProductionOptimizations();
  
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

// Global error handler
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

// Viewport height fix for mobile
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', debounce(setViewportHeight, 100));
window.addEventListener('orientationchange', () => {
  setTimeout(setViewportHeight, 100);
});

// Service Worker registration for production with cache busting
if ('serviceWorker' in navigator && !isDevelopment) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=20250103001')
      .then(registration => {
        console.log('Service Worker registered successfully');
        // Force update check
        registration.update();
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, refresh page
              if (confirm('New version available! Refresh to update?')) {
                window.location.reload(true);
              }
            }
          });
        });
      })
      .catch(error => console.error('Service Worker registration failed:', error));
  });
}

// Intersection Observer for lazy loading animations
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('loaded');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    // Observe sections for lazy loading
    document.querySelectorAll('section').forEach(section => {
      section.classList.add('lazy-load');
      observer.observe(section);
    });
  } else {
    // Fallback for older browsers
    document.querySelectorAll('section').forEach(section => {
      section.classList.add('loaded');
    });
  }
}

// Handle page refresh in modals
function handlePageRefresh() {
  const hash = window.location.hash;
  if (hash === '#pdf-merge') {
    DOM.pdfMergeModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  } else if (hash === '#pdf-scanner') {
    DOM.pdfScannerModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  } else if (hash === '#camera-scanner') {
    DOM.cameraScannerModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  } else if (hash === '#pdf-reducer') {
    DOM.pdfReducerModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    initLazyLoading();
    handlePageRefresh();
  });
} else {
  init();
  initLazyLoading();
  handlePageRefresh();
}
