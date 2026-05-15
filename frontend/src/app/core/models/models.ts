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
  createdAt: string;
  likeCount: number;
  commentCount: number;
  photoUrls: string[];
  userName: string;
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
  categorie?: 'SPORTIF' | 'ACADEMIQUE' | 'CULTUREL' | 'TECHNOLOGIQUE' | 'AUTRE';
}

export interface EventRequest {
  titre: string;
  description?: string;
  date: string;
  lieu?: string;
  clubId?: number | null;
  categorie?: 'SPORTIF' | 'ACADEMIQUE' | 'CULTUREL' | 'TECHNOLOGIQUE' | 'AUTRE';
}

export interface Club {
  id: number;
  nom: string;
  description?: string;
  logoUrl?: string;
  creatorUserId: number;
  memberCount: number;
}

export interface ClubRequest {
  nom: string;
  description?: string;
  logoUrl?: string;
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
  statut: 'PLANNED' | 'DONE' | 'CANCELLED';
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
