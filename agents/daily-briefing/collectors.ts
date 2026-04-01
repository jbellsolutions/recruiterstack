/**
 * Data Collectors for Daily Briefing
 * Each function gathers data from ATS (or mock) for a specific briefing section
 */

interface BriefingItem {
  category: string;
  priority: 'urgent' | 'high' | 'normal';
  title: string;
  detail: string;
  action: string;
  dueDate?: string;
}

export async function getHotReqs(adapter: any): Promise<BriefingItem[]> {
  const jobOrders = await adapter.getJobOrders({ status: ['open'] });
  return jobOrders
    .filter((jo: any) => jo.priority === 'urgent' || jo.priority === 'high' || daysSince(jo.createdDate) > 7)
    .map((jo: any) => ({
      category: 'hot-req',
      priority: jo.priority === 'urgent' ? 'urgent' as const : 'high' as const,
      title: `${jo.title} at ${jo.clientName}`,
      detail: `Open ${daysSince(jo.createdDate)} days. ${jo.openings} position(s).`,
      action: daysSince(jo.createdDate) > 14 ? 'CRITICAL: No recent activity. Prioritize today.' : 'Continue sourcing.',
    }));
}

export async function getFollowUps(adapter: any): Promise<BriefingItem[]> {
  const candidates = await adapter.getCandidates({ status: ['active'] });
  return candidates
    .filter((c: any) => c.lastContactDate && daysSince(c.lastContactDate) > 3)
    .map((c: any) => ({
      category: 'follow-up',
      priority: daysSince(c.lastContactDate) > 7 ? 'high' as const : 'normal' as const,
      title: `${c.firstName} ${c.lastName}`,
      detail: `Last contact: ${c.lastContactDate} (${daysSince(c.lastContactDate)} days ago)`,
      action: daysSince(c.lastContactDate) > 10 ? 'Re-engage or archive.' : 'Send follow-up.',
    }));
}

export async function getCredentialAlerts(adapter: any): Promise<BriefingItem[]> {
  const credentials = await adapter.getCredentials();
  const today = new Date();
  return credentials
    .filter((cr: any) => cr.status === 'expired' || cr.status === 'expiring-soon')
    .map((cr: any) => ({
      category: 'credential',
      priority: cr.status === 'expired' ? 'urgent' as const : 'high' as const,
      title: `${cr.name} — Candidate ${cr.candidateId}`,
      detail: cr.status === 'expired' ? `EXPIRED on ${cr.expirationDate}` : `Expiring ${cr.expirationDate}`,
      action: cr.status === 'expired' ? 'Cannot place. Contact for renewal.' : 'Send renewal reminder.',
      dueDate: cr.expirationDate,
    }));
}

export async function getPlacementCheckIns(adapter: any): Promise<BriefingItem[]> {
  const placements = await adapter.getPlacements({ status: ['active'] });
  const milestones = [1, 7, 30, 60, 90];
  const items: BriefingItem[] = [];

  for (const p of placements) {
    const daysPlaced = daysSince(p.startDate);
    for (const m of milestones) {
      if (daysPlaced >= m - 1 && daysPlaced <= m + 1) {
        items.push({
          category: 'placement-checkin',
          priority: 'normal',
          title: `Day ${m} check-in: Candidate ${p.candidateId} at ${p.clientName}`,
          detail: `Placed ${p.startDate}. Day ${m} milestone.`,
          action: `Send Day ${m} check-in to candidate and client manager.`,
        });
      }
    }
  }
  return items;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}
