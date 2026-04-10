const EXAM_MODE_KEY = "examMode";
const EXAM_HISTORY_KEY = "examHistory";
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

export interface LockInModeState {
  isActive: boolean;
  examId: string;
  courseCode: string;
  examName: string;
  startTime: number;
  totalDuration: number;
  pausedAt?: number;
  totalPausedTime: number;
  sessionId: string;
  lastActivity: number;
}

export interface LockInModeSession {
  sessionId: string;
  examId: string;
  courseCode: string;
  examName: string;
  startTime: number;
  endTime?: number;
  totalDuration: number;
  timeUsed: number;
  completed: boolean;
  expired: boolean;
  reason?: string;
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isValidSession(session: unknown): session is LockInModeState {
  if (!session || typeof session !== "object") return false;
  const s = session as Record<string, unknown>;
  return (
    typeof s.isActive === "boolean" &&
    typeof s.examId === "string" &&
    typeof s.startTime === "number" &&
    typeof s.totalDuration === "number" &&
    typeof s.sessionId === "string" &&
    typeof s.lastActivity === "number"
  );
}

export function useLockInMode() {
  function getCurrentSession(): LockInModeState | null {
    try {
      const stored = localStorage.getItem(EXAM_MODE_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored);
      if (!isValidSession(session)) {
        localStorage.removeItem(EXAM_MODE_KEY);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(EXAM_MODE_KEY);
      return null;
    }
  }

  function saveSession(session: LockInModeState) {
    localStorage.setItem(EXAM_MODE_KEY, JSON.stringify(session));
  }

  function getTimeRemaining(): number {
    const session = getCurrentSession();
    if (!session) return 0;
    const now = Date.now();
    let elapsed = now - session.startTime - session.totalPausedTime;
    if (session.pausedAt) elapsed -= now - session.pausedAt;
    return Math.max(0, session.totalDuration - elapsed);
  }

  function isSessionStale(session: LockInModeState): boolean {
    return Date.now() - session.lastActivity > SESSION_TIMEOUT;
  }

  function addToHistory(data: LockInModeSession) {
    try {
      const stored = localStorage.getItem(EXAM_HISTORY_KEY);
      const history: LockInModeSession[] = stored ? JSON.parse(stored) : [];
      history.push(data);
      localStorage.setItem(
        EXAM_HISTORY_KEY,
        JSON.stringify(history.slice(-50)),
      );
    } catch {}
  }

  function startSession(
    examId: string,
    courseCode: string,
    examName: string,
    durationMinutes: number,
  ): LockInModeState {
    const existing = getCurrentSession();
    if (existing) forceEndSession(existing, "replaced");

    const session: LockInModeState = {
      isActive: true,
      examId,
      courseCode,
      examName,
      startTime: Date.now(),
      totalDuration: durationMinutes * 60 * 1000,
      totalPausedTime: 0,
      sessionId: generateId(),
      lastActivity: Date.now(),
    };
    saveSession(session);
    return session;
  }

  function pauseSession() {
    const session = getCurrentSession();
    if (session && !session.pausedAt) {
      session.pausedAt = Date.now();
      session.lastActivity = Date.now();
      saveSession(session);
    }
  }

  function resumeSession() {
    const session = getCurrentSession();
    if (session && session.pausedAt) {
      session.totalPausedTime += Date.now() - session.pausedAt;
      delete session.pausedAt;
      session.lastActivity = Date.now();
      saveSession(session);
    }
  }

  function updateActivity() {
    const session = getCurrentSession();
    if (session) {
      session.lastActivity = Date.now();
      saveSession(session);
    }
  }

  function completeSession() {
    const session = getCurrentSession();
    if (!session) return;
    addToHistory({
      sessionId: session.sessionId,
      examId: session.examId,
      courseCode: session.courseCode,
      examName: session.examName,
      startTime: session.startTime,
      endTime: Date.now(),
      totalDuration: session.totalDuration,
      timeUsed: session.totalDuration - getTimeRemaining(),
      completed: true,
      expired: false,
      reason: "completed",
    });
    localStorage.removeItem(EXAM_MODE_KEY);
  }

  function handleExpiredSession(session: LockInModeState) {
    addToHistory({
      sessionId: session.sessionId,
      examId: session.examId,
      courseCode: session.courseCode,
      examName: session.examName,
      startTime: session.startTime,
      endTime: Date.now(),
      totalDuration: session.totalDuration,
      timeUsed: session.totalDuration,
      completed: false,
      expired: true,
      reason: "expired",
    });
    localStorage.removeItem(EXAM_MODE_KEY);
  }

  function forceEndSession(session: LockInModeState, reason: string) {
    addToHistory({
      sessionId: session.sessionId,
      examId: session.examId,
      courseCode: session.courseCode,
      examName: session.examName,
      startTime: session.startTime,
      endTime: Date.now(),
      totalDuration: session.totalDuration,
      timeUsed: session.totalDuration - getTimeRemaining(),
      completed: false,
      expired: false,
      reason,
    });
    localStorage.removeItem(EXAM_MODE_KEY);
  }

  function cleanupHistory() {
    try {
      const stored = localStorage.getItem(EXAM_HISTORY_KEY);
      if (!stored) return;
      const history: LockInModeSession[] = JSON.parse(stored);
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(
        EXAM_HISTORY_KEY,
        JSON.stringify(history.filter((s) => s.startTime > thirtyDaysAgo)),
      );
    } catch {}
  }

  function isPaused(): boolean {
    return !!getCurrentSession()?.pausedAt;
  }

  function initializeExamMode(): LockInModeState | null {
    const session = getCurrentSession();
    if (!session) return null;
    if (isSessionStale(session)) {
      forceEndSession(session, "stale");
      return null;
    }
    if (getTimeRemaining() <= 0) {
      handleExpiredSession(session);
      return null;
    }
    return session;
  }

  return {
    getCurrentSession,
    getTimeRemaining,
    startSession,
    pauseSession,
    resumeSession,
    updateActivity,
    completeSession,
    handleExpiredSession,
    forceEndSession,
    cleanupHistory,
    isPaused,
    initializeExamMode,
  };
}
