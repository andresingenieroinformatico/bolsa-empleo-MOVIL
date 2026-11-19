import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { JobOffer } from '@/data/mock-data';
import { Brand, Radius, Space, Type } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { SectionHeader } from '@/components/ui/section-header';
import { TextField } from '@/components/ui/text-field';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonBlock } from '@/components/SkeletonBlock';
import { formatDate, pluralize } from '@/lib/format';

type JobStatusFilter = 'all' | 'active' | 'paused' | 'closed';

interface AdminJobsViewProps {
  jobs: JobOffer[];
  total: number;
  isLoading: boolean;
  onFilter: (status: JobStatusFilter) => Promise<void>;
  onSearch: (search: string) => Promise<void>;
  onToggleJob: (jobId: string) => Promise<void>;
}

const FILTERS: { key: JobStatusFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'active', label: 'Activas' },
  { key: 'paused', label: 'Pausadas' },
  { key: 'closed', label: 'Cerradas' },
];

export function AdminJobsView({
  jobs,
  total,
  isLoading,
  onFilter,
  onSearch,
  onToggleJob,
}: AdminJobsViewProps) {
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runFilter = async (status: JobStatusFilter) => {
    setError(null);
    try {
      await onFilter(status);
      await onSearch(search.trim());
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No fue posible filtrar vacantes.',
      );
    }
  };

  const handleToggle = async (job: JobOffer) => {
    setNotice(null);
    setError(null);
    setProcessingId(job.id);
    try {
      await onToggleJob(job.id);
      setNotice(
        job.status === 'active'
          ? `La vacante “${job.title}” quedó pausada.`
          : `La vacante “${job.title}” quedó activa.`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible actualizar la vacante.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SectionHeader
          overline="Oferta institucional"
          title="Vacantes"
          subtitle="Supervisa las ofertas publicadas por las empresas y su estado de difusión."
        />

        <View style={styles.searchRow}>
          <TextField
            label="Buscar vacante"
            placeholder="Título o empresa"
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
          {pluralize(total, 'vacante encontrada', 'vacantes encontradas')}
        </Text>

        {notice ? <Notice tone="success" message={notice} onDismiss={() => setNotice(null)} /> : null}
        {error ? <Notice tone="error" message={error} onDismiss={() => setError(null)} /> : null}

        {isLoading && jobs.length === 0 ? (
          <View style={styles.skeletons} accessibilityLabel="Cargando vacantes">
            {[0, 1, 2].map((item) => (
              <SkeletonBlock key={item} style={styles.skeleton} />
            ))}
          </View>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title="Sin vacantes"
            description="No hay vacantes que coincidan con este filtro."
          />
        ) : (
          <View style={styles.list}>
            {jobs.map((job) => {
              const busy = processingId === job.id;
              const canToggle = job.status !== 'closed';
              return (
                <View key={job.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.titleWrap}>
                      <Text style={styles.title}>{job.title}</Text>
                      <Text style={styles.company} numberOfLines={1}>
                        {job.companyName}
                      </Text>
                    </View>
                    <StatusBadge status={job.status} size="small" />
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Icon name="layers-outline" size={14} color={Brand.slateSoft} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {job.area}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="location-outline" size={14} color={Brand.slateSoft} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {job.location}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="calendar-outline" size={14} color={Brand.slateSoft} />
                      <Text style={styles.metaText}>{formatDate(job.deadline)}</Text>
                    </View>
                  </View>

                  <View style={styles.footerRow}>
                    <View style={styles.applicationsPill}>
                      <Icon name="document-text-outline" size={14} color={Brand.blue} />
                      <Text style={styles.applicationsText}>
                        {pluralize(job.applicationsCount ?? 0, 'postulación', 'postulaciones')}
                      </Text>
                    </View>
                    <Button
                      label={job.status === 'active' ? 'Pausar' : 'Reanudar'}
                      onPress={() => void handleToggle(job)}
                      loading={busy}
                      disabled={!canToggle || busy}
                      variant={job.status === 'active' ? 'danger' : 'primary'}
                      size="sm"
                      icon={job.status === 'active' ? 'pause' : 'play'}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
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
    height: 148,
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
    alignItems: 'flex-start',
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Type.heading,
    color: Brand.ink,
  },
  company: {
    ...Type.caption,
    fontSize: 11.5,
    color: Brand.slate,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
  },
  metaText: {
    ...Type.caption,
    fontSize: 11.5,
    color: Brand.slate,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  applicationsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Brand.blueTint,
    borderWidth: 1,
    borderColor: Brand.blueLine,
  },
  applicationsText: {
    ...Type.label,
    fontSize: 11,
    color: Brand.blue,
  },
});
