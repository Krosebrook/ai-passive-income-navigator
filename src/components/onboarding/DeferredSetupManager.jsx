import React from 'react';
import DeferredSetupPrompt from './DeferredSetupPrompt';
import { 
  IndustryPreferencesModal, 
  DealStructuresModal,
  GeographicPreferencesModal,
  NotificationPreferencesModal 
} from './DeferredSetupModals';
import { useDeferredSetup } from './useDeferredSetup';

/**
 * Central manager for all deferred setup prompts and modals
 * Place this component once in your app layout or main pages
 */
export default function DeferredSetupManager() {
  const {
    preferences,
    activePrompt,
    activeModal,
    openSetupModal,
    closePrompt,
    closeModal,
    completeSetup
  } = useDeferredSetup();

  const promptConfig = {
    industries: {
      title: 'Refine Your Deal Discovery',
      description: 'Select target industries to see more relevant opportunities',
      benefit: 'Get 3x more relevant deals by specifying your industry focus'
    },
    deal_structures: {
      title: 'Customize Deal Matching',
      description: 'Choose your preferred deal structures for better matches',
      benefit: 'See deals that match your investment style and preferences'
    },
    geo_preferences: {
      title: 'Set Geographic Focus',
      description: 'Choose regions where you want to discover opportunities',
      benefit: 'Filter out irrelevant deals from regions you\'re not interested in'
    },
    notifications: {
      title: 'Manage Your Updates',
      description: 'Control how often you receive deal notifications',
      benefit: 'Stay informed without feeling overwhelmed'
    }
  };

  return (
    <>
      {/* Deferred Setup Prompt */}
      {activePrompt && (
        <DeferredSetupPrompt
          open={true}
          onClose={closePrompt}
          onSetupNow={() => openSetupModal(activePrompt.type)}
          title={promptConfig[activePrompt.type]?.title}
          description={promptConfig[activePrompt.type]?.description}
          benefit={promptConfig[activePrompt.type]?.benefit}
          setupType={activePrompt.type}
        />
      )}

      {/* Setup Modals */}
      <IndustryPreferencesModal
        open={activeModal === 'industries'}
        onClose={closeModal}
        onComplete={completeSetup}
        initialData={preferences?.target_industries || []}
      />

      <DealStructuresModal
        open={activeModal === 'deal_structures'}
        onClose={closeModal}
        onComplete={completeSetup}
        initialData={preferences?.preferred_deal_structures || []}
      />

      <GeographicPreferencesModal
        open={activeModal === 'geo_preferences'}
        onClose={closeModal}
        onComplete={completeSetup}
        initialData={preferences?.geo_preferences || []}
      />

      <NotificationPreferencesModal
        open={activeModal === 'notifications'}
        onClose={closeModal}
        onComplete={completeSetup}
        initialData={preferences || {}}
      />
    </>
  );
}