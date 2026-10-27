/**
 * LimitGuard API Adapters
 * Converts raw backend responses into standardized UI data shapes.
 * If fields are missing or unexpected, defaults safely to 0 / [] and never crashes.
 * When import.meta.env.VITE_USE_MOCK === 'true', returns static sample data for previewing without backend.
 */

const isMockMode = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true';

// Helpers
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return String(dateStr);
  }
}

/**
 * 1. Overview Adapter
 * UI Shape: { totalPrompts, sensitiveDetections, promptsSanitized, promptsBlocked, tokensSaved, costSaved }
 */
export function adaptOverview(raw) {
  if (isMockMode && (!raw || raw.mock)) {
    return {
      totalPrompts: 14280,
      sensitiveDetections: 624,
      promptsSanitized: 1350,
      promptsBlocked: 82,
      tokensSaved: 384500,
      costSaved: 76.90,
    };
  }

  const d = raw?.data ?? raw ?? {};

  return {
    totalPrompts: Number(d.totalPromptsAnalyzed ?? d.totalPrompts ?? 0),
    sensitiveDetections: Number(d.sensitiveDataDetections ?? d.sensitiveDetections ?? 0),
    promptsSanitized: Number(d.promptsSanitized ?? 0),
    promptsBlocked: Number(d.promptsBlocked ?? 0),
    tokensSaved: Number(d.totalTokensSaved ?? d.tokensSaved ?? 0),
    costSaved: Number(d.estimatedCostSavedINR ?? d.estimatedCostSaved ?? d.costSaved ?? 0),
  };
}

/**
 * 2. Token Savings Adapter
 * UI Shape: [{ label, value }]
 */
export function adaptTokenSavings(raw) {
  if (isMockMode && (!raw || raw.mock)) {
    return [
      { label: 'Oct 21', value: 38200 },
      { label: 'Oct 22', value: 45600 },
      { label: 'Oct 23', value: 52100 },
      { label: 'Oct 24', value: 49800 },
      { label: 'Oct 25', value: 61200 },
      { label: 'Oct 26', value: 68400 },
      { label: 'Oct 27', value: 69200 },
    ];
  }

  const list = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);

  return list.map((item, idx) => ({
    label: item?.label || (item?.date ? formatShortDate(item.date) : `Day ${idx + 1}`),
    value: Number(item?.value ?? item?.tokensSaved ?? 0),
  }));
}

/**
 * 3. Activity Adapter
 * UI Shape: [{ label, analyzed, sanitized, blocked }]
 */
export function adaptActivity(raw) {
  if (isMockMode && (!raw || raw.mock)) {
    return [
      { label: 'Oct 21', analyzed: 1840, sanitized: 145, blocked: 12 },
      { label: 'Oct 22', analyzed: 2120, sanitized: 198, blocked: 15 },
      { label: 'Oct 23', analyzed: 2450, sanitized: 210, blocked: 9 },
      { label: 'Oct 24', analyzed: 2200, sanitized: 180, blocked: 14 },
      { label: 'Oct 25', analyzed: 2780, sanitized: 240, blocked: 18 },
      { label: 'Oct 26', analyzed: 2950, sanitized: 265, blocked: 22 },
      { label: 'Oct 27', analyzed: 3100, sanitized: 290, blocked: 16 },
    ];
  }

  const list = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);

  return list.map((item, idx) => ({
    label: item?.label || (item?.date ? formatShortDate(item.date) : `Day ${idx + 1}`),
    analyzed: Number(item?.analyzed ?? item?.promptsAnalyzed ?? 0),
    sanitized: Number(item?.sanitized ?? 0),
    blocked: Number(item?.blocked ?? 0),
  }));
}

/**
 * 4. Risk Distribution Adapter
 * UI Shape: [{ name, value }]
 */
export function adaptRiskDistribution(raw) {
  if (isMockMode && (!raw || raw.mock)) {
    return [
      { name: 'Low', value: 480 },
      { name: 'Medium', value: 185 },
      { name: 'High', value: 62 },
      { name: 'Critical', value: 14 },
    ];
  }

  const list = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);

  return list.map((item) => {
    let name = item?.name || item?.riskLevel || 'Unknown';
    // Format capitalize
    if (typeof name === 'string' && name.length > 0) {
      name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    return {
      name,
      value: Number(item?.value ?? item?.count ?? 0),
    };
  });
}

