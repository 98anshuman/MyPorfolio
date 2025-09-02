const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');
const SKILLS_FILE = path.join(__dirname, 'data', 'skills.json');

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ensure data directory exists
if (!fs.existsSync(path.dirname(PROJECTS_FILE))) {
  fs.mkdirSync(path.dirname(PROJECTS_FILE), { recursive: true });
}

// Load projects
app.get('/api/projects', (req, res) => {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
      res.json(JSON.parse(data));
    } else {
      const defaultProjects = [
        {
          title: "Network Vulnerability Scanner",
          description: "Built an automated scanner for open ports, outdated protocols, and known vulnerabilities across enterprise infrastructure."
        },
        {
          title: "Web Application Security Testing",
          description: "Found and reported CVSS-9+ vulnerabilities in client web apps; automated scripting for SQLi, XSS, CSRF and business logic flaws."
        }
      ];
      res.json(defaultProjects);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to load projects' });
  }
});

// Save projects
app.post('/api/projects', (req, res) => {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save projects' });
  }
});

// Load skills
app.get('/api/skills', (req, res) => {
  try {
    if (fs.existsSync(SKILLS_FILE)) {
      const data = fs.readFileSync(SKILLS_FILE, 'utf8');
      res.json(JSON.parse(data));
    } else {
      const defaultSkills = [
        "Penetration Testing", "Network Security", "SIEM Operations", "Incident Response",
        "Python & Bash Scripting", "Cryptography", "Cloud Security (AWS/Azure)",
        "Threat Intelligence", "Malware Analysis"
      ];
      res.json(defaultSkills);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to load skills' });
  }
});

// Save skills
app.post('/api/skills', (req, res) => {
  try {
    fs.writeFileSync(SKILLS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save skills' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});