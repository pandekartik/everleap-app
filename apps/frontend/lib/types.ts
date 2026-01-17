export type Role = 'super-admin' | 'hr';

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  role?: Role[]; // If undefined, shown to all
}

export interface UserProfile {
  name: string;
  role: Role;
  designation: string;
  companyName: string;
  avatarUrl?: string; // fallback to initials if missing
}
