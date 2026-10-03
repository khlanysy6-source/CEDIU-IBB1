/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Initiative } from '../../../types';
import { EnterpriseRole } from '../../../core/auth/types';
import { UnitHeadLanding } from './views/UnitHeadLanding';
import { ExecutiveManagerLanding } from './views/ExecutiveManagerLanding';
import { UnitRepresentativeLanding } from './views/UnitRepresentativeLanding';
import { GovernorLanding } from './views/GovernorLanding';
import { DistrictManagerLanding } from './views/DistrictManagerLanding';
import { CooperativeAdminLanding } from './views/CooperativeAdminLanding';
import { FieldEngineerLanding } from './views/FieldEngineerLanding';
import { SupervisionLanding } from './views/SupervisionLanding';
import { StudiesLanding } from './views/StudiesLanding';
import { VisitorLanding } from './views/VisitorLanding';

export interface RoleLandingPageProps {
  role: EnterpriseRole;
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
  onSelectInitiative?: (id: string) => void;
}

export const RoleLandingPage: React.FC<RoleLandingPageProps> = ({
  role,
  initiatives,
  onNavigateTab,
  onSelectInitiative,
}) => {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'UNIT_HEAD':
      return <UnitHeadLanding initiatives={initiatives} onNavigateTab={onNavigateTab} onSelectInitiative={onSelectInitiative} />;

    case 'EXECUTIVE_MANAGER':
      return <ExecutiveManagerLanding initiatives={initiatives} onNavigateTab={onNavigateTab} onSelectInitiative={onSelectInitiative} />;

    case 'UNIT_REPRESENTATIVE':
      return <UnitRepresentativeLanding initiatives={initiatives} onNavigateTab={onNavigateTab} onSelectInitiative={onSelectInitiative} />;

    case 'GOVERNOR':
    case 'GOVERNOR_VIEWER':
      return <GovernorLanding initiatives={initiatives} onNavigateTab={onNavigateTab} onSelectInitiative={onSelectInitiative} />;

    case 'DISTRICT_MANAGER':
      return <DistrictManagerLanding initiatives={initiatives} onNavigateTab={onNavigateTab} onSelectInitiative={onSelectInitiative} />;

    case 'COOPERATIVE_ADMIN':
      return <CooperativeAdminLanding initiatives={initiatives} onNavigateTab={onNavigateTab} onSelectInitiative={onSelectInitiative} />;

    case 'FIELD_ENGINEER':
      return <FieldEngineerLanding initiatives={initiatives} onNavigateTab={onNavigateTab} onSelectInitiative={onSelectInitiative} />;

    case 'SUPERVISION_MANAGER':
    case 'PROVINCIAL_SUPERVISION_MANAGER':
    case 'SUPERVISION_ENGINEER':
      return <SupervisionLanding initiatives={initiatives} onNavigateTab={onNavigateTab} onSelectInitiative={onSelectInitiative} />;

    case 'STUDIES_MANAGER':
    case 'PROVINCIAL_STUDIES_MANAGER':
    case 'STUDIES_ENGINEER':
      return <StudiesLanding initiatives={initiatives} onNavigateTab={onNavigateTab} onSelectInitiative={onSelectInitiative} />;

    case 'VISITOR':
    default:
      return <VisitorLanding initiatives={initiatives} onNavigateTab={onNavigateTab} onSelectInitiative={onSelectInitiative} />;
  }
};