/**
 * 5. Recent Activity Adapter
 * UI Shape: [{ id, time, summary, action }]
 * where action is "sanitized" | "blocked" | "allowed"
 */
export function adaptRecentActivity(raw) {
  if (isMockMode && (!raw || raw.mock)) {
    return [
      {
        id: 'rec-1',
        time: new Date(Date.now() - 2 * 60000).toISOString(),
        summary: 'Prompt sanitized: PII (email, phone number) stripped before LLM dispatch',
        action: 'sanitized',
      },
      {
        id: 'rec-2',
        time: new Date(Date.now() - 15 * 60000).toISOString(),
        summary: 'Prompt allowed: Safe query passed firewall verification',
        action: 'allowed',
      },
      {
        id: 'rec-3',
        time: new Date(Date.now() - 32 * 60000).toISOString(),
        summary: 'Blocked request: High-entropy secret API key detected in user context',
        action: 'blocked',
      },
      {
        id: 'rec-4',
        time: new Date(Date.now() - 55 * 60000).toISOString(),
        summary: 'Prompt sanitized: Internal server IP and hostname masked',
        action: 'sanitized',
      },
      {
        id: 'rec-5',
        time: new Date(Date.now() - 120 * 60000).toISOString(),
        summary: 'Prompt allowed: Code snippet verified clean of proprietary credentials',
        action: 'allowed',
      },
      {
        id: 'rec-6',
        time: new Date(Date.now() - 180 * 60000).toISOString(),
        summary: 'Blocked request: Injection pattern attempting system prompt extraction',
        action: 'blocked',
      },
      {
        id: 'rec-7',
        time: new Date(Date.now() - 240 * 60000).toISOString(),
        summary: 'Prompt sanitized: Bearer auth token replaced with privacy-safe placeholder',
        action: 'sanitized',
      },
      {
        id: 'rec-8',
        time: new Date(Date.now() - 360 * 60000).toISOString(),
        summary: 'Prompt allowed: Standard conversational query approved',
        action: 'allowed',
      },
    ];
  }

  const list = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);

  return list.map((item, idx) => {
    let rawAction = String(item?.action || item?.status || 'allowed').toLowerCase();
    let action = 'allowed';
    if (rawAction.includes('block')) {
      action = 'blocked';
    } else if (rawAction.includes('sanit')) {
      action = 'sanitized';
    } else {
      action = 'allowed';
    }

    const id = String(item?.id || item?._id || `recent-${idx}-${Date.now()}`);
    const time = item?.time || item?.createdAt || new Date().toISOString();

    let summary = item?.summary;
    if (!summary) {
      const type = item?.eventType ? `${item.eventType}: ` : '';
      const detections = item?.sensitiveDataDetections
        ? `${item.sensitiveDataDetections} sensitive detection${item.sensitiveDataDetections > 1 ? 's' : ''}`
        : '';
      const tokens = item?.tokensSaved ? `${item.tokensSaved} tokens saved` : '';
      const details = [detections, tokens].filter(Boolean).join(', ');
      summary = `${type}${details || (action === 'sanitized' ? 'Sanitized sensitive context' : action === 'blocked' ? 'Blocked risky prompt' : 'Clean prompt analyzed')}`;
    }

    return {
      id,
      time,
      summary,
      action,
    };
  });
}

/**
 * 6. Token Adapter
 * UI Shape: { value, createdAt?, expiresAt?, connected }
 */
export function adaptToken(raw) {
  if (isMockMode && (!raw || raw.mock)) {
    return {
      value: 'lg_live_4b91f0c598d1e83049b71a25ef109a72',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      connected: true,
    };
  }

  const d = raw?.data ?? raw ?? {};

  return {
    value: d.token || d.value || null,
    createdAt: d.createdAt || d.lastUpdated || null,
    expiresAt: d.expiresAt || null,
    connected: Boolean(d.connected ?? (d.token || d.value)),
  };
}
