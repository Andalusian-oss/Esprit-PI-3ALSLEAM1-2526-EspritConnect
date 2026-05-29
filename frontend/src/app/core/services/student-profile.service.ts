import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { StudentSkill, StudentProject, StudentSkillRequest, StudentProjectRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  private apiUrl = `${environment.apiUrl}/students`;

  private mockSkillsData: { [key: number]: StudentSkill[] } = {
    1: [
      { id: 1, studentUserId: 1, name: 'Angular', category: 'FRAMEWORK', proficiency: 'EXPERT', addedAt: '2024-01-15', yearsOfExperience: 3 },
      { id: 2, studentUserId: 1, name: 'TypeScript', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-01-16', yearsOfExperience: 2.5 },
      { id: 3, studentUserId: 1, name: 'Node.js', category: 'FRAMEWORK', proficiency: 'ADVANCED', addedAt: '2024-01-17', yearsOfExperience: 2 },
      { id: 4, studentUserId: 1, name: 'MongoDB', category: 'TOOL', proficiency: 'INTERMEDIATE', addedAt: '2024-01-18', yearsOfExperience: 1.5 },
      { id: 5, studentUserId: 1, name: 'Leadership', category: 'SOFT', proficiency: 'ADVANCED', addedAt: '2024-02-01', yearsOfExperience: 1 },
    ],
    2: [
      { id: 6, studentUserId: 2, name: 'Python', category: 'TECHNICAL', proficiency: 'EXPERT', addedAt: '2024-01-10', yearsOfExperience: 3 },
      { id: 7, studentUserId: 2, name: 'Machine Learning', category: 'FRAMEWORK', proficiency: 'ADVANCED', addedAt: '2024-02-05', yearsOfExperience: 2 },
      { id: 8, studentUserId: 2, name: 'TensorFlow', category: 'FRAMEWORK', proficiency: 'ADVANCED', addedAt: '2024-01-11', yearsOfExperience: 1.5 },
      { id: 9, studentUserId: 2, name: 'Data Analysis', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-01-12', yearsOfExperience: 2 },
      { id: 10, studentUserId: 2, name: 'Communication', category: 'SOFT', proficiency: 'INTERMEDIATE', addedAt: '2024-02-10', yearsOfExperience: 1 },
    ],
    3: [
      { id: 11, studentUserId: 3, name: 'Python', category: 'TECHNICAL', proficiency: 'EXPERT', addedAt: '2024-01-05', yearsOfExperience: 2.5 },
      { id: 12, studentUserId: 3, name: 'SQL', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-01-06', yearsOfExperience: 2 },
      { id: 13, studentUserId: 3, name: 'Spark', category: 'TOOL', proficiency: 'ADVANCED', addedAt: '2024-01-07', yearsOfExperience: 1.5 },
      { id: 14, studentUserId: 3, name: 'Tableau', category: 'TOOL', proficiency: 'INTERMEDIATE', addedAt: '2024-02-03', yearsOfExperience: 1 },
      { id: 15, studentUserId: 3, name: 'Statistics', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-01-08', yearsOfExperience: 2 },
    ],
    4: [
      { id: 16, studentUserId: 4, name: 'AWS', category: 'TOOL', proficiency: 'ADVANCED', addedAt: '2024-01-12', yearsOfExperience: 2 },
      { id: 17, studentUserId: 4, name: 'Kubernetes', category: 'TOOL', proficiency: 'ADVANCED', addedAt: '2024-01-13', yearsOfExperience: 1.5 },
      { id: 18, studentUserId: 4, name: 'Docker', category: 'TOOL', proficiency: 'EXPERT', addedAt: '2024-01-14', yearsOfExperience: 2 },
      { id: 19, studentUserId: 4, name: 'Terraform', category: 'TOOL', proficiency: 'INTERMEDIATE', addedAt: '2024-02-08', yearsOfExperience: 1 },
      { id: 20, studentUserId: 4, name: 'Problem Solving', category: 'SOFT', proficiency: 'ADVANCED', addedAt: '2024-02-09', yearsOfExperience: 2 },
    ],
    5: [
      { id: 21, studentUserId: 5, name: 'Network Administration', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-01-20', yearsOfExperience: 1.5 },
      { id: 22, studentUserId: 5, name: 'Cisco IOS', category: 'TOOL', proficiency: 'INTERMEDIATE', addedAt: '2024-01-21', yearsOfExperience: 1 },
      { id: 23, studentUserId: 5, name: 'Linux', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-01-22', yearsOfExperience: 2 },
      { id: 24, studentUserId: 5, name: 'VPN & Firewalls', category: 'TECHNICAL', proficiency: 'INTERMEDIATE', addedAt: '2024-02-11', yearsOfExperience: 1 },
      { id: 25, studentUserId: 5, name: 'Analytical Skills', category: 'SOFT', proficiency: 'ADVANCED', addedAt: '2024-02-12', yearsOfExperience: 1.5 },
    ],
    6: [
      { id: 26, studentUserId: 6, name: 'Cybersecurity', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-01-18', yearsOfExperience: 1.5 },
      { id: 27, studentUserId: 6, name: 'Penetration Testing', category: 'TECHNICAL', proficiency: 'INTERMEDIATE', addedAt: '2024-01-19', yearsOfExperience: 1 },
      { id: 28, studentUserId: 6, name: 'Python', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-01-20', yearsOfExperience: 2 },
      { id: 29, studentUserId: 6, name: 'Ethics', category: 'SOFT', proficiency: 'ADVANCED', addedAt: '2024-02-14', yearsOfExperience: 1 },
      { id: 30, studentUserId: 6, name: 'Risk Management', category: 'TECHNICAL', proficiency: 'INTERMEDIATE', addedAt: '2024-01-21', yearsOfExperience: 1 },
    ],
    7: [
      { id: 31, studentUserId: 7, name: 'Jenkins', category: 'TOOL', proficiency: 'ADVANCED', addedAt: '2024-01-25', yearsOfExperience: 2 },
      { id: 32, studentUserId: 7, name: 'Git', category: 'TOOL', proficiency: 'EXPERT', addedAt: '2024-01-26', yearsOfExperience: 2.5 },
      { id: 33, studentUserId: 7, name: 'Docker', category: 'TOOL', proficiency: 'ADVANCED', addedAt: '2024-01-27', yearsOfExperience: 2 },
      { id: 34, studentUserId: 7, name: 'Bash', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-01-28', yearsOfExperience: 2 },
      { id: 35, studentUserId: 7, name: 'Monitoring & Logging', category: 'TECHNICAL', proficiency: 'INTERMEDIATE', addedAt: '2024-02-16', yearsOfExperience: 1 },
    ],
    8: [
      { id: 36, studentUserId: 8, name: 'React Native', category: 'FRAMEWORK', proficiency: 'ADVANCED', addedAt: '2024-02-01', yearsOfExperience: 1.5 },
      { id: 37, studentUserId: 8, name: 'JavaScript', category: 'TECHNICAL', proficiency: 'EXPERT', addedAt: '2024-02-02', yearsOfExperience: 2.5 },
      { id: 38, studentUserId: 8, name: 'Flutter', category: 'FRAMEWORK', proficiency: 'INTERMEDIATE', addedAt: '2024-02-03', yearsOfExperience: 1 },
      { id: 39, studentUserId: 8, name: 'Firebase', category: 'TOOL', proficiency: 'ADVANCED', addedAt: '2024-02-04', yearsOfExperience: 1.5 },
      { id: 40, studentUserId: 8, name: 'UI/UX Design', category: 'SOFT', proficiency: 'INTERMEDIATE', addedAt: '2024-02-18', yearsOfExperience: 1 },
    ],
    9: [
      { id: 41, studentUserId: 9, name: 'Figma', category: 'TOOL', proficiency: 'ADVANCED', addedAt: '2024-02-01', yearsOfExperience: 2 },
      { id: 42, studentUserId: 9, name: 'UI/UX Design', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-02-02', yearsOfExperience: 2.5 },
      { id: 43, studentUserId: 9, name: 'Adobe XD', category: 'TOOL', proficiency: 'INTERMEDIATE', addedAt: '2024-02-03', yearsOfExperience: 1.5 },
      { id: 44, studentUserId: 9, name: 'Prototyping', category: 'TECHNICAL', proficiency: 'INTERMEDIATE', addedAt: '2024-02-04', yearsOfExperience: 1 },
      { id: 45, studentUserId: 9, name: 'Creative Thinking', category: 'SOFT', proficiency: 'ADVANCED', addedAt: '2024-02-18', yearsOfExperience: 2 },
    ],
    10: [
      { id: 46, studentUserId: 10, name: 'Selenium', category: 'TOOL', proficiency: 'ADVANCED', addedAt: '2024-02-01', yearsOfExperience: 2 },
      { id: 47, studentUserId: 10, name: 'Test Automation', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-02-02', yearsOfExperience: 2.5 },
      { id: 48, studentUserId: 10, name: 'JIRA', category: 'TOOL', proficiency: 'INTERMEDIATE', addedAt: '2024-02-03', yearsOfExperience: 1.5 },
      { id: 49, studentUserId: 10, name: 'Manual Testing', category: 'TECHNICAL', proficiency: 'ADVANCED', addedAt: '2024-02-04', yearsOfExperience: 2 },
      { id: 50, studentUserId: 10, name: 'Attention to Detail', category: 'SOFT', proficiency: 'EXPERT', addedAt: '2024-02-18', yearsOfExperience: 1.5 },
    ],
  };

  private mockProjectsData: { [key: number]: StudentProject[] } = {
    1: [
      { id: 1, studentUserId: 1, titre: 'E-Commerce Platform', description: 'Full-stack e-commerce platform with Angular frontend, Node.js backend', technologies: ['Angular', 'Node.js', 'MongoDB', 'JWT'], githubUrl: 'https://github.com/example/ecommerce', liveUrl: 'https://ecommerce-example.com', startDate: '2024-01-01', endDate: '2024-03-15', status: 'COMPLETED', createdAt: '2024-01-01' },
      { id: 2, studentUserId: 1, titre: 'Real-time Chat Application', description: 'WebSocket-based real-time chat with room functionality', technologies: ['Angular', 'Node.js', 'Socket.io', 'PostgreSQL'], githubUrl: 'https://github.com/example/chat-app', liveUrl: 'https://chat-app-example.com', startDate: '2024-03-20', endDate: '2024-05-01', status: 'COMPLETED', createdAt: '2024-03-20' }
    ],
    2: [
      { id: 3, studentUserId: 2, titre: 'ML Sentiment Analysis Model', description: 'Machine learning model for sentiment analysis with 94% accuracy', technologies: ['Python', 'TensorFlow', 'NLTK', 'Scikit-learn'], githubUrl: 'https://github.com/example/sentiment-analysis', startDate: '2024-02-01', endDate: '2024-04-10', status: 'COMPLETED', createdAt: '2024-02-01' },
      { id: 4, studentUserId: 2, titre: 'Image Classification Neural Network', description: 'CNN for image classification using TensorFlow', technologies: ['Python', 'TensorFlow', 'Keras', 'NumPy'], githubUrl: 'https://github.com/example/image-classification', startDate: '2024-03-15', status: 'IN_PROGRESS', createdAt: '2024-03-15' }
    ],
    3: [
      { id: 5, studentUserId: 3, titre: 'COVID-19 Data Analysis Dashboard', description: 'Global COVID-19 data visualization and analysis', technologies: ['Python', 'Spark', 'SQL', 'Tableau'], githubUrl: 'https://github.com/example/covid-analysis', startDate: '2024-01-10', endDate: '2024-03-20', status: 'COMPLETED', createdAt: '2024-01-10' },
      { id: 6, studentUserId: 3, titre: 'E-commerce Sales Forecasting', description: 'Time-series forecasting with 92% accuracy', technologies: ['Python', 'Scikit-learn', 'Prophet', 'SQL'], githubUrl: 'https://github.com/example/sales-forecast', startDate: '2024-02-01', status: 'IN_PROGRESS', createdAt: '2024-02-01' }
    ],
    4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: []
  };

  constructor(private http: HttpClient) {}

  getSkills(studentUserId: number): Observable<StudentSkill[]> {
    return of(this.mockSkillsData[studentUserId] || this.getDefaultSkills(studentUserId));
  }

  addSkill(studentUserId: number, skill: StudentSkillRequest): Observable<StudentSkill> {
    const newSkill: StudentSkill = {
      id: Math.floor(Math.random() * 10000),
      studentUserId,
      ...skill,
      addedAt: new Date().toISOString()
    };
    if (!this.mockSkillsData[studentUserId]) {
      this.mockSkillsData[studentUserId] = [];
    }
    this.mockSkillsData[studentUserId].push(newSkill);
    return of(newSkill);
  }

  updateSkill(studentUserId: number, skillId: number, skill: StudentSkillRequest): Observable<StudentSkill> {
    const skills = this.mockSkillsData[studentUserId] || [];
    const index = skills.findIndex(s => s.id === skillId);
    if (index !== -1) {
      skills[index] = { ...skills[index], ...skill };
      return of(skills[index]);
    }
    return of({} as StudentSkill);
  }

  deleteSkill(studentUserId: number, skillId: number): Observable<void> {
    if (this.mockSkillsData[studentUserId]) {
      this.mockSkillsData[studentUserId] = this.mockSkillsData[studentUserId].filter(s => s.id !== skillId);
    }
    return of(undefined);
  }

  getProjects(studentUserId: number): Observable<StudentProject[]> {
    return of(this.mockProjectsData[studentUserId] || this.getDefaultProjects(studentUserId));
  }

  addProject(studentUserId: number, project: StudentProjectRequest): Observable<StudentProject> {
    const newProject: StudentProject = {
      id: Math.floor(Math.random() * 10000),
      studentUserId,
      ...project,
      createdAt: new Date().toISOString()
    };
    if (!this.mockProjectsData[studentUserId]) {
      this.mockProjectsData[studentUserId] = [];
    }
    this.mockProjectsData[studentUserId].push(newProject);
    return of(newProject);
  }

  updateProject(studentUserId: number, projectId: number, project: StudentProjectRequest): Observable<StudentProject> {
    const projects = this.mockProjectsData[studentUserId] || [];
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...project };
      return of(projects[index]);
    }
    return of({} as StudentProject);
  }

  deleteProject(studentUserId: number, projectId: number): Observable<void> {
    if (this.mockProjectsData[studentUserId]) {
      this.mockProjectsData[studentUserId] = this.mockProjectsData[studentUserId].filter(p => p.id !== projectId);
    }
    return of(undefined);
  }

  private getDefaultSkills(studentUserId: number): StudentSkill[] {
    return [
      { id: studentUserId * 1000, studentUserId, name: 'JavaScript', category: 'TECHNICAL', proficiency: 'INTERMEDIATE', yearsOfExperience: 1.5, addedAt: new Date().toISOString() },
      { id: studentUserId * 1000 + 1, studentUserId, name: 'Problem Solving', category: 'SOFT', proficiency: 'INTERMEDIATE', yearsOfExperience: 1, addedAt: new Date().toISOString() }
    ];
  }

  private getDefaultProjects(studentUserId: number): StudentProject[] {
    return [{
      id: studentUserId * 1000, studentUserId,
      titre: `Demo Project ${studentUserId}`,
      description: 'Sample student project for demonstration',
      technologies: ['JavaScript', 'React', 'Node.js'],
      startDate: '2024-01-01',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString()
    }];
  }
}
