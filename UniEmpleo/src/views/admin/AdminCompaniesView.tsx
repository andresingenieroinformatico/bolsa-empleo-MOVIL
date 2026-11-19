import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CompanyProfile, CompanyStatus } from '@/data/mock-data';
import { Brand, Radius, Space, Type } from '@/constants/theme';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { SectionHeader } from '@/components/ui/section-header';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonBlock } from '@/components/SkeletonBlock';
import { pluralize } from '@/lib/format';

type StatusFilter = CompanyStatus | 'all';

interface AdminCompaniesViewProps {
  companies: CompanyProfile[];
  total: number;
  isLoading: boolean;
  /** Pre-selects a queue when opened from a notification. */
  initialStatus?: StatusFilter;
  onFilter: (status: StatusFilter) => Promise<void>;
  onSearch: (search: string) => Promise<void>;
  onApproveCompany: (companyId: string) => Promise<void>;
  onRejectCompany: (companyId: string, reason: string) => Promise<void>;
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobadas' },
  { key: 'rejected', label: 'Rechazadas' },
  { key: 'inactive', label: 'Inactivas' },
];

export function AdminCompaniesView({
  companies,
  total,
  isLoading,
  initialStatus = 'all',
  onFilter,
  onSearch,
  onApproveCompany,
  onRejectCompany,
}: AdminCompaniesViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingCompany, setRejectingCompany] = useState<CompanyProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runFilter = async (status: StatusFilter, term = search) => {
    setError(null);
    try {
      await onFilter(status);
      await onSearch(term.trim());
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No fue posible filtrar empresas.',
      );
    }
  };

  const handleApprove = async (company: CompanyProfile) => {
    setNotice(null);
    setError(null);
    setProcessingId(company.id);
    try {
      await onApproveCompany(company.id);
      setNotice(`La empresa ${company.name} quedó aprobada.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No fue posible aprobar la empresa.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingCompany) return;
    const reason = rejectionReason.trim();
    if (reason.length < 10) {
      setError('Describe con al menos 10 caracteres la información que la empresa debe corregir.');
      return;
    }
    setProcessingId(rejectingCompany.id);
    setNotice(null);
    setError(null);
    try {
      await onRejectCompany(rejectingCompany.id, reason);
      setNotice(
        `La solicitud de ${rejectingCompany.name} fue rechazada y se notificó el motivo a la empresa.`,
      );
      setRejectingCompany(null);
      setRejectionReason('');
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No fue posible rechazar la empresa.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SectionHeader
          overline="Red empresarial"
          title="Empresas"
          subtitle="Aprueba registros, revisa el estado de cada convenio y filtra por situación."
        />

        <View style={styles.searchRow}>
          <TextField
            label="Buscar empresa"
            placeholder="Razón social o NIT"
            value={search}
            onChangeText={setSearch}
            icon="search-outline"
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => void runFilter(statusFilter)}
            containerStyle={styles.searchField}
          />
          <Button
            label="Buscar"
            onPress={() => void runFilter(statusFilter)}
            variant="secondary"
            size="md"
            icon="search-outline"
            style={styles.searchButton}
          />
        </View>

        <View style={styles.filters} accessibilityRole="tablist">
          {FILTERS.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              selected={statusFilter === filter.key}
              onPress={() => {
                setStatusFilter(filter.key);
                void runFilter(filter.key);
              }}
            />
          ))}
        </View>

        <Text style={styles.countText}>
          {pluralize(total, 'empresa encontrada', 'empresas encontradas')}
        </Text>

        {notice ? <Notice tone="success" message={notice} onDismiss={() => setNotice(null)} /> : null}
        {error ? <Notice tone="error" message={error} onDismiss={() => setError(null)} /> : null}

        {isLoading && companies.length === 0 ? (
          <View style={styles.skeletons} accessibilityLabel="Cargando empresas">
            {[0, 1, 2].map((item) => (
              <SkeletonBlock key={item} style={styles.skeleton} />
            ))}
          </View>
        ) : companies.length === 0 ? (
          <EmptyState
            icon="business-outline"
            title="Sin empresas"
            description="No hay empresas registradas con este filtro."
          />
        ) : (
          <View style={styles.list}>
            {companies.map((company) => {
              const busy = processingId === company.id;
              return (
                <View key={company.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Avatar name={company.name} size={42} tone="green" />
                    <View style={styles.identity}>
                      <Text style={styles.name}>{company.name}</Text>
                      <Text style={styles.email} numberOfLines={1}>
                        {company.email}
                      </Text>
                    </View>
                    <StatusBadge status={company.status} size="small" />
                  </View>

                  <View style={styles.dataRow}>
                    <View style={styles.dataItem}>
                      <Text style={styles.dataLabel}>NIT</Text>
                      <Text style={styles.dataValue} numberOfLines={1}>
                        {company.nit}
                      </Text>
                    </View>
                    <View style={styles.dataItem}>
                      <Text style={styles.dataLabel}>Sector</Text>
                      <Text style={styles.dataValue} numberOfLines={1}>
                        {company.sector}
                      </Text>
                    </View>
                    <View style={styles.dataItem}>
                      <Text style={styles.dataLabel}>Responsable</Text>
                      <Text style={styles.dataValue} numberOfLines={1}>
                        {company.contactPerson || 'No registrado'}
                      </Text>
                    </View>
                    <View style={styles.dataItem}>
                      <Text style={styles.dataLabel}>Teléfono</Text>
                      <Text style={styles.dataValue} numberOfLines={1}>
                        {company.phone || 'No registrado'}
                      </Text>
                    </View>
                  </View>

                  {company.status === 'rejected' ? (
                    <View style={styles.rejectedBox}>
                      <Icon name="time-outline" size={16} color={Brand.amber} />
                      <View style={styles.rejectedCopy}>
                        <Text style={styles.rejectedTitle}>
                          Esperando actualización de la empresa
                        </Text>
                        {company.rejectionReason ? (
                          <Text style={styles.rejectedText} numberOfLines={3}>
                            Motivo enviado: {company.rejectionReason}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.actions}>
                      <Button
                        label="Aprobar"
                        onPress={() => void handleApprove(company)}
                        loading={busy}
                        disabled={busy || company.status === 'approved'}
                        variant="primary"
                        size="sm"
                        icon="checkmark"
                        style={styles.actionGrow}
                      />
                      <Button
                        label="Rechazar"
                        onPress={() => {
                          setError(null);
                          setRejectingCompany(company);
                        }}
                        disabled={busy}
                        variant="danger"
                        size="sm"
                        icon="close"
                        style={styles.actionGrow}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      <Sheet
        visible={rejectingCompany !== null}
        onClose={() => {
          if (processingId === null) setRejectingCompany(null);
        }}
        title="Rechazar empresa"
        subtitle="Indica a la empresa qué información debe corregir."
        icon="close-circle-outline"
        closeLabel="Cerrar rechazo de empresa"
        footer={
          <View style={styles.rejectActions}>
            <Button
              label="Cancelar"
              onPress={() => setRejectingCompany(null)}
              disabled={processingId !== null}
              variant="secondary"
              size="md"
              style={styles.actionGrow}
            />
            <Button
              label="Confirmar rechazo"
              onPress={() => void handleReject()}
              disabled={rejectionReason.trim().length < 10 || processingId !== null}
              loading={processingId !== null}
              variant="danger"
              size="md"
              style={styles.actionGrow}
            />
          </View>
        }>
        <TextField
          label="Motivo del rechazo"
          required
          hint="Mínimo 10 caracteres. La empresa verá este mensaje."
          value={rejectionReason}
          onChangeText={setRejectionReason}
          placeholder="Ej. El NIT no coincide con el registrado en RUES. Corrige el dato y vuelve a guardar."
          multiline
          numberOfLines={3}
          maxLength={1000}
        />
        <Notice
          tone="warning"
          message="La empresa podrá corregir su información y guardar el perfil para volver a enviar la solicitud a revisión."
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
    gap: 8,
  },
  countText: {
    ...Type.label,
    color: Brand.slate,
  },
  skeletons: {
    gap: 10,
  },
  skeleton: {
    height: 156,
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
  rejectedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: Brand.amberTint,
    borderWidth: 1,
    borderColor: Brand.amberLine,
  },
  rejectedCopy: {
    flex: 1,
    gap: 2,
  },
  rejectedTitle: {
    ...Type.label,
    color: Brand.amber,
  },
  rejectedText: {
    ...Type.caption,
    fontSize: 11.5,
    color: Brand.slate,
  },
  actionGrow: {
    flex: 1,
  },
  rejectActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
