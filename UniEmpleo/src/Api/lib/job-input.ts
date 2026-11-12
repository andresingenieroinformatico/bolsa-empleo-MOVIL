export function mapProgramsTargeted(
  input: Record<string, unknown>,
): string[] | null {
  const value = input.programs_targeted ?? input.program;
  const entries = Array.isArray(value) ? value : [value];
  const programs = entries
    .filter((entry): entry is string => typeof entry === 'string')
    .map((program) => program.trim())
    .filter(Boolean);

  return programs.length > 0 ? programs : null;
}
