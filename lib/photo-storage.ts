import { get, set, del } from "idb-keyval"

/* Save a blob under a deterministic key (the photo id) */
export async function savePhotoBlob(id: string, blob: Blob) {
  await set(id, blob)
}

/* Read a blob and return an object-URL (fallback to placeholder) */
export async function getPhotoBlobUrl(id: string): Promise<string> {
  const blob = await get<Blob>(id)
  if (!blob) return "/placeholder.svg"
  return URL.createObjectURL(blob)
}

/* Remove blob when a photo is deleted */
export async function deletePhotoBlob(id: string) {
  await del(id)
}
