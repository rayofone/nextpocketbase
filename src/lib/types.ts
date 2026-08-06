import type { RecordModel } from "pocketbase";

/** Matches the sample `items` collection used by the CRUD playground. */
export type ItemRecord = RecordModel & {
  title: string;
  notes: string;
  done: boolean;
};
