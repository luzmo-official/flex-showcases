export const getLuzmoLoaderStyles = (): {
  loaderBackground: string;
  loaderFontColor: string;
  loaderSpinnerColor: string;
  mainColor: string;
  accentColor: string;
} => ({
  loaderBackground: getComputedStyle(document.body).getPropertyValue('--color-surface').trim(),
  loaderFontColor: getComputedStyle(document.body).getPropertyValue('--color-text').trim(),
  loaderSpinnerColor: getComputedStyle(document.body).getPropertyValue('--color-primary').trim(),
  mainColor: getComputedStyle(document.body).getPropertyValue('--color-primary').trim(),
  accentColor: getComputedStyle(document.body).getPropertyValue('--color-secondary').trim()
});

export const availablePredefinedDashboards: {
  id: string;
  translationKey: string;
  dashboardId: string;
  edeDashboardId: string;
  type: 'predefined';
}[] = [
  {
    id: 'funnel_pipeline',
    translationKey: 'performance.funnel-pipeline',
    dashboardId: 'f32191db-1697-4f9a-851b-26ac91ef9898',
    edeDashboardId: '9db1e0e3-452e-4dd6-9213-43902f8de106',
    type: 'predefined'
  },
  {
    id: 'won_deals_revenue',
    translationKey: 'performance.won-deals-revenue',
    dashboardId: '9a47cc0b-5eb2-4294-bc65-c15fb79ca8ce',
    edeDashboardId: 'd8edf7f1-5bf3-436e-b79e-c79456b78506',
    type: 'predefined'
  }
];
