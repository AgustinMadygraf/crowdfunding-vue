<!--
Path: src/views/MilestoneDetailView.vue
-->

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMilestones } from '@/application/useMilestones';
import { content } from '@/infrastructure/content';

const route = useRoute();
const router = useRouter();
const { milestones } = useMilestones();
const milestoneDetailContent = content.milestoneDetailView;

const milestoneId = computed(() => Number(route.params.id));

const milestone = computed(() => {
  return milestones.value.find((m) => m.id === milestoneId.value);
});

const progress = computed(() => {
  if (!milestone.value || (milestone.value.targetAmount || 0) === 0) return 0;
  return Math.min(
    Math.round(((milestone.value.raisedAmount || 0) / (milestone.value.targetAmount || 1)) * 100),
    100,
  );
});

const statusBadgeClass = computed(() => {
  const map: Record<string, string> = {
    active: 'text-bg-success',
    pending: 'text-bg-warning',
    completed: 'text-bg-success'
  };
  return map[milestone.value?.status || ''] || 'text-bg-secondary';
});

const dependentMilestones = computed(() => {
  if (!milestone.value?.dependencies?.length) return [];
  return milestones.value.filter((m) => milestone.value!.dependencies?.includes(m.id));
});

const dependentOnThis = computed(() => {
  if (!milestone.value?.id) return [];
  return milestones.value.filter((m) => m.dependencies?.includes(milestone.value!.id));
});

onMounted(() => {
  if (milestone.value && milestone.value.name) {
    document.title = `${milestone.value.name} - Madypack`;
  }
});

const handleGoBack = () => {
  router.back();
};

const fetchMilestoneDetail = async () => {
  try {
    // ...existing code...
  } catch (error) {
    console.error('Error obteniendo detalle de milestone', error);
    // ...existing code...
  }
};
</script>

