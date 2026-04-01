/**
 * Compliance Alert Generation and Reporting
 */

interface Credential {
  id: string; candidateId: string; candidateName?: string; type: string;
  name: string; state?: string; issueDate: string; expirationDate?: string;
  status: string;
}

interface ComplianceAlert {
  candidateId: string; candidateName: string; credentialName: string;
  credentialType: string; severity: 'critical' | 'warning' | 'info';
  message: string; action: string; dueDate?: string;
}

export function generateAlerts(credentials: (Credential & { candidateName?: string })[], agencyType: string): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];
  const today = new Date();

  for (const cred of credentials) {
    const name = cred.candidateName || `Candidate ${cred.candidateId}`;

    if (cred.status === 'expired' || (cred.expirationDate && new Date(cred.expirationDate) < today)) {
      alerts.push({
        candidateId: cred.candidateId, candidateName: name,
        credentialName: cred.name, credentialType: cred.type,
        severity: 'critical',
        message: `EXPIRED: ${cred.name} expired on ${cred.expirationDate || 'unknown date'}`,
        action: `Contact ${name} immediately to renew ${cred.name}. Cannot be placed until renewed.`,
        dueDate: cred.expirationDate
      });
    } else if (cred.expirationDate) {
      const expDate = new Date(cred.expirationDate);
      const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 30) {
        alerts.push({
          candidateId: cred.candidateId, candidateName: name,
          credentialName: cred.name, credentialType: cred.type,
          severity: 'warning',
          message: `EXPIRING IN ${daysUntil} DAYS: ${cred.name} expires ${cred.expirationDate}`,
          action: `Send renewal reminder to ${name}. Schedule renewal before expiration.`,
          dueDate: cred.expirationDate
        });
      } else if (daysUntil <= 90) {
        alerts.push({
          candidateId: cred.candidateId, candidateName: name,
          credentialName: cred.name, credentialType: cred.type,
          severity: 'info',
          message: `Expiring in ${daysUntil} days: ${cred.name} expires ${cred.expirationDate}`,
          action: `Add to renewal tracking list. Send reminder at 30-day mark.`,
          dueDate: cred.expirationDate
        });
      }
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export function formatComplianceReport(alerts: ComplianceAlert[], credentials: any[]): string {
  const critical = alerts.filter(a => a.severity === 'critical');
  const warnings = alerts.filter(a => a.severity === 'warning');
  const info = alerts.filter(a => a.severity === 'info');
  const okCount = credentials.length - alerts.length;

  const lines = [
    '# Compliance Audit Report',
    `**Date:** ${new Date().toLocaleDateString()}`,
    `**Credentials Audited:** ${credentials.length}`,
    '',
    '## Summary',
    `- OK: ${okCount}`,
    `- CRITICAL (expired): ${critical.length}`,
    `- WARNING (expiring 30 days): ${warnings.length}`,
    `- INFO (expiring 90 days): ${info.length}`,
    '',
  ];

  if (critical.length > 0) {
    lines.push('## CRITICAL — Immediate Action Required', '');
    critical.forEach(a => {
      lines.push(`**${a.candidateName}** — ${a.credentialName}`);
      lines.push(`  ${a.message}`);
      lines.push(`  Action: ${a.action}`);
      lines.push('');
    });
  }

  if (warnings.length > 0) {
    lines.push('## WARNINGS — Action Within 30 Days', '');
    warnings.forEach(a => {
      lines.push(`**${a.candidateName}** — ${a.credentialName}`);
      lines.push(`  ${a.message}`);
      lines.push(`  Action: ${a.action}`);
      lines.push('');
    });
  }

  if (info.length > 0) {
    lines.push('## INFO — Monitor', '');
    info.forEach(a => {
      lines.push(`${a.candidateName} — ${a.credentialName}: ${a.message}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
