// src/music/songsApi.js
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const songsCol = collection(db, "songs");

export async function searchSongs(orgId, queryText) {
  if (!orgId || !queryText) return [];

  const songsRef = collection(db, "songs");
  const q = query(
    songsRef,
    where("orgId", "==", orgId),
    // Firestore cannot search string contains; we will do client-side filter
  );
  const snap = await getDocs(q);

  const text = queryText.toLowerCase();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter(
      (song) =>
        song.name?.toLowerCase().includes(text) ||
        song.tags?.some((t) => t.toLowerCase().includes(text))
    );
}


/**
 * Listen songs. If orgId is provided, filter by orgId.
 */
export function listenToSongs(callback, orgId) {
  let q;

  if (orgId) {
    console.log("[songsApi] listenToSongs with orgId:", orgId);
    q = query(songsCol, where("orgId", "==", orgId));
  } else {
    console.log("[songsApi] listenToSongs without orgId (dev mode)");
    q = songsCol; // no filter, all songs
  }

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const songs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      console.log("[songsApi] onSnapshot, count:", songs.length, songs);
      callback(songs);
    },
    (error) => {
      console.error("[songsApi] onSnapshot error:", error);
    }
  );

  return unsub;
}

/**
 * Create a new song.
 */
export async function createSong(partial, orgId) {
  if (!orgId) {
    console.warn("[songsApi] createSong called without orgId");
  }

  const docRef = await addDoc(songsCol, {
    orgId: orgId || null,
    name: partial.name,
    url: partial.url || null,
    lyrics: partial.lyrics || null,
    tags: partial.tags || [],
    defaultTextColor: partial.defaultTextColor || "white",
    defaultBlur:
      typeof partial.defaultBlur === "boolean" ? partial.defaultBlur : true,
    coverImageUrl: partial.coverImageUrl || null,
    youtubeThumbnailUrl: partial.youtubeThumbnailUrl || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Update existing song.
 */
export async function updateSong(id, partial) {
  const ref = doc(db, "songs", id);
  const payload = {
    ...partial,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(ref, payload);
}
