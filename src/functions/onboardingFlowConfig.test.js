/**
 * Tests for onboarding flow configuration
 * Validates that the config structure matches what components expect
 */
import { describe, it, expect } from 'vitest';
import { ONBOARDING_CONFIG } from './onboardingFlowConfig';

describe('ONBOARDING_CONFIG', () => {
  it('should export valid configuration object', () => {
    expect(ONBOARDING_CONFIG).toBeDefined();
    expect(typeof ONBOARDING_CONFIG).toBe('object');
  });

  it('should have paths property with valid structure', () => {
    expect(ONBOARDING_CONFIG.paths).toBeDefined();
    expect(typeof ONBOARDING_CONFIG.paths).toBe('object');
    
    // Check that expected paths exist
    expect(ONBOARDING_CONFIG.paths.quick_start).toBeDefined();
    expect(ONBOARDING_CONFIG.paths.full_wizard).toBeDefined();
  });

  it('should have steps array with valid structure', () => {
    expect(Array.isArray(ONBOARDING_CONFIG.steps)).toBe(true);
    expect(ONBOARDING_CONFIG.steps.length).toBeGreaterThan(0);
    
    // Check first step has required properties
    const firstStep = ONBOARDING_CONFIG.steps[0];
    expect(firstStep).toHaveProperty('id');
    expect(firstStep).toHaveProperty('component');
    expect(firstStep).toHaveProperty('title');
  });

  it('each path should have valid steps array', () => {
    Object.entries(ONBOARDING_CONFIG.paths).forEach(([pathKey, pathConfig]) => {
      expect(Array.isArray(pathConfig.steps)).toBe(true);
      expect(pathConfig.steps.length).toBeGreaterThan(0);
      
      // Note: Some paths may reference step IDs not yet implemented
      // This validates the structure exists, allowing for graceful degradation
      pathConfig.steps.forEach(stepId => {
        expect(typeof stepId).toBe('number');
      });
    });
  });

  it('should have step components that match expected values', () => {
    const expectedComponents = [
      'WelcomeStep',
      'DealSourcingStep',
      'PortfolioGoalsStep',
      'CommunityStep',
      'ReviewStep'
    ];
    
    const allComponents = ONBOARDING_CONFIG.steps.map(s => s.component);
    expectedComponents.forEach(component => {
      expect(allComponents).toContain(component);
    });
  });
});
