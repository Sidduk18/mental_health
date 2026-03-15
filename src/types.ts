import { Timestamp } from 'firebase/firestore';

export type UserRole = 'teen' | 'adult';
export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  uid: string;
  email: string;
  phoneNumber?: string;
  displayName: string | null;
  role: UserRole;
  anonymous: boolean;
  createdAt: Timestamp;
  streak: number;
  lastActive: Timestamp;
  preferences: {
    theme: ThemeMode;
    notifications: boolean;
    parentDashboardEnabled?: boolean;
  };
}

export interface MoodLog {
  id?: string;
  userId: string;
  mood: number; // 1-5
  note?: string;
  timestamp: Timestamp;
}

export interface JournalEntry {
  id?: string;
  userId: string;
  content: string;
  type: 'text' | 'voice';
  timestamp: Timestamp;
}

export interface Appointment {
  id?: string;
  userId: string;
  therapistId: string;
  dateTime: Timestamp;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetLink?: string;
  totalCost: number;
}

export interface Goal {
  id?: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
  targetDate?: Timestamp;
}

export interface Assessment {
  id?: string;
  userId: string;
  type: 'PHQ-9' | 'GAD-7';
  score: number;
  timestamp: Timestamp;
  sharedWithTherapist?: boolean;
}

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rate: number;
  availability: {
    [date: string]: string[]; // date string -> array of times
  };
}

export interface PeerPost {
  id?: string;
  userId: string;
  userName: string;
  content: string;
  anonymous: boolean;
  timestamp: Timestamp;
  likes: string[]; // array of uids
  comments: {
    userId: string;
    userName: string;
    content: string;
    timestamp: Timestamp;
  }[];
}

export interface Message {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Timestamp;
}
