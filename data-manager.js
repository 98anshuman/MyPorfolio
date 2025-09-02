// File-based Data Manager with fallback for static hosting
class DataManager {
  static getDefaultProjects() {
    return [
      {
        title: "Network Security Assessment Tool",
        description: "Developed a comprehensive network security assessment tool using Python and Nmap. The tool performs automated vulnerability scanning, port analysis, and generates detailed security reports. Features include real-time monitoring, threat detection algorithms, and integration with SIEM systems for enhanced security posture management."
      },
      {
        title: "Incident Response Automation Platform",
        description: "Built an automated incident response platform that integrates with Microsoft Defender 365 and Azure Sentinel. The system uses machine learning algorithms to classify threats, automatically contains suspicious activities, and generates forensic reports. Reduced incident response time by 70% and improved threat detection accuracy."
      },
      {
        title: "Cloud Security Compliance Dashboard",
        description: "Created a real-time compliance monitoring dashboard for multi-cloud environments (Azure, AWS, GCP). The solution tracks security configurations, monitors policy violations, and provides automated remediation suggestions. Implemented using PowerShell, KQL queries, and Azure Logic Apps for seamless integration."
      },
      {
        title: "Endpoint Protection Enhancement Suite",
        description: "Designed and implemented an advanced endpoint protection suite that extends Microsoft Intune capabilities. Features include custom threat hunting rules, behavioral analysis, and automated patch management. The solution improved endpoint security coverage by 85% and reduced false positives significantly."
      }
    ];
  }

  static getDefaultSkills() {
    return [
      "Microsoft Defender 365", "Azure AD & Intune", "KQL (Kusto Query Language)", "Threat Hunting",
      "Incident Response", "Penetration Testing", "SIEM/SOAR", "PowerShell Scripting",
      "Python Security Tools", "Network Security", "Vulnerability Assessment", "Cloud Security (Azure/AWS)",
      "Compliance & Governance", "Forensic Analysis", "Risk Assessment", "Security Automation"
    ];
  }

  static async loadProjects() {
    const isProduction = window.location.protocol === 'https:' && 
                        (window.location.hostname.includes('github.io') || 
                         window.location.hostname.includes('netlify.app') ||
                         window.location.hostname.includes('vercel.app'));
    
    if (isProduction) {
      try {
        const response = await fetch('./data/portfolio-data.json');
        const data = await response.json();
        return data.projects || this.getDefaultProjects();
      } catch (err) {
        return this.getDefaultProjects();
      }
    } else {
      const stored = localStorage.getItem('portfolio_projects');
      return stored ? JSON.parse(stored) : this.getDefaultProjects();
    }
  }

  static async saveProjects(projects) {
    const isProduction = window.location.protocol === 'https:' && 
                        (window.location.hostname.includes('github.io') || 
                         window.location.hostname.includes('netlify.app') ||
                         window.location.hostname.includes('vercel.app'));
    
    if (!isProduction) {
      localStorage.setItem('portfolio_projects', JSON.stringify(projects));
    }
  }

  static async loadSkills() {
    const isProduction = window.location.protocol === 'https:' && 
                        (window.location.hostname.includes('github.io') || 
                         window.location.hostname.includes('netlify.app') ||
                         window.location.hostname.includes('vercel.app'));
    
    if (isProduction) {
      try {
        const response = await fetch('./data/portfolio-data.json');
        const data = await response.json();
        return data.skills || this.getDefaultSkills();
      } catch (err) {
        return this.getDefaultSkills();
      }
    } else {
      const stored = localStorage.getItem('portfolio_skills');
      return stored ? JSON.parse(stored) : this.getDefaultSkills();
    }
  }

  static async saveSkills(skills) {
    const isProduction = window.location.protocol === 'https:' && 
                        (window.location.hostname.includes('github.io') || 
                         window.location.hostname.includes('netlify.app') ||
                         window.location.hostname.includes('vercel.app'));
    
    if (!isProduction) {
      localStorage.setItem('portfolio_skills', JSON.stringify(skills));
    }
  }
}

export { DataManager };