const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withUpiQueries(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    if (!androidManifest['queries']) {
      androidManifest['queries'] = [];
    }

    const queries = androidManifest['queries'][0] || { intent: [] };
    if (!queries.intent) {
      queries.intent = [];
    }

    const hasUpi = queries.intent.some(intent => 
      intent.data && intent.data.some(data => data.$ && data.$['android:scheme'] === 'upi')
    );

    if (!hasUpi) {
      queries.intent.push({
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        data: [{ $: { 'android:scheme': 'upi' } }]
      });
    }

    androidManifest['queries'][0] = queries;

    return config;
  });
};
