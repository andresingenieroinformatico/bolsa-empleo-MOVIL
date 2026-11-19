import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AdminUser } from '@/data/mock-data';
import { Brand, Radius, Space, Type } from '@/constants/theme';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { SectionHeader } from '@/components/ui/section-header';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonBlock } from '@/components/SkeletonBlock';
import { pluralize } from '@/lib/format';

interface AdminStudentUpdateInput {
  name: string;
  email: string;
  program: string;
  semester?: string;
  phone?: string;
  studentCode?: string;
  password?: string;
  passwordConfirmation?: string;
}

export interface AdminStudentsQuery {
  search: string;
  active?: boolean;
  profile?: 'complete' | 'incomplete';
}

interface AdminStudentsViewProps {
  users: AdminUser[];
  total: number;
  isLoading: boolean;
  onQuery: (query: AdminStudentsQuery) => Promise<void>;
  onToggleUser: (userId: string) => Promise<void>;
  onUpdateUser: (userId: string, input: AdminStudentUpdateInput) => Promise<void>;
}

type StatusFilter = 'all' | 'active' | 'inactive';
type ProfileFilter = 'all' | 'complete' | 'incomplete';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
];

const PROFILE_FILTERS: { key: ProfileFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'complete', label: 'Perfil completo' },
  { key: 'incomplete', label: 'Perfil incompleto' },
];

