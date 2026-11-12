import assert from 'node:assert/strict';
import test from 'node:test';
import { toJobWriteInput } from '../src/services/api.ts';

test('maps all editable vacancy fields to the gateway contract', () => {
  const result = toJobWriteInput({
    title: 'Desarrollador móvil',
    description: 'Desarrollo de una aplicación para Android.',
    requirements: ['React Native', 'TypeScript'],
    responsibilities: 'Implementar y mantener funcionalidades.',
    area: 'Tecnología',
    contractType: 'Prácticas',
    modality: 'Remoto',
    schedule: 'Tiempo completo',
    location: 'Barrancabermeja',
    salaryRange: 'A convenir',
    salaryNegotiable: true,
    positions: 2,
    deadline: '2026-12-01',
    requiresCv: false,
    programsTargeted: ['Ingeniería Informática'],
    status: 'paused',
  });

  assert.deepEqual(result, {
    title: 'Desarrollador móvil',
    description: 'Desarrollo de una aplicación para Android.',
    requirements: 'React Native\nTypeScript',
    responsibilities: 'Implementar y mantener funcionalidades.',
    area: 'Tecnología',
    contract_type: 'Prácticas',
    modality: 'Remoto',
    schedule: 'Tiempo completo',
    location: 'Barrancabermeja',
    salary_range: 'A convenir',
    salary_negotiable: true,
    positions: 2,
    deadline: '2026-12-01',
    requires_cv: false,
    programs_targeted: ['Ingeniería Informática'],
    status: 'paused',
  });
});
