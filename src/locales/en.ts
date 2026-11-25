// English is the default and fallback interface locale. Learning content stays in the catalog.
export const en = {
  common: {
    appName: 'ReflexVocab',
    loading: 'Loading…',
    retry: 'Try again',
    skipToContent: 'Skip to main content',
  },
  nav: {
    label: 'Main navigation',
    home: 'ReflexVocab — Today',
    today: 'Today',
    learn: 'Learn',
    practice: 'Practice',
    library: 'Library',
    progress: 'Progress',
    settings: 'Settings',
  },
  config: {
    title: 'ReflexVocab is not configured',
    missing: 'Add the Supabase project URL and publishable key to .env.local, then restart the development server.',
    invalid: 'The Supabase configuration is invalid. Use the project URL and an sb_publishable_ key, never a secret key.',
  },
  signIn: {
    heroLabel: 'About ReflexVocab',
    heroTitle: 'Learn in phrases.\nRemember for longer.',
    heroBody: 'TOEIC vocabulary learned in context and reviewed just before you would forget it.',
    sampleTopic: 'Meetings',
    sampleProgress: '3/10',
    samplePrompt: 'We need to ___ the workshop until Friday.',
    title: 'Welcome back.',
    subtitle: 'Sign in to continue your learning path.',
    tagline: 'Learn in phrases. Remember for longer.',
    email: 'Email',
    password: 'Password',
    submit: 'Start learning',
    submitting: 'Signing in…',
    privateNotice: 'For provisioned accounts only.',
    errors: {
      required: 'Enter your email and password.',
      unauthenticated: 'The email or password is incorrect.',
      unavailable: 'The sign-in service could not be reached. Check your connection and try again.',
    },
  },
  account: {
    loading: 'Loading your learning data…',
    loadFailed: 'Your learning data could not be loaded.',
    loadFailedBody: 'Check your connection and try again. Nothing has been changed.',
    sessionEnded: 'Your sign-in has ended. Sign in again to continue.',
  },
  today: {
    title: 'Today',
    subtitle: 'Review what you have learned and continue with your topics.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Adjust just enough to make each session easier to start.',
    account: {
      title: 'Account',
      body: 'You are signed in with a provisioned account. Progress is saved to this account.',
      signOut: 'Sign out',
      signingOut: 'Signing out…',
      signOutFailed: 'Sign-out failed. Try again.',
    },
  },
  notFound: {
    title: 'Page not found',
    body: 'This address does not match a ReflexVocab page.',
    action: 'Go to Today',
  },
};

type Messages<T> = { [K in keyof T]: T[K] extends string ? string : Messages<T[K]> };
export type MessageCatalog = Messages<typeof en>;
