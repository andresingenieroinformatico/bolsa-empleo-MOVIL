export function mapProgramsTargeted(input: Record<string, unknown>): string[] | null {
  const value = input.programs_targeted ?? input.program;
  const entries = Array.isArray(value) ? value : [value];
  const programs = entries
    .filter((entry): entry is string => typeof entry === "string")
    .map((program) => program.trim())
    .filter(Boolean);
  return programs.length > 0 ? programs : null;
}

type JobPayloadResult =
  | { success: true; data: Record<string, unknown> }
  | { success: false; errors: Record<string, string[]> };

export function mapJobPayload(input: Record<string, unknown>, partial = false): JobPayloadResult {
  const errors: Record<string, string[]> = {};
  const data: Record<string, unknown> = {};
  const aliases: Record<string, string[]> = {
    title: ["title", "titulo"],
    description: ["description", "descripcion"],
    requirements: ["requirements", "requisitos"],
    responsibilities: ["responsibilities", "responsabilidades"],
    area: ["area"],
    contract_type: ["contract_type", "tipo_contrato"],
    schedule: ["schedule", "horario"],
    location: ["location", "ubicacion", "ciudad"],
    salary_range: ["salary_range", "salario"],
    deadline: ["deadline", "fecha_limite"],
  };
  const maxLengths: Record<string, number> = {
    title: 191,
    description: 50000,
    requirements: 50000,
    responsibilities: 50000,
    area: 191,
    contract_type: 100,
    schedule: 191,
    location: 191,
    salary_range: 100,
    deadline: 10,
  };

  for (const [field, keys] of Object.entries(aliases)) {
    const key = keys.find((candidate) => input[candidate] !== undefined);
    if (!key) continue;
    const value = input[key];
    if (field === "requirements" && Array.isArray(value)) {
      if (value.every((item) => typeof item === "string")) {
        data[field] = value.join("\n");
        continue;
      }
    }
    if (value === null && ["schedule", "salary_range"].includes(field)) {
      data[field] = null;
      continue;
    }
    if (typeof value !== "string" || value.trim().length === 0) {
      errors[field] = ["Debe ser texto no vacío."];
      continue;
    }
    if (value.length > maxLengths[field]) {
      errors[field] = [`No puede superar los ${maxLengths[field]} caracteres.`];
      continue;
    }
    if (field === "deadline") {
      const date = new Date(`${value.trim()}T00:00:00.000Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ||
          Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value.trim()) {
        errors[field] = ["Debe ser una fecha válida con formato YYYY-MM-DD."];
        continue;
      }
    }
    data[field] = value.trim();
  }

  const modalityInput = input.modality ?? input.modalidad;
  if (modalityInput !== undefined) {
    if (typeof modalityInput !== "string") {
      errors.modality = ["Debe ser una modalidad válida."];
    } else {
      const normalized = modalityInput.trim().toLowerCase();
      if (normalized.includes("remot")) data.modality = "remote";
      else if (normalized.includes("hibrid") || normalized.includes("híbrid")) data.modality = "hybrid";
      else if (normalized.includes("presenc") || normalized.includes("onsite")) data.modality = "onsite";
      else errors.modality = ["Modalidad permitida: remoto, híbrido o presencial."];
    }
  } else if (!partial) {
    errors.modality = ["La modalidad es obligatoria."];
  }

  const positions = input.positions ?? input.vacancies_count;
  if (positions !== undefined) {
    const parsed = typeof positions === "number" ? positions : Number(positions);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1000) {
      errors.positions = ["Debe ser un entero entre 1 y 1000."];
    } else data.positions = parsed;
  } else if (!partial) {
    data.positions = 1;
  }

  for (const [field, aliasesForField] of Object.entries({
    salary_negotiable: ["salary_negotiable", "salario_negociable"],
    requires_cv: ["requires_cv", "requiere_cv"],
  })) {
    const key = aliasesForField.find((candidate) => input[candidate] !== undefined);
    if (!key) {
      if (!partial && field === "requires_cv") data[field] = true;
      if (!partial && field === "salary_negotiable") data[field] = false;
      continue;
    }
    if (typeof input[key] !== "boolean") errors[field] = ["Debe ser verdadero o falso."];
    else data[field] = input[key];
  }

  const programs = input.programs_targeted ?? input.program;
  if (programs !== undefined) {
    const entries = Array.isArray(programs) ? programs : [programs];
    if (!entries.every((entry) => typeof entry === "string")) {
      errors.programs_targeted = ["Debe ser una lista de programas de texto."];
    } else {
      const value = entries.map((entry) => entry.trim()).filter(Boolean).join(", ");
      if (value.length > 500) {
        errors.programs_targeted = ["No puede superar los 500 caracteres."];
      } else {
        data.programs_targeted = value || null;
      }
    }
  }

  const status = input.status ?? input.estado;
  if (status !== undefined) {
    const statuses: Record<string, string> = {
      active: "active", paused: "paused", closed: "closed",
      activa: "active", pausada: "paused", cerrada: "closed",
    };
    if (typeof status !== "string" || !statuses[status.toLowerCase()]) {
      errors.status = ["Estado permitido: active, paused o closed."];
    } else data.status = statuses[status.toLowerCase()];
  }

  if (!partial) {
    for (const field of ["title", "description", "location"] as const) {
      if (typeof data[field] !== "string") errors[field] = ["Este campo es obligatorio."];
    }
  } else if (Object.keys(data).length === 0) {
    errors.body = ["Debe proporcionar al menos un campo para actualizar."];
  }

  return Object.keys(errors).length > 0
    ? { success: false, errors }
    : { success: true, data };
}