export function AdminStudentsView({
  users,
  total,
  isLoading,
  onQuery,
  onToggleUser,
  onUpdateUser,
}: AdminStudentsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [profileFilter, setProfileFilter] = useState<ProfileFilter>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProgram, setEditProgram] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStudentCode, setEditStudentCode] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordConfirmation, setEditPasswordConfirmation] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const runQuery = async (
    nextStatus: StatusFilter = statusFilter,
    nextProfile: ProfileFilter = profileFilter,
    term: string = search,
  ) => {
    setError(null);
    try {
      await onQuery({
        search: term.trim(),
        active: nextStatus === 'all' ? undefined : nextStatus === 'active',
        profile: nextProfile === 'all' ? undefined : nextProfile,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible buscar estudiantes.',
      );
    }
  };

  const filtersActive =
    search.trim().length > 0 || statusFilter !== 'all' || profileFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setProfileFilter('all');
    void runQuery('all', 'all', '');
  };

  const handleToggle = async (user: AdminUser) => {
    setNotice(null);
    setError(null);
    setProcessingId(user.id);
    try {
      await onToggleUser(user.id);
      setNotice(
        user.active
          ? `La cuenta de ${user.name} fue desactivada.`
          : `La cuenta de ${user.name} fue activada.`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible actualizar la cuenta.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openEditor = (user: AdminUser) => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditProgram(user.program ?? '');
    setEditSemester(user.semester ? String(user.semester) : '');
    setEditPhone(user.phone ?? '');
    setEditStudentCode(user.studentCode ?? '');
    setEditPassword('');
    setEditPasswordConfirmation('');
    setEditError(null);
    setEditingUser(user);
  };

  const closeEditor = () => {
    if (!isSavingEdit) setEditingUser(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    const name = editName.trim();
    const email = editEmail.trim();
    const program = editProgram.trim();
    const semester = editSemester.trim();

    if (!name || !email || !program) {
      setEditError('Completa el nombre, el correo institucional y el programa académico.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEditError('Escribe un correo electrónico válido.');
      return;
    }
    if (semester && (!/^\d{1,2}$/.test(semester) || Number(semester) < 1 || Number(semester) > 12)) {
      setEditError('El semestre debe ser un número entre 1 y 12.');
      return;
    }
    if (editPassword && editPassword.length < 8) {
      setEditError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (editPassword !== editPasswordConfirmation) {
      setEditError('La confirmación de la contraseña no coincide.');
      return;
    }

    setEditError(null);
    setIsSavingEdit(true);
    try {
      await onUpdateUser(editingUser.id, {
        name,
        email,
        program,
        semester: semester || undefined,
        phone: editPhone.trim() || undefined,
        studentCode: editStudentCode.trim() || undefined,
        password: editPassword || undefined,
        passwordConfirmation: editPassword ? editPasswordConfirmation : undefined,
      });
      setNotice(
        editPassword
          ? `La información y la contraseña de ${name} quedaron actualizadas.`
          : `La información de ${name} quedó actualizada.`,
      );
      setEditingUser(null);
    } catch (requestError) {
      setEditError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible actualizar la información del estudiante.',
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SectionHeader
          overline="Comunidad UNIPAZ"
          title="Estudiantes"
          subtitle="Consulta, edita la información y administra el acceso de las cuentas registradas."
        />

        <View style={styles.searchRow}>
          <TextField
            label="Buscar estudiante"
            placeholder="Nombre, correo o cédula"
            value={search}
            onChangeText={setSearch}
            icon="search-outline"
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => void runQuery()}
            clearable
            clearLabel="Borrar búsqueda de estudiantes"
            containerStyle={styles.searchField}
          />
          <Button
            label="Buscar"
            onPress={() => void runQuery()}
            variant="secondary"
            size="md"
            icon="search-outline"
            loading={isLoading}
            style={styles.searchButton}
          />
        </View>

        <View style={styles.filters}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Estado de la cuenta</Text>
            <View style={styles.filterChips}>
              {STATUS_FILTERS.map((filter) => (
                <Chip
                  key={filter.key}
                  label={filter.label}
                  selected={statusFilter === filter.key}
                  onPress={() => {
                    setStatusFilter(filter.key);
                    void runQuery(filter.key, profileFilter);
                  }}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Perfil del estudiante</Text>
            <View style={styles.filterChips}>
              {PROFILE_FILTERS.map((filter) => (
                <Chip
                  key={filter.key}
                  label={filter.label}
                  selected={profileFilter === filter.key}
                  onPress={() => {
                    setProfileFilter(filter.key);
                    void runQuery(statusFilter, filter.key);
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        {filtersActive ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda y filtros"
            onPress={clearFilters}
            style={({ pressed }) => [styles.clearFilters, pressed && styles.pressed]}>
            <Icon name="close-circle-outline" size={15} color={Brand.greenDark} />
            <Text style={styles.clearFiltersText}>Limpiar búsqueda y filtros</Text>
          </Pressable>
        ) : null}

        <View style={styles.countRow}>
          <Icon name="people-outline" size={15} color={Brand.greenDark} />
          <Text style={styles.countText}>
            {pluralize(total, 'estudiante registrado', 'estudiantes registrados')}
          </Text>
        </View>

        {notice ? <Notice tone="success" message={notice} onDismiss={() => setNotice(null)} /> : null}
        {error ? <Notice tone="error" message={error} onDismiss={() => setError(null)} /> : null}

        {isLoading && users.length === 0 ? (
          <View style={styles.skeletons} accessibilityLabel="Cargando estudiantes">
            {[0, 1, 2].map((item) => (
              <SkeletonBlock key={item} style={styles.skeleton} />
            ))}
          </View>
        ) : users.length === 0 ? (
          <EmptyState
            icon="school-outline"
            title="Sin estudiantes"
            description="No encontramos cuentas de estudiante con esa búsqueda o esos filtros."
          />
        ) : (
          <View style={styles.list}>
            {users.map((user) => (
              <View key={user.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Avatar name={user.name} size={42} tone="green" />
                  <View style={styles.identity}>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.email} numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, !user.active && styles.statusPillOff]}>
                    <View style={[styles.statusDot, !user.active && styles.statusDotOff]} />
                    <Text style={[styles.statusText, !user.active && styles.statusTextOff]}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>

                <View style={styles.dataRow}>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Programa</Text>
                    <Text style={styles.dataValue} numberOfLines={1}>
                      {user.program || 'No registrado'}
                    </Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Semestre</Text>
                    <Text style={styles.dataValue}>
                      {user.semester ? String(user.semester) : 'No registrado'}
                    </Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Teléfono</Text>
                    <Text style={styles.dataValue} numberOfLines={1}>
                      {user.phone || 'No registrado'}
                    </Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Cédula</Text>
                    <Text style={styles.dataValue} numberOfLines={1}>
                      {user.studentCode || 'No registrada'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Button
                    label="Editar información"
                    onPress={() => openEditor(user)}
                    disabled={processingId !== null}
                    variant="secondary"
                    size="sm"
                    icon="create-outline"
                    style={styles.actionGrow}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      user.active
                        ? `Desactivar la cuenta de ${user.name}`
                        : `Activar la cuenta de ${user.name}`
                    }
                    accessibilityState={{ disabled: processingId !== null }}
                    onPress={() => void handleToggle(user)}
                    style={({ pressed }) => [
                      styles.toggleButton,
                      !user.active && styles.toggleButtonOn,
                      pressed && styles.pressed,
                    ]}>
                    <Icon
                      name={user.active ? 'pause-circle-outline' : 'checkmark-circle-outline'}
                      size={16}
                      color={user.active ? Brand.red : Brand.greenDark}
                    />
                    <Text style={[styles.toggleText, !user.active && styles.toggleTextOn]}>
                      {processingId === user.id
                        ? 'Actualizando…'
                        : user.active
                          ? 'Desactivar'
                          : 'Activar'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <Sheet
        visible={editingUser !== null}
        onClose={closeEditor}
        title="Editar estudiante"
        subtitle={editingUser ? `Cuenta de ${editingUser.name}` : undefined}
        icon="create-outline"
        closeLabel="Cerrar edición de estudiante"
        footer={
          <View style={styles.editActions}>
            <Button
              label="Cancelar"
              onPress={closeEditor}
              disabled={isSavingEdit}
              variant="secondary"
              size="md"
              style={styles.actionGrow}
            />
            <Button
              label={isSavingEdit ? 'Guardando…' : 'Guardar cambios'}
              onPress={() => void handleSaveEdit()}
              loading={isSavingEdit}
              variant="primary"
              size="md"
              icon="save-outline"
              style={styles.actionGrow}
            />
          </View>
        }>
        <TextField
          label="Nombre completo"
          required
          value={editName}
          onChangeText={setEditName}
          placeholder="Nombre del estudiante"
          autoCapitalize="words"
          maxLength={255}
          icon="person-outline"
        />
        <TextField
          label="Correo institucional"
          required
          value={editEmail}
          onChangeText={setEditEmail}
          placeholder="nombre.apellido@unipaz.edu.co"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          maxLength={255}
          icon="mail-outline"
          clearable
          clearLabel="Borrar correo institucional"
        />
        <TextField
          label="Cédula o código estudiantil"
          optionalLabel="Opcional"
          value={editStudentCode}
          onChangeText={setEditStudentCode}
          placeholder="Número de cédula"
          keyboardType="numbers-and-punctuation"
          maxLength={30}
          icon="card-outline"
        />
        <TextField
          label="Programa académico"
          required
          value={editProgram}
          onChangeText={setEditProgram}
          placeholder="Ej. Ingeniería de Sistemas"
          maxLength={120}
          icon="school-outline"
        />
        <View style={styles.editRow}>
          <TextField
            label="Semestre"
            optionalLabel="Opcional"
            value={editSemester}
            onChangeText={setEditSemester}
            placeholder="6"
            keyboardType="number-pad"
            maxLength={2}
            containerStyle={styles.editSemester}
          />
          <TextField
            label="Teléfono"
            optionalLabel="Opcional"
            value={editPhone}
            onChangeText={setEditPhone}
            placeholder="+57 300 000 0000"
            keyboardType="phone-pad"
            maxLength={20}
            containerStyle={styles.editPhone}
          />
        </View>

        <View style={styles.passwordBlock}>
          <View style={styles.passwordHeader}>
            <Icon name="lock-closed-outline" size={16} color={Brand.navy} />
            <Text style={styles.passwordTitle}>Cambiar contraseña</Text>
          </View>
          <Text style={styles.passwordHint}>
            Opcional. Si la cambias, el estudiante tendrá que iniciar sesión de nuevo con la nueva
            contraseña.
          </Text>
          <TextField
            label="Nueva contraseña"
            optionalLabel="Opcional"
            value={editPassword}
            onChangeText={setEditPassword}
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            secureToggle
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={100}
            icon="lock-closed-outline"
          />
          <TextField
            label="Confirmar contraseña"
            optionalLabel="Opcional"
            value={editPasswordConfirmation}
            onChangeText={setEditPasswordConfirmation}
            placeholder="Repite la nueva contraseña"
            secureTextEntry
            secureToggle
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={100}
            icon="lock-closed-outline"
            error={
              editPasswordConfirmation && editPassword !== editPasswordConfirmation
                ? 'Las contraseñas no coinciden.'
                : null
            }
          />
        </View>

        {editError ? (
          <Notice tone="error" message={editError} onDismiss={() => setEditError(null)} />
        ) : null}

        <Notice
          tone="info"
          message="Los cambios se reflejan de inmediato en el perfil del estudiante y en su hoja de vida."
        />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Brand.canvas,
  },
  content: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: Space.lg,
    paddingBottom: Space.huge,
    gap: Space.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  searchField: {
    flex: 1,
  },
  searchButton: {
    marginBottom: 1,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.lg,
  },
  filterGroup: {
    flexGrow: 1,
    flexBasis: 240,
    gap: 8,
  },
  filterLabel: {
    ...Type.overline,
    color: Brand.slateSoft,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 4,
  },
  clearFiltersText: {
    ...Type.label,
    color: Brand.greenDeep,
    textDecorationLine: 'underline',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countText: {
    ...Type.label,
    color: Brand.greenDeep,
  },
  skeletons: {
    gap: 10,
  },
  skeleton: {
    height: 128,
    borderRadius: Radius.xl,
  },
  list: {
    gap: Space.md,
  },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.lg,
    gap: Space.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Type.heading,
    color: Brand.ink,
  },
  email: {
    ...Type.caption,
    fontSize: 11.5,
    color: Brand.slate,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Brand.greenTint,
    borderWidth: 1,
    borderColor: Brand.greenLine,
  },
  statusPillOff: {
    backgroundColor: Brand.surfaceMuted,
    borderColor: Brand.line,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.green,
  },
  statusDotOff: {
    backgroundColor: Brand.slateFaint,
  },
  statusText: {
    ...Type.label,
    fontSize: 10.5,
    color: Brand.greenDeep,
  },
  statusTextOff: {
    color: Brand.slate,
  },
  dataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: Brand.surfaceMuted,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    borderRadius: Radius.lg,
    padding: Space.md,
  },
  dataItem: {
    flexGrow: 1,
    flexBasis: 120,
    gap: 2,
  },
  dataLabel: {
    ...Type.overline,
    fontSize: 9,
    color: Brand.slateSoft,
  },
  dataValue: {
    ...Type.caption,
    fontSize: 12,
    color: Brand.inkSoft,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionGrow: {
    flex: 1,
  },
  editRow: {
    flexDirection: 'row',
    gap: Space.md,
  },
  editSemester: {
    flex: 0.6,
  },
  editPhone: {
    flex: 1.4,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  passwordBlock: {
    gap: 12,
    marginTop: 4,
    paddingTop: Space.md,
    borderTopWidth: 1,
    borderTopColor: Brand.lineSoft,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordTitle: {
    ...Type.heading,
    fontSize: 14,
    color: Brand.navy,
  },
  passwordHint: {
    ...Type.caption,
    color: Brand.slate,
    marginTop: -4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.redLine,
    backgroundColor: Brand.redTint,
  },
  toggleButtonOn: {
    borderColor: Brand.greenLine,
    backgroundColor: Brand.greenTint,
  },
  toggleText: {
    ...Type.label,
    color: Brand.red,
  },
  toggleTextOn: {
    color: Brand.greenDeep,
  },
  pressed: {
    opacity: 0.8,
  },
});
