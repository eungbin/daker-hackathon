import { useState } from 'react';
import hackathonsData from '../data/hackathons.json';
import hackathonDetailsData from '../data/hackathon_details.json';
import teamsData from '../data/teams.json';
import leaderboardsData from '../data/leaderboards.json';
import type { Hackathon, HackathonDetail, Team, Leaderboard, LeaderboardEntry, Submission, Invitation } from '../types';

const KEYS = {
  hackathons: 'hacklog_hackathons',
  details: 'hacklog_details',
  teams: 'hacklog_teams',
  leaderboards: 'hacklog_leaderboards',
  submissions: 'hacklog_submissions',
  invitations: 'hacklog_invitations',
};

function getOrSeed<T>(key: string, seedData: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
  } catch {
    // parse error — fall through to seed
  }
  localStorage.setItem(key, JSON.stringify(seedData));
  return seedData;
}

export function useStore() {
  const [hackathons] = useState<Hackathon[]>(() =>
    getOrSeed(KEYS.hackathons, hackathonsData as Hackathon[])
  );
  const [details] = useState<Record<string, HackathonDetail>>(() =>
    getOrSeed(KEYS.details, hackathonDetailsData as Record<string, HackathonDetail>)
  );
  const [teams, setTeams] = useState<Team[]>(() =>
    getOrSeed(KEYS.teams, teamsData as Team[])
  );
  const [leaderboards, setLeaderboards] = useState<Record<string, Leaderboard>>(() =>
    getOrSeed(KEYS.leaderboards, leaderboardsData as Record<string, Leaderboard>)
  );
  const [submissions, setSubmissions] = useState<Submission[]>(() =>
    getOrSeed(KEYS.submissions, [])
  );
  const [invitations, setInvitations] = useState<Invitation[]>(() =>
    getOrSeed(KEYS.invitations, [])
  );

  const addTeam = (team: Team) => {
    setTeams(prev => {
      const updated = [...prev, team];
      localStorage.setItem(KEYS.teams, JSON.stringify(updated));
      return updated;
    });
  };

  const updateTeam = (teamCode: string, updates: Partial<Team>) => {
    setTeams(prev => {
      const updated = prev.map(t => t.teamCode === teamCode ? { ...t, ...updates } : t);
      localStorage.setItem(KEYS.teams, JSON.stringify(updated));
      return updated;
    });
  };

  const addSubmission = (submission: Submission) => {
    // Save submission
    setSubmissions(prev => {
      const updated = [...prev, submission];
      localStorage.setItem(KEYS.submissions, JSON.stringify(updated));
      return updated;
    });

    // Reflect in leaderboard: add team entry if not present (score=0 pending evaluation)
    setLeaderboards(prev => {
      const lb = prev[submission.hackathonSlug];
      if (!lb) return prev;

      const alreadyIn = lb.entries.some(e => e.teamName === submission.teamName);
      if (alreadyIn) {
        // update submittedAt
        const updatedEntries = lb.entries.map(e =>
          e.teamName === submission.teamName ? { ...e, submittedAt: submission.submittedAt } : e
        );
        const updatedLb: Leaderboard = { ...lb, entries: updatedEntries, updatedAt: submission.submittedAt };
        const result = { ...prev, [submission.hackathonSlug]: updatedLb };
        localStorage.setItem(KEYS.leaderboards, JSON.stringify(result));
        return result;
      }

      // New entry: append at end with score 0, rank after existing entries
      const newEntry: LeaderboardEntry = {
        rank: lb.entries.length + 1,
        teamName: submission.teamName,
        score: 0,
        submittedAt: submission.submittedAt,
      };
      const updatedLb: Leaderboard = {
        ...lb,
        entries: [...lb.entries, newEntry],
        updatedAt: submission.submittedAt,
      };
      const result = { ...prev, [submission.hackathonSlug]: updatedLb };
      localStorage.setItem(KEYS.leaderboards, JSON.stringify(result));
      return result;
    });
  };

  const addInvitation = (invitation: Invitation) => {
    setInvitations(prev => {
      const updated = [...prev, invitation];
      localStorage.setItem(KEYS.invitations, JSON.stringify(updated));
      return updated;
    });
  };

  const updateInvitation = (id: string, status: 'accepted' | 'rejected') => {
    setInvitations(prev => {
      const updated = prev.map(inv => inv.id === id ? { ...inv, status } : inv);
      localStorage.setItem(KEYS.invitations, JSON.stringify(updated));

      // If accepted, increment memberCount of the team
      if (status === 'accepted') {
        const invitation = prev.find(inv => inv.id === id);
        if (invitation) {
          setTeams(prevTeams => {
            const updatedTeams = prevTeams.map(t =>
              t.teamCode === invitation.teamCode
                ? { ...t, memberCount: t.memberCount + 1 }
                : t
            );
            localStorage.setItem(KEYS.teams, JSON.stringify(updatedTeams));
            return updatedTeams;
          });
        }
      }
      return updated;
    });
  };

  return {
    hackathons, details, teams, leaderboards, submissions, invitations,
    addTeam, updateTeam, addSubmission, addInvitation, updateInvitation,
  };
}
