import React, { useState } from 'react';
import { GlobalFilterProvider } from './hooks/use-global-filters';
import { AppShell } from './components/layout/AppShell';
import { CampaignStudioRoute } from './routes';
import { AnalyticsRoute } from './routes/analytics';
import { CausalDeepDiveRoute } from './routes/causal';
import { CampaignAuditRoute } from './routes/campaign';
import { KnowledgeGraphRoute } from './routes/graph';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('studio');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'studio':
        return <CampaignStudioRoute />;
      case 'analytics':
        return <AnalyticsRoute />;
      case 'causal':
        return <CausalDeepDiveRoute />;
      case 'campaign':
        return <CampaignAuditRoute />;
      case 'graph':
        return <KnowledgeGraphRoute />;
      default:
        return <CampaignStudioRoute />;
    }
  };

  return (
    <GlobalFilterProvider>
      <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderTabContent()}
      </AppShell>
    </GlobalFilterProvider>
  );
};
export default App;
