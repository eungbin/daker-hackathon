import { useState } from 'react';
import hackathonsData from '../data/hackathons.json';
import hackathonDetailsData from '../data/hackathon_details.json';
import teamsData from '../data/teams.json';
import leaderboardsData from '../data/leaderboards.json';
import type { Hackathon, HackathonDetail, Team, Leaderboard, LeaderboardEntry, Submission, Invitation, ChatMessage } from '../types';

const KEYS = {
  hackathons: 'hacklog_hackathons',
  details: 'hacklog_details',
  teams: 'hacklog_teams',
  leaderboards: 'hacklog_leaderboards',
  submissions: 'hacklog_submissions',
  invitations: 'hacklog_invitations',
  chats: 'hacklog_chats',
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
  const [hackathons, setHackathons] = useState<Hackathon[]>(() =>
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
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() =>
    getOrSeed(KEYS.chats, {})
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
      return updated;
    });

    if (status === 'accepted') {
      const invitation = invitations.find(inv => inv.id === id);
      if (invitation) {
        const userId = invitation.type === 'invite'
          ? invitation.invitedUserId
          : invitation.requestedBy;

        // 수락된 팀의 해커톤과 겹치는 다른 pending 요청/초대 자동 거절
        const acceptedTeamSlugs = new Set(
          teams.find(t => t.teamCode === invitation.teamCode)?.hackathonSlugs ?? [invitation.hackathonSlug]
        );
        setInvitations(prev => {
          const updated = prev.map(inv => {
            if (inv.id === id || inv.status !== 'pending') return inv;
            const invUserId = inv.type === 'invite' ? inv.invitedUserId : inv.requestedBy;
            if (invUserId !== userId) return inv;
            if (acceptedTeamSlugs.has(inv.hackathonSlug)) {
              return { ...inv, status: 'rejected' as const };
            }
            return inv;
          });
          localStorage.setItem(KEYS.invitations, JSON.stringify(updated));
          return updated;
        });

        setTeams(prev => {
          // 합류 대상 팀의 hackathonSlugs 확인 (invitation.hackathonSlug 포함)
          const targetTeam = prev.find(t => t.teamCode === invitation.teamCode);
          const targetSlugs = new Set([
            ...(targetTeam?.hackathonSlugs ?? []),
            ...(invitation.hackathonSlug ? [invitation.hackathonSlug] : []),
          ]);

          const updated = prev
            .map(t => {
              // 합류 대상 팀: 멤버 추가
              if (t.teamCode === invitation.teamCode) {
                const members = t.members ?? [];
                const newMembers = userId && !members.includes(userId)
                  ? [...members, userId]
                  : members;
                return { ...t, memberCount: newMembers.length, members: newMembers };
              }
              // B가 속한 다른 팀 중 겹치는 해커톤이 있으면 처리
              if (
                userId &&
                t.teamCode !== invitation.teamCode &&
                (t.createdBy === userId || t.members?.includes(userId)) &&
                (t.hackathonSlugs ?? []).some(s => targetSlugs.has(s))
              ) {
                const isSolo = (t.members?.length ?? t.memberCount) === 1;
                if (isSolo) {
                  // solo 팀: 겹치는 hackathonSlugs만 제거
                  const remaining = (t.hackathonSlugs ?? []).filter(s => !targetSlugs.has(s));
                  return { ...t, hackathonSlugs: remaining };
                } else {
                  // multi 팀: B만 제거, 팀은 유지
                  const newMembers = (t.members ?? []).filter(m => m !== userId);
                  const newCreatedBy = t.createdBy === userId ? newMembers[0] : t.createdBy;
                  return { ...t, memberCount: newMembers.length, members: newMembers, createdBy: newCreatedBy };
                }
              }
              return t;
            })
            // hackathonSlugs가 비어있는 solo 팀 삭제
            .filter(t => {
              if (
                userId &&
                (t.createdBy === userId || t.members?.includes(userId)) &&
                (t.members?.length ?? t.memberCount) === 1 &&
                t.teamCode !== invitation.teamCode &&
                (t.hackathonSlugs ?? []).length === 0
              ) return false;
              return true;
            });

          localStorage.setItem(KEYS.teams, JSON.stringify(updated));
          return updated;
        });
      }
    }
  };

  const updateHackathonStatus = (slug: string, status: Hackathon['status']) => {
    setHackathons(prev => {
      const updated = prev.map(h => h.slug === slug ? { ...h, status } : h);
      localStorage.setItem(KEYS.hackathons, JSON.stringify(updated));
      return updated;
    });
  };

  const addChatMessage = (message: ChatMessage) => {
    setChats(prev => {
      const slug = message.hackathonSlug;
      const updated = { ...prev, [slug]: [...(prev[slug] ?? []), message] };
      localStorage.setItem(KEYS.chats, JSON.stringify(updated));
      return updated;
    });
  };

  return {
    hackathons, details, teams, leaderboards, submissions, invitations, chats,
    addTeam, updateTeam, addSubmission, addInvitation, updateInvitation, addChatMessage, updateHackathonStatus,
  };
}
