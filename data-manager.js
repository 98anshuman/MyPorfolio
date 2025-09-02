// File-based Data Manager with fallback for static hosting
class DataManager {
  static getDefaultProjects() {
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

  static getDefaultSkills() {
    return [
      "Penetration Testing", "Network Security", "SIEM Operations", "Incident Response",
      "Python & Bash Scripting", "Cryptography", "Cloud Security (AWS/Azure)",
      "Threat Intelligence", "Malware Analysis"
    ];
  }

  static async loadProjects() {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Server not available');
    } catch (err) {
      // Fallback to localStorage or default data
      const stored = localStorage.getItem('portfolio_projects');
      return stored ? JSON.parse(stored) : this.getDefaultProjects();
    }
  }

  static async saveProjects(projects) {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projects)
      });
      if (!response.ok) throw new Error('Server save failed');
    } catch (err) {
      // Fallback to localStorage
      localStorage.setItem('portfolio_projects', JSON.stringify(projects));
    }
  }

  static async loadSkills() {
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Server not available');
    } catch (err) {
      // Fallback to localStorage or default data
      const stored = localStorage.getItem('portfolio_skills');
      return stored ? JSON.parse(stored) : this.getDefaultSkills();
    }
  }

  static async saveSkills(skills) {
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skills)
      });
      if (!response.ok) throw new Error('Server save failed');
    } catch (err) {
      // Fallback to localStorage
      localStorage.setItem('portfolio_skills', JSON.stringify(skills));
    }
  }
}

export { DataManager };