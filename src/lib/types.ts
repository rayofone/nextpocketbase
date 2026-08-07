import type { RecordModel } from "pocketbase";

/** Matches the sample `items` collection used by the CRUD playground. */
export type ItemRecord = RecordModel & {
  title: string;
  notes: string;
  done: boolean;
  /** Filename stored by PocketBase after upload to the `displayimage` field. */
  displayimage?: string;
};

/** Auth record from the PocketBase `users` (or custom auth) collection. */
export type AuthUser = RecordModel & {
  email: string;
  verified?: boolean;
  name?: string;
};
