import assert from "node:assert/strict";
import test from "node:test";
import { mapJobPayload } from "../lib/job-input";
import { hideCompanyNotes } from "../lib/privacy";

test("maps the mobile job form fields to the backend REST shape", () => {
  const result = mapJobPayload({
    title: "Desarrollador móvil",
    description: "Crear aplicaciones.",
    requirements: ["React Native", "TypeScript"],
    contract_type: "Prácticas",
    modality: "Híbrido",
    location: "Barrancabermeja",
    positions: 2,
    requires_cv: false,
    programs_targeted: ["Ingeniería Informática"],
    company_id: 999,
  });

  assert.deepEqual(result, {
    success: true,
    data: {
      title: "Desarrollador móvil",
      description: "Crear aplicaciones.",
      requirements: "React Native\nTypeScript",
      contract_type: "Prácticas",
      modality: "hybrid",
      location: "Barrancabermeja",
      positions: 2,
      salary_negotiable: false,
      requires_cv: false,
      programs_targeted: ["Ingeniería Informática"],
    },
  });
});

test("rejects missing required fields and malformed boolean values", () => {
  const result = mapJobPayload({
    title: "Vacante",
    description: "Descripción",
    location: "Barrancabermeja",
    modality: "Presencial",
    requires_cv: "false",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.deepEqual(result.errors.requires_cv, ["Debe ser verdadero o falso."]);
  }
});

test("rejects unsupported modalities and never forwards unrecognized properties", () => {
  const result = mapJobPayload({
    title: "Vacante",
    description: "Descripción",
    location: "Barrancabermeja",
    modality: "Cualquiera",
    company_id: 999,
  });

  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.errors.modality);
});

test("removes company-only notes from paginated student applications", () => {
  const response = {
    success: true,
    data: {
      data: [{ id: 12, company_notes: "private", interview_note: "private", status: "pending" }],
    },
  };

  hideCompanyNotes(response);

  assert.deepEqual(response.data.data[0], { id: 12, status: "pending" });
});
