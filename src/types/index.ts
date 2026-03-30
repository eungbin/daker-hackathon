export type HackathonStatus = 'ongoing' | 'upcoming' | 'ended';

export interface Hackathon {
  slug: string;
  title: string;
  status: HackathonStatus;
  tags: string[];
  thumbnailUrl: string;
  period: {
    timezone: string;
    submissionDeadlineAt: string;
    endAt: string;
  };
  links: {
    detail: string;
    rules: string;
    faq: string;
  };
}

export interface TeamPolicy {
  allowSolo: boolean;
  maxTeamSize: number;
}

export interface ScoreBreakdownItem {
  key: string;
  label: string;
  weightPercent: number;
}

export interface EvalSection {
  metricName: string;
  description: string;
  scoreSource?: 'vote';
  scoreDisplay?: {
    label: string;
    breakdown: ScoreBreakdownItem[];
  };
  limits?: {
    maxRuntimeSec?: number;
    maxSubmissionsPerDay?: number;
  };
}

export interface SubmissionItem {
  key: string;
  title: string;
  format: string;
}

export interface HackathonDetail {
  slug: string;
  title: string;
  sections: {
    overview: {
      summary: string;
      teamPolicy: TeamPolicy;
    };
    info: {
      notice: string[];
      links: { rules: string; faq: string; };
    };
    eval: EvalSection;
    schedule: {
      timezone: string;
      milestones: { name: string; at: string }[];
    };
    prize: {
      items: { place: string; amountKRW: number }[];
    };
    teams: {
      campEnabled: boolean;
      listUrl: string;
    };
    submit: {
      allowedArtifactTypes: string[];
      submissionUrl: string;
      guide: string[];
      submissionItems?: SubmissionItem[];
    };
    leaderboard: {
      publicLeaderboardUrl: string;
      note: string;
    };
  };
}

export interface Team {
  teamCode: string;
  hackathonSlug: string;
  name: string;
  isOpen: boolean;
  memberCount: number;
  lookingFor: string[];
  intro: string;
  contact: { type: string; url: string; };
  createdAt: string;
  createdBy?: string;
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  score: number;
  submittedAt: string;
  scoreBreakdown?: { participant: number; judge: number };
  artifacts?: {
    webUrl?: string;
    pdfUrl?: string;
    planTitle?: string;
  };
}

export interface Leaderboard {
  hackathonSlug: string;
  updatedAt: string;
  entries: LeaderboardEntry[];
}

export interface Submission {
  id: string;
  hackathonSlug: string;
  teamName: string;
  submittedAt: string;
  type: string;
  content: string;
  notes?: string;
  submittedBy?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface Invitation {
  id: string;
  hackathonSlug: string;
  teamCode: string;
  teamName: string;
  invitedAt: string;
  status: InvitationStatus;
}
