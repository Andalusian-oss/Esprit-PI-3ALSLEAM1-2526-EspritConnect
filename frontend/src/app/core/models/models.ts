export interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: 'STUDENT' | 'ADMIN' | 'MENTOR';
  promo?: string;
  avatarUrl?: string;
  createdAt: string;
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
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  texte: string;
  createdAt: string;
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
}

export interface Club {
  id: number;
  nom: string;
  description?: string;
  logoUrl?: string;
  creatorUserId: number;
  memberCount: number;
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

export interface Conversation {
  id: number;
  participant1UserId: number;
  participant2UserId: number;
  messageCount: number;
  unreadCount: number;
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

export interface Residence {
  id: number;
  nom: string;
  adresse: string;
  capaciteTotale: number;
  chambreCount: number;
}

export interface Chambre {
  id: number;
  residenceId: number;
  residenceNom: string;
  numero: string;
  type: 'SIMPLE' | 'DOUBLE' | 'STUDIO';
  statut: 'DISPONIBLE' | 'OCCUPEE' | 'EN_MAINTENANCE';
}