<template>
  <div v-if="milestone" class="min-vh-100 bg-light">
    <!-- Header -->
    <header class="bg-white border-bottom py-4 mb-4">
      <div class="container">
        <button class="btn btn-link p-0 mb-2 text-decoration-none" @click="handleGoBack" :aria-label="milestoneDetailContent.backLabel">
          {{ milestoneDetailContent.backLabel }}
        </button>
        <h1 class="mb-2 display-6 text-dark">{{ milestone.name }}</h1>
        <p v-if="milestone.description" class="mb-0 text-muted">{{ milestone.description }}</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container pb-5">
      <!-- Detalles -->
      <section class="mb-5">
        <h2 class="h4 fw-semibold border-bottom border-primary pb-2 mb-4">
          {{ milestoneDetailContent.infoTitle }}
        </h2>
        <div class="row g-4">
          <div v-if="milestone.details" class="col-12 col-lg-8">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <h3 class="h6 text-uppercase text-muted mb-3">{{ milestoneDetailContent.detailsTitle }}</h3>
                <p class="mb-0 text-body-emphasis">{{ milestone.details }}</p>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-4">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <h3 class="h6 text-uppercase text-muted mb-3">{{ milestoneDetailContent.statusTitle }}</h3>
                <dl class="row g-3 mb-0">
                  <div class="col-12">
                    <dt class="text-uppercase small fw-semibold text-muted">
                      {{ milestoneDetailContent.statsLabels.target }}
                    </dt>
                    <dd class="mb-0 fw-semibold text-dark">
                      {{ content.app.currencyLabel }} {{ (milestone.targetAmount || 0).toLocaleString() }}
                    </dd>
                  </div>
                  <div class="col-12">
                    <dt class="text-uppercase small fw-semibold text-muted">
                      {{ milestoneDetailContent.statsLabels.raised }}
                    </dt>
                    <dd class="mb-0 fw-semibold text-dark">
                      {{ content.app.currencyLabel }} {{ (milestone.raisedAmount || 0).toLocaleString() }}
                    </dd>
                  </div>
                  <div class="col-12">
                    <dt class="text-uppercase small fw-semibold text-muted">
                      {{ milestoneDetailContent.statsLabels.progress }}
                    </dt>
                    <dd class="mb-0">
                      <div class="progress-container mb-2">
                        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
                      </div>
                      <span class="small text-muted">{{ progress }}%</span>
                    </dd>
                  </div>
                  <div class="col-12">
                    <dt class="text-uppercase small fw-semibold text-muted">
                      {{ milestoneDetailContent.statsLabels.targetDate }}
                    </dt>
                    <dd class="mb-0 fw-semibold text-dark">
                      {{
                        new Date(milestone.targetDate).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      }}
                    </dd>
                  </div>
                  <div class="col-12">
                    <dt class="text-uppercase small fw-semibold text-muted">
                      {{ milestoneDetailContent.statsLabels.status }}
                    </dt>
                    <dd class="mb-0">
                      <span class="badge" :class="statusBadgeClass">
                        {{
                          milestone.status === 'active'
                            ? milestoneDetailContent.statusLabels.active
                            : milestone.status === 'pending'
                              ? milestoneDetailContent.statusLabels.pending
                              : milestoneDetailContent.statusLabels.completed
                        }}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Timeline -->
      <section v-if="milestone.timeline?.length" class="mb-5">
        <h2 class="h4 fw-semibold border-bottom border-primary pb-2 mb-4">
          {{ milestoneDetailContent.timelineTitle }}
        </h2>
        <ul class="list-unstyled m-0 d-grid gap-3">
          <li v-for="(item, idx) in milestone.timeline" :key="idx" class="d-flex gap-3">
            <div class="timeline-marker" :class="item.status"></div>
            <div class="timeline-content" :class="item.status">
              <time class="d-block small text-muted mb-1">
                {{ new Date(item.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }) }}
              </time>
              <h4 class="h6 mb-1 fw-semibold text-dark">{{ item.title }}</h4>
              <p class="mb-0 small text-muted">{{ item.description }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- Evidencias -->
      <section v-if="milestone.evidences?.length" class="mb-5">
        <h2 class="h4 fw-semibold border-bottom border-primary pb-2 mb-4">
          {{ milestoneDetailContent.evidencesTitle }}
        </h2>
        <div class="row g-3">
          <div v-for="evidence in milestone.evidences" :key="evidence.id" class="col-12 col-md-6 col-lg-4">
            <a
              :href="evidence.url"
              target="_blank"
              rel="noopener noreferrer"
              class="card h-100 text-decoration-none border"
            >
              <div class="card-body text-center">
                <i class="bi bi-file-earmark-text fs-2 text-primary" aria-hidden="true"></i>
                <h3 class="h6 mt-2 text-dark">{{ evidence.title }}</h3>
                <p v-if="evidence.description" class="small text-muted mb-2">{{ evidence.description }}</p>
                <span v-if="evidence.version" class="badge text-bg-light text-muted">v{{ evidence.version }}</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- Responsable -->
      <section v-if="milestone.responsible" class="mb-5">
        <h2 class="h4 fw-semibold border-bottom border-primary pb-2 mb-4">
          {{ milestoneDetailContent.responsibleTitle }}
        </h2>
        <div class="card shadow-sm">
          <div class="card-body">
            <p class="mb-0 text-body-emphasis">{{ milestone.responsible }}</p>
          </div>
        </div>
      </section>

      <!-- Dependencias -->
      <section v-if="dependentMilestones.length" class="mb-5">
        <h2 class="h4 fw-semibold border-bottom border-primary pb-2 mb-4">
          {{ milestoneDetailContent.dependenciesTitle }}
        </h2>
        <div class="list-group">
          <router-link
            v-for="m in dependentMilestones"
            :key="m.id"
            :to="`/etapas/${m.id}`"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <span>{{ m.name }}</span>
            <i class="bi bi-arrow-right text-muted" aria-hidden="true"></i>
          </router-link>
        </div>
      </section>

      <!-- Siguientes etapas -->
      <section v-if="dependentOnThis.length" class="mb-5">
        <h2 class="h4 fw-semibold border-bottom border-primary pb-2 mb-4">
          {{ milestoneDetailContent.dependentsTitle }}
        </h2>
        <div class="list-group">
          <router-link
            v-for="m in dependentOnThis"
            :key="m.id"
            :to="`/etapas/${m.id}`"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <span>{{ m.name }}</span>
            <i class="bi bi-arrow-right text-muted" aria-hidden="true"></i>
          </router-link>
        </div>
      </section>

      <!-- CTA -->
      <section class="mb-5">
        <div class="bg-primary text-white rounded-3 p-4 p-md-5 text-center">
          <h2 class="h4 fw-semibold mb-2">{{ milestoneDetailContent.ctaTitle }}</h2>
          <p class="mb-4">{{ milestoneDetailContent.ctaSubtitle }}</p>
          <router-link to="/suscribir" class="btn btn-light text-primary fw-semibold">
            {{ milestoneDetailContent.ctaButton }}
          </router-link>
        </div>
      </section>
    </main>
  </div>

  <!-- 404 -->
  <div v-else class="min-vh-100 bg-light d-flex align-items-center">
    <div class="container text-center py-5">
      <h1 class="mb-3">{{ milestoneDetailContent.notFoundTitle }}</h1>
      <p class="text-muted mb-4">{{ milestoneDetailContent.notFoundSubtitle }}</p>
      <router-link to="/etapas" class="btn btn-primary">
        {{ milestoneDetailContent.notFoundCta }}
      </router-link>
    </div>
  </div>
</template>

