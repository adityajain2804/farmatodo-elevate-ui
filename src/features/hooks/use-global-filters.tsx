import React, { createContext, useContext, useState } from 'react';
import { Country, GlobalFilterState, OfferMechanic, PrimeTier } from '../types';

const defaultFilters: GlobalFilterState = {
  country: 'Colombia',
  campaign: 'AWARE-2025-VIT',
  campaignType: 'awareness',
  sku: 'All', // Requirement 1: Global SKU filter
  category: 'All',
  region: 'All',
  mechanic: 'All',
  primeTier: 'All',
  dateRange: 'Planning Cutoff: 15 Jan - Campaign Start: 30 Jan',
  audienceType: 'personalized_segment',
  channel: 'All',
  lifecycle: 'all',
  selectedClusters: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
};

interface GlobalFilterContextType {
  filters: GlobalFilterState;
  setFilter: <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => void;
  resetFilters: () => void;
}

const GlobalFilterContext = createContext<GlobalFilterContextType>({
  filters: defaultFilters,
  setFilter: () => {},
  resetFilters: () => {}
});

export const GlobalFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<GlobalFilterState>(defaultFilters);

  const setFilter = <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  return (
    <GlobalFilterContext.Provider value={{ filters, setFilter, resetFilters }}>
      {children}
    </GlobalFilterContext.Provider>
  );
};

export const useGlobalFilters = () => useContext(GlobalFilterContext);
