export function hideCompanyNotes<T>(response: T): T {
  if (!response || typeof response !== "object" || Array.isArray(response)) return response;
  const envelope = response as Record<string, unknown>;
  const data = envelope.data;
  const collections = Array.isArray(data)
    ? [data]
    : data && typeof data === "object" && !Array.isArray(data)
      ? [
          (data as Record<string, unknown>).data,
          (data as Record<string, unknown>).applications,
        ].filter(Array.isArray) as unknown[][]
      : [];

  for (const collection of collections) {
    for (const item of collection) {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const application = item as Record<string, unknown>;
        delete application.company_notes;
        delete application.interview_note;
      }
    }
  }
  return response;
}
