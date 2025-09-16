import Dexie, { Table } from 'dexie';

export interface OfflineAttendance {
  id?: number;
  memberId: string;
  memberName: string;
  sessionId: string;
  sessionTitle: string;
  checkInTime: string;
  timestamp: number;
  synced: number; // 0 = false, 1 = true
}

export interface CachedMember {
  id: string;
  firstName: string;
  lastName: string;
  membershipId: string;
  cellName?: string;
  status: string;
  lastSync: number;
}

export class AttendanceDB extends Dexie {
  offlineAttendance!: Table<OfflineAttendance>;
  cachedMembers!: Table<CachedMember>;

  constructor() {
    super('AttendanceDB');
    this.version(1).stores({
      offlineAttendance: '++id, memberId, timestamp, synced',
      cachedMembers: 'id, membershipId, lastSync'
    });
  }
}

export const db = new AttendanceDB();

// Offline attendance functions
export const saveOfflineAttendance = async (attendance: Omit<OfflineAttendance, 'id' | 'timestamp' | 'synced'>) => {
  return db.offlineAttendance.add({
    ...attendance,
    timestamp: Date.now(),
    synced: 0
  });
};

export const getUnsyncedAttendance = async (): Promise<OfflineAttendance[]> => {
  return db.offlineAttendance.where('synced').equals(0).toArray();
};

export const markAttendanceSynced = async (id: number) => {
  return db.offlineAttendance.update(id, { synced: 1 });
};

export const clearSyncedAttendance = async () => {
  return db.offlineAttendance.where('synced').equals(1).delete();
};

// Cached members functions
export const cacheMember = async (member: Omit<CachedMember, 'lastSync'>) => {
  return db.cachedMembers.put({
    ...member,
    lastSync: Date.now()
  });
};

export const getCachedMember = async (membershipId: string): Promise<CachedMember | undefined> => {
  return db.cachedMembers.where('membershipId').equals(membershipId).first();
};

export const getAllCachedMembers = async (): Promise<CachedMember[]> => {
  return db.cachedMembers.toArray();
};

export const clearOldCache = async (maxAge: number = 24 * 60 * 60 * 1000) => {
  const cutoff = Date.now() - maxAge;
  return db.cachedMembers.where('lastSync').below(cutoff).delete();
};
