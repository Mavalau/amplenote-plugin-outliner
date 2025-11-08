/**
 * Extracts the current note UUID from a given URL.
 */
export function getCurrentNoteUUIDFromUrl(url: string) {
  const extractedUUID =
    /\/notes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(
      url,
    );
  return extractedUUID ? extractedUUID[1] : null;
}

export function assertNoteContext(noteUUID: string) {
  if (!noteUUID) {
    console.log('No note is currently open.');
    return false;
  }
  return true;
}
