// Feature flags come from the environment (a ConfigMap in Kubernetes), so they can change without a rebuild.
const flag = (name) => ['1', 'true', 'on'].includes(String(process.env[name] || '').toLowerCase());

export const features = {
  itemSearch: flag('FEATURE_ITEM_SEARCH'),
};
