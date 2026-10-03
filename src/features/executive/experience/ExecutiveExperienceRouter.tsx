/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../../../security/AuthContext';
import { RoleService } from '../../../core/auth/RoleService';
import { AuthorizationService } from '../../../core/auth/AuthorizationService';
import { RoleLandingPage } from './RoleLandingPage';
import { Initiative } from '../../../types';

export interface ExecutiveExperienceRouterProps {
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
  onSelectInitiative?: (id: string) => void;
}

export const ExecutiveExperienceRouter: React.FC<ExecutiveExperienceRouterProps> = ({
  initiatives,
  onNavigateTab,
  onSelectInitiative,
}) => {
  const { currentUser, userProfile, effectiveRole } = useAuth();
  const eRole = RoleService.toEnterpriseRole(effectiveRole);
  const scope = AuthorizationService.resolveDataScope(eRole, userProfile, currentUser);

  // Filter initiatives by scope if applicable (e.g. for district or governorate isolated roles)
  const scopedInitiatives = initiatives.filter((init) =>
    AuthorizationService.isInitiativeInScope(init, scope)
  );

  return (
    <div id="executive-experience-router" className="w-full space-y-4">
      <RoleLandingPage
        role={eRole}
        initiatives={scopedInitiatives.length > 0 ? scopedInitiatives : initiatives}
        onNavigateTab={onNavigateTab}
        onSelectInitiative={onSelectInitiative}
      />
    </div>
  );
};

export default ExecutiveExperienceRouter;
