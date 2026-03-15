
export type UserRole = 'teen' | 'adult';
export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  uid: string;
  email: string;
  phoneNumber?: string;
  displayName: string | null;
  role: UserRole;
  anonymous: boolean;
  createdAt: Date;
  streak: number;
  lastActive: Date;
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
  timestamp: Date;
}

export interface JournalEntry {
  id?: string;
  userId: string;
  title: string;
  content: string;
  timestamp: Date;
  mood?: number;
}

export interface Appointment {
  id?: string;
  userId: string;
  therapistId: string;
  dateTime: Date;
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  meetLink?: string;
  totalCost: number;
  cancelReason?: string;
  refundAmount?: number;
}

export interface Message {
  id?: string;
  appointmentId: string;
  userId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface PeerGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  members: string[]; // user IDs
  icon: string;
}
