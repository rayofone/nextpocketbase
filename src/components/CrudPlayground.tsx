"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ClientResponseError } from "pocketbase";
import { COLLECTION, getPocketBase } from "@/lib/pocketbase";
import type { ItemRecord } from "@/lib/types";

type Status = "idle" | "loading" | "ok" | "error";

function errorMessage(err: unknown): string {
  if (err instanceof ClientResponseError) {
    if (err.status === 0) {
      return "Could not reach PocketBase. Check the URL, that the service is running, and CORS settings.";
    }
    if (err.status === 404) {
      return `Collection "${COLLECTION}" not found. Create it in the PocketBase admin UI.`;
    }
    if (err.status === 403) {
      return "Permission denied. Open the collection API rules for list/view/create/update/delete while testing.";
    }
    return err.message || `Request failed (${err.status})`;
  }
  if (err instanceof Error) return err.message;
  return "Unexpected error";
}

export default function CrudPlayground() {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "(not set)";
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setStatus("loading");
    setMessage(null);
    try {
      const pb = getPocketBase();
      const result = await pb
        .collection(COLLECTION)
        .getList<ItemRecord>(1, 50, {
          sort: "-created",
        });
      setItems(result.items);
      setStatus("ok");
      setMessage(`Loaded ${result.totalItems} record(s) from "${COLLECTION}".`);
    } catch (err) {
      setItems([]);
      setStatus("error");
      setMessage(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setBusyId("create");
    setMessage(null);
    try {
      const pb = getPocketBase();
      // FormData is required so PocketBase can store the uploaded file.
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("notes", notes.trim());
      formData.append("done", "false");
      if (imageFile) {
        formData.append("displayimage", imageFile);
      }

      const uploadedImage = Boolean(imageFile);
      await pb.collection(COLLECTION).create<ItemRecord>(formData);
      setTitle("");
      setNotes("");
      setImageFile(null);
      setFileInputKey((key) => key + 1);
      setMessage(uploadedImage ? "Created record with image." : "Created record.");
      await loadItems();
    } catch (err) {
      setStatus("error");
      setMessage(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  function fileUrl(item: ItemRecord): string | null {
    if (!item.displayimage) return null;
    return getPocketBase().files.getURL(item, item.displayimage);
  }

  function startEdit(item: ItemRecord) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditNotes(item.notes ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditNotes("");
  }

  async function handleUpdate(id: string) {
    if (!editTitle.trim()) return;

    setBusyId(id);
    setMessage(null);
    try {
      const pb = getPocketBase();
      await pb.collection(COLLECTION).update<ItemRecord>(id, {
        title: editTitle.trim(),
        notes: editNotes.trim(),
      });
      cancelEdit();
      setMessage("Updated record.");
      await loadItems();
    } catch (err) {
      setStatus("error");
      setMessage(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleDone(item: ItemRecord) {
    setBusyId(item.id);
    setMessage(null);
    try {
      const pb = getPocketBase();
      await pb.collection(COLLECTION).update<ItemRecord>(item.id, {
        done: !item.done,
      });
      setMessage(item.done ? "Marked incomplete." : "Marked done.");
      await loadItems();
    } catch (err) {
      setStatus("error");
      setMessage(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this record?")) return;

    setBusyId(id);
    setMessage(null);
    try {
      const pb = getPocketBase();
      await pb.collection(COLLECTION).delete(id);
      if (editingId === id) cancelEdit();
      setMessage("Deleted record.");
      await loadItems();
    } catch (err) {
      setStatus("error");
      setMessage(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  const statusTone =
    status === "ok"
      ? "ok"
      : status === "error"
        ? "error"
        : status === "loading"
          ? "loading"
          : "idle";

  return (
    <div className="playground">
      <header className="header">
        <div>
          <p className="eyebrow">PocketBase template</p>
          <h1>CRUD playground</h1>
          <p className="lede">
            Create, read, update, and delete records against your PocketBase
            instance to verify the data flow.
          </p>
        </div>
        <dl className="meta">
          <div>
            <dt>URL</dt>
            <dd>
              <code>{pbUrl}</code>
            </dd>
          </div>
          <div>
            <dt>Collection</dt>
            <dd>
              <code>{COLLECTION}</code>
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span className={`badge badge-${statusTone}`}>{status}</span>
            </dd>
          </div>
        </dl>
      </header>

      {message ? (
        <p className={`banner banner-${status === "error" ? "error" : "info"}`}>
          {message}
        </p>
      ) : null}

      <section className="panel">
        <div className="panel-head">
          <h2>Create</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void loadItems()}
            disabled={status === "loading"}
          >
            Refresh list
          </button>
        </div>
        <form className="form" onSubmit={handleCreate}>
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ship checklist item"
              required
              maxLength={200}
            />
          </label>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional details"
              rows={3}
              maxLength={2000}
            />
          </label>
          <label>
            Image
            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            {imageFile ? (
              <span className="file-hint">{imageFile.name}</span>
            ) : (
              <span className="file-hint">Optional — stored in PocketBase displayimage field</span>
            )}
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={busyId === "create" || !title.trim()}
          >
            {busyId === "create" ? "Creating…" : "Create record"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Read / Update / Delete</h2>
          <span className="count">{items.length} shown</span>
        </div>

        {items.length === 0 ? (
          <p className="empty">
            No records yet. Create one above, or confirm the collection exists
            and API rules allow list access.
          </p>
        ) : (
          <ul className="list">
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const isBusy = busyId === item.id;
              const imageSrc = fileUrl(item);

              return (
                <li key={item.id} className={item.done ? "item done" : "item"}>
                  {isEditing ? (
                    <div className="edit-row">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        aria-label="Edit title"
                      />
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                        aria-label="Edit notes"
                      />
                      <div className="actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={isBusy || !editTitle.trim()}
                          onClick={() => void handleUpdate(item.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={cancelEdit}
                          disabled={isBusy}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="item-body">
                        <label className="check">
                          <input
                            type="checkbox"
                            checked={Boolean(item.done)}
                            disabled={isBusy}
                            onChange={() => void handleToggleDone(item)}
                          />
                          <span>
                            <strong>{item.title}</strong>
                            {item.notes ? <em>{item.notes}</em> : null}
                          </span>
                        </label>
                        {imageSrc ? (
                          <img
                            className="item-image"
                            src={imageSrc}
                            alt={`Image for ${item.title}`}
                          />
                        ) : null}
                        <code className="id">{item.id}</code>
                      </div>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={isBusy}
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          disabled={isBusy}
                          onClick={() => void handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="setup">
        <h2>PocketBase setup</h2>
        <ol>
          <li>
            In admin (<code>/_/</code>), create a collection named{" "}
            <code>{COLLECTION}</code>.
          </li>
          <li>
            Add fields: <code>title</code> (text, required), <code>notes</code>{" "}
            (text), <code>done</code> (bool), <code>displayimage</code> (file,
            single, image mime types).
          </li>
          <li>
            For local testing, set API rules for list/view/create/update/delete
            to empty (public) or a rule you prefer.
          </li>
          <li>
            If the browser blocks requests, add your Next.js origin (e.g.{" "}
            <code>http://localhost:3000</code>) under PocketBase Settings →
            Application → CORS.
          </li>
        </ol>
      </section>
    </div>
  );
}
