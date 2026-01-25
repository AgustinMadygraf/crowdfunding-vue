/*
Path: src/domain/content.ts
*/

export interface ContentLink {
  label: string;
  href: string;
}

export interface ContentFooterLogo {
  src: string;
  alt: string;
  width: number;
  text: string;
}

export interface ContentFooterLinks {
  title: string;
  items: ContentLink[];
}

export interface ContentSocialLink {
  label: string;
  short: string;
  href: string;
  aria: string;
}

export interface ContentFooterContact {
  title: string;
  emailLabel: string;
  email: string;
  social: ContentSocialLink[];
}

export interface ContentFooter {
  logo: ContentFooterLogo;
  links: ContentFooterLinks;
  contact: ContentFooterContact;
  copyright: string;
}

export interface ContentFaqItem {
  question: string;
  answer: string;
}

export interface ContentFaqSection {
  title: string;
  items: ContentFaqItem[];
}

export interface ContentHeroSection {
  title: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export type ContentMilestoneStatus = 'active' | 'pending' | 'completed' | 'delayed';
export type ContentEvidenceType = 'document' | 'image' | 'video' | 'link';
export type ContentTimelineStatus = 'completed' | 'in-progress' | 'pending';

export interface ContentEvidence {
  id: number;
  title: string;
  type: ContentEvidenceType;
  url: string;
  version?: string;
  publishedAt?: string;
  description?: string;
}

export interface ContentTimelineItem {
  date: string;
  title: string;
  description: string;
  status: ContentTimelineStatus;
}

export interface ContentMilestone {
  id: number;
  name: string;
  description: string;
  details: string;
  targetAmount: number;
  raisedAmount: number;
  targetDate: string;
  status: ContentMilestoneStatus;
  dependencies?: number[];
  responsible: string;
  published: boolean;
  evidences: ContentEvidence[];
  timeline: ContentTimelineItem[];
}

export interface ContentContributionLevel {
  amount: number;
  benefit: number;
  name: string;
}

export type ContentUpdateCategory = 'comercial' | 'tecnico' | 'logistica' | 'legal' | 'general';
export type ContentUpdateStatus = 'published' | 'draft' | 'archived';

export interface ContentUpdate {
  id: number;
  category: ContentUpdateCategory;
  title: string;
  excerpt: string;
  content: string;
  status: ContentUpdateStatus;
  publishedAt: string;
}

export interface ContentNavigation {
  ariaLabel: string;
  logoAlt: string;
  links: ContentLink[];
  authLink: ContentLink;
}

export interface ContentMilestonesSection {
  title: string;
  subtitle: string;
  summaryLabels: {
    progress: string;
    raised: string;
    target: string;
  };
}

export interface ContentMilestoneCard {
  labels: {
    target: string;
    raised: string;
    targetDate: string;
  };
  viewDetailsLabel: string;
}

export interface ContentMilestoneModal {
  ariaLabelPrefix: string;
  closeLabel: string;
  progressTitle: string;
  timelineTitle: string;
  evidencesTitle: string;
  responsibleTitle: string;
  dependenciesTitle: string;
  dependenciesPrefix: string;
  statusLabels: {
    active: string;
    pending: string;
    completed: string;
  };
  statsLabels: {
    target: string;
    raised: string;
    targetDate: string;
    status: string;
  };
  footerLabels: {
    details: string;
    close: string;
  };
}

export interface ContentMilestonesView {
  heroTitle: string;
  heroSubtitle: string;
  heroAmountSeparator: string;
  evidencesTitle: string;
  evidencesSubtitle: string;
}

export interface ContentMilestoneDetailView {
  backLabel: string;
  infoTitle: string;
  detailsTitle: string;
  statusTitle: string;
  statsLabels: {
    target: string;
    raised: string;
    progress: string;
    targetDate: string;
    status: string;
  };
  timelineTitle: string;
  evidencesTitle: string;
  responsibleTitle: string;
  dependenciesTitle: string;
  dependentsTitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  notFoundTitle: string;
  notFoundSubtitle: string;
  notFoundCta: string;
  statusLabels: {
    active: string;
    pending: string;
    completed: string;
  };
}

export interface ContentContributionSection {
  title: string;
  subtitle: string;
  benefitLabel: string;
  selectionTitle: string;
  selectionAmountLabel: string;
  selectionBenefitLabel: string;
  continueLabel: string;
  disclaimer: string;
}

export interface ContentUpdatesSection {
  title: string;
  nextUpdateLabel: string;
  nextUpdateDate: string;
  placeholder: string;
}

export interface ContentUpdateCard {
  categoryLabels: Record<string, string>;
  readMoreLabel: string;
}

export interface ContentUpdatesView {
  heroTitle: string;
  heroSubtitle: string;
  statsLabel: string;
  categoryFilters: Record<string, string>;
  emptyState: string;
  modalCloseLabel: string;
}

export interface ContentDocumentsView {
  heroTitle: string;
  heroSubtitle: string;
  loadingLabel: string;
  retryLabel: string;
  errorFallback: string;
  emptyTitle: string;
  emptySubtitle: string;
  downloadLabel: string;
  uncategorizedLabel: string;
  categoryOrder: string[];
}

export interface ContentSubscribeView {
  heroTitle: string;
  heroSubtitle: string;
  authModalTitle: string;
  authModalSubtitle: string;
  authModalClose: string;
  greetingLabel: string;
  dashboardLink: string;
  levelSelectedTitle: string;
  levelBenefitLabel: string;
  changeLevelLabel: string;
  levelSelectorTitle: string;
  authConfirmTitle: string;
  authPrompt: string;
  authPromptButton: string;
  submitLabel: string;
  submitLoadingLabel: string;
  successTitle: string;
  successSubtitle: string;
  summaryTitle: string;
  summaryNameLabel: string;
  summaryEmailLabel: string;
  summaryLevelLabel: string;
  summaryAmountLabel: string;
  payLabel: string;
  payLoadingLabel: string;
  payNote: string;
  errors: {
    loadPayment: string;
    missingLevel: string;
    missingUser: string;
    validationFailed: string;
    expiredSession: string;
    forbidden: string;
    serverError: string;
    createContribution: string;
    unknownContribution: string;
    missingToken: string;
    missingLevelPayment: string;
    paymentInit: string;
  };
}

export interface ContentSubscribePaymentView {
  headerTitle: string;
  greetingLabel: string;
  loadingLabel: string;
  retryLabel: string;
  detailsTitle: string;
  statusLabels: Record<string, string>;
  detailLabels: {
    level: string;
    amount: string;
    created: string;
    completed: string;
    token: string;
  };
  payment: {
    pendingTitle: string;
    pendingSubtitle: string;
    pendingButton: string;
    processingTitle: string;
    processingSubtitle: string;
    processingButton: string;
    completedTitle: string;
    completedSubtitle: string;
    completedNote: string;
    failedTitle: string;
    failedSubtitle: string;
    failedButton: string;
    cancelledTitle: string;
    cancelledSubtitle: string;
    cancelledButton: string;
  };
  infoHelpTitle: string;
  infoHelpSubtitle: string;
  notFoundLabel: string;
  notFoundCta: string;
  authInfoPrefix: string;
  authInfoLink: string;
  authInfoSuffix: string;
  errors: {
    emptyToken: string;
    loadContribution: string;
    paymentInfo: string;
    paymentInit: string;
  };
}

export interface ContentSubscriptionStatusView {
  heroTitle: string;
  idLabel: string;
  loadingLabel: string;
  errorTitle: string;
  retryLabel: string;
  backHomeLabel: string;
  statusTitle: string;
  detailLabels: {
    level: string;
    amount: string;
    created: string;
    completed: string;
    token: string;
  };
  statusLabels: Record<string, string>;
  explanationTitle: string;
  explanations: Record<string, string>;
  actions: {
    completePayment: string;
    refreshStatus: string;
    contactSupport: string;
  };
  errors: {
    emptyId: string;
  };
}

export interface ContentUserDashboardView {
  title: string;
  greetingLabel: string;
  logoutLabel: string;
  loadingLabel: string;
  retryLabel: string;
  contributionsTitle: string;
  contributionsPrefix: string;
  contributionsSingle: string;
  contributionsPlural: string;
  statusLabel: string;
  completedAtLabel: string;
  viewDetailsLabel: string;
  payLabel: string;
  totalContributedLabel: string;
  completedPaymentsLabel: string;
  pendingPaymentsLabel: string;
  emptyTitle: string;
  emptySubtitle: string;
  emptyCta: string;
  newContributionLabel: string;
  statusLabels: Record<string, string>;
  errors: {
    userLoad: string;
  };
}

export interface ContentAdminView {
  title: string;
  logoutLabel: string;
  authRequired: string;
  authCta: string;
  loadingLabel: string;
  retryLabel: string;
  tabDashboard: string;
  tabMilestones: string;
  tabUpdates: string;
  statsTitles: {
    totalMilestones: string;
    activeMilestones: string;
    completedMilestones: string;
    totalUpdates: string;
    status: string;
  };
  statsLabels: {
    activeMilestones: string;
    publishedUpdates: string;
    statusOk: string;
  };
  shortcutsTitle: string;
  shortcuts: {
    milestones: string;
    updates: string;
    support: string;
  };
  milestonesTitle: string;
  milestonesEmpty: string;
  updatesTitle: string;
  updatesEmpty: string;
  milestoneLabels: {
    target: string;
    raised: string;
  };
  updateLabels: {
    published: string;
  };
  errors: {
    loadData: string;
    fetchAdmin: string;
  };
}

export interface ContentNotFoundView {
  title: string;
  subtitle: string;
  cta: string;
}

export interface ContentGoogleAuth {
  logoutLabel: string;
  errors: {
    missingToken: string;
    unknownAuth: string;
    logoutFailed: string;
    oauthConfig: string;
    oauthMissing: string;
    oauthMissingDetails: string;
    initFailed: string;
    initTimeout: string;
    initUnexpected: string;
    mountUnexpected: string;
  };
}

export interface ContentAuth {
  google: ContentGoogleAuth;
}

export interface ContentAppHeader {
  navAriaLabel: string;
  logoAlt: string;
}

export interface ContentApp {
  header: ContentAppHeader;
  navigation: ContentNavigation;
  footer: ContentFooter;
  currencyLabel: string;
}

export interface ContentHome {
  hero: ContentHeroSection;
  faq: ContentFaqSection;
  contribution: ContentContributionSection;
  milestonesSection: ContentMilestonesSection;
  milestoneCard: ContentMilestoneCard;
  milestoneModal: ContentMilestoneModal;
  updatesSection: ContentUpdatesSection;
  updateCard: ContentUpdateCard;
}

export interface ContentData {
  milestones: ContentMilestone[];
  contributionLevels: ContentContributionLevel[];
  updates: ContentUpdate[];
}

export interface Content {
  app: ContentApp;
  auth: ContentAuth;
  home: ContentHome;
  milestonesView: ContentMilestonesView;
  milestoneDetailView: ContentMilestoneDetailView;
  updatesView: ContentUpdatesView;
  documentsView: ContentDocumentsView;
  subscribeView: ContentSubscribeView;
  subscribePaymentView: ContentSubscribePaymentView;
  subscriptionStatusView: ContentSubscriptionStatusView;
  userDashboardView: ContentUserDashboardView;
  adminView: ContentAdminView;
  notFoundView: ContentNotFoundView;
  data: ContentData;
}
