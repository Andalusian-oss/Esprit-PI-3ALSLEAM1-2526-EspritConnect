export type UserRole = 'STUDENT' | 'ADMIN' | 'MENTOR' | 'ENSEIGNANT' | 'ALUMNI' | 'EMPLOYE' | 'COMPANY';

export interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: UserRole;
  promo?: string;
  avatarUrl?: string;
  createdAt: string;
  espritId?: string;
  cin?: string;
  lastLoginAt?: string;
  online?: boolean;
  approved?: boolean;
  specialite?: string;
  parcours?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface Post {
  id: number;
  contenu: string;
  userId: number;
  originalPostId?: number | null;
  originalAuthorName?: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  photoUrls: string[];
  userName: string;
  likedByMe?: boolean;
  reaction?: 'LIKE' | 'WOW' | 'APPRECIATE' | 'GG' | null;
  reactionCount?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  reactions?: {
    likes: number;
    wows: number;
    appreciates: number;
    ggs: number;
    userReaction: 'LIKE' | 'WOW' | 'APPRECIATE' | 'GG' | null;
  };
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  texte: string;
  createdAt: string;
  userName: string;
}

export interface Event {
  id: number;
  titre: string;
  description?: string;
  date: string;
  lieu?: string;
  clubId?: number;
  clubNom?: string;
  creatorUserId: number;
  registrationCount: number;
  attendeeLimit?: number | null;
  remainingSpots?: number | null;
  categorie?: 'SPORTIF' | 'ACADEMIQUE' | 'CULTUREL' | 'TECHNOLOGIQUE' | 'AUTRE';
}

export interface EventRequest {
  titre: string;
  description?: string;
  date: string;
  lieu?: string;
  clubId?: number | null;
  attendeeLimit?: number | null;
  categorie?: 'SPORTIF' | 'ACADEMIQUE' | 'CULTUREL' | 'TECHNOLOGIQUE' | 'AUTRE';
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  inviteCode: string;
  qrPayload: string;
  createdAt: string;
}

export interface Club {
  id: number;
  nom: string;
  description?: string;
  logoUrl?: string;
  creatorUserId: number;
  memberCount: number;
  pendingCount?: number;
  membershipStatus?: string; // NONE | PENDING | APPROVED (for the current user)
}

export interface ClubRequest {
  nom: string;
  description?: string;
  logoUrl?: string;
}

export interface ClubMember {
  id: number;
  clubId: number;
  userId: number;
  role: string;
  status?: string;
}

export interface Job {
  id: number;
  titre: string;
  entreprise: string;
  description?: string;
  type: 'CDI' | 'CDD' | 'STAGE';
  lieu?: string;
  posterUserId: number;
  applicationCount: number;
}

export interface JobRequest {
  titre: string;
  entreprise: string;
  description?: string;
  type: 'CDI' | 'CDD' | 'STAGE';
  lieu?: string;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitre: string;
  applicantUserId: number;
  statut: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  cvUrl?: string;
  matchScore?: number;
}

export interface EspritReference {
  id?: number;
  espritId: string;
  cin: string;
  expectedRole: UserRole;
  nom?: string;
  prenom?: string;
}

export interface Mentoring {
  id: number;
  mentorUserId: number;
  mentoreUserId: number;
  domaine: string;
  statut: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  sessionCount: number;
}

export interface MentoringSession {
  id: number;
  mentoringId: number;
  date: string;
  dureeMinutes: number;
  statut: 'PLANNED' | 'LIVE' | 'DONE' | 'CANCELLED';
}

export interface Conversation {
  id: number;
  participant1UserId: number;
  participant1Name?: string;
  participant2UserId: number;
  participant2Name?: string;
  messageCount: number;
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderUserId: number;
  contenu: string;
  lu: boolean;
  edited?: boolean;
  editedAt?: string;
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  avatarUrl?: string;
  creatorUserId: number;
  createdAt: string;
  memberCount: number;
  members: GroupMember[];
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface GroupMember {
  id: number;
  userId: number;
  userName: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface GroupMessage {
  id: number;
  groupId: number;
  senderUserId: number;
  senderName: string;
  contenu: string;
  edited?: boolean;
  editedAt?: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  recipientUserId: number;
  type: string;
  message: string;
  lu: boolean;
  createdAt: string;
}

// ── Resources ──────────────────────────────────────────────────────────────
export type ResourceType = 'ARTICLE' | 'PDF' | 'VIDEO' | 'LINK' | 'TUTORIAL';
export type ResourceCategory = 'ACADEMIC' | 'CAREER' | 'TECHNICAL' | 'SOCIAL' | 'EVENT';

export interface Resource {
  id: number;
  titre: string;
  description?: string;
  type: ResourceType;
  categorie: ResourceCategory;
  fileUrl?: string;
  lien?: string;
  tags?: string;
  uploadedByUserId: number;
  likeCount: number;
  viewCount: number;
  downloadCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface ResourceRequest {
  titre: string;
  description?: string;
  type: ResourceType;
  categorie: ResourceCategory;
  fileUrl?: string;
  lien?: string;
  tags?: string;
}

// ── PFE Books ─────────────────────────────────────────────────────────────
export interface PfeBook {
  id: number;
  titre: string;
  description: string;
  auteur: string;
  annee: number;
  filiere: string;
  departement: string;
  documentUrl: string;
  previewUrl?: string;
  fileType: 'PDF' | 'DOCX' | 'DOC' | 'PPTX' | 'TXT';
  fileSize: number;
  downloadCount: number;
  viewCount: number;
  uploadedAt: string;
  keywords?: string[];
  likeCount: number;
  likedByMe: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  uploaderId: number;
  uploaderName: string;
  uploaderRole: UserRole;
}

export interface PfeBookRequest {
  titre: string;
  description: string;
  auteur: string;
  annee: number;
  filiere: string;
  departement: string;
  documentUrl: string;
  previewUrl?: string;
  fileType: 'PDF' | 'DOCX' | 'DOC' | 'PPTX' | 'TXT';
  keywords?: string[];
}

// ── Chatbot ────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  engine: string;
}

// ── CV Analysis ────────────────────────────────────────────────────────────
export interface CvAnalysis {
  name?: string;
  contact: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    devops: string[];
    tools: string[];
    concepts: string[];
    soft_skills: string[];
  };
  all_skills: string[];
  education: string[];
  experience: {
    years_estimated?: number;
    internships: string[];
  };
  languages: Array<{ language: string; level: string }>;
  timeline?: Array<{ start: string; end: string; context: string }>;
  score: number;
  ats_score?: number;
  job_match_score?: number;
  word_count: number;
  summary: string;
  tips?: string[];
  red_flags?: string[];
}

// ── Student Skills & Projects ─────────────────────────────────────────────
export interface StudentSkill {
  id: number;
  studentUserId: number;
  name: string;
  category: 'TECHNICAL' | 'SOFT' | 'LANGUAGE' | 'TOOL' | 'FRAMEWORK';
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  addedAt: string;
  yearsOfExperience?: number;
}

export interface StudentProject {
  id: number;
  studentUserId: number;
  titre: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  startDate: string;
  endDate?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  createdAt: string;
}

export interface StudentSkillRequest {
  name: string;
  category: 'TECHNICAL' | 'SOFT' | 'LANGUAGE' | 'TOOL' | 'FRAMEWORK';
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience?: number;
}

export interface StudentProjectRequest {
  titre: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  startDate: string;
  endDate?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
}
