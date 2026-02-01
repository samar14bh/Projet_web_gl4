import { Member, Application } from './club-manager.interface';

/**
 * Main page state for manage-members component
 */
export interface ManageMembersState {
    clubId: number | null;
    activeTab: string;
    loading: boolean;
    searchQuery: string;
    membersPage: number;
    applicationsPage: number;
    applicationStatus: string;
}

/**
 * State for role assignment modal
 */
export interface MemberModal {
    show: boolean;
    selectedMember: Member | null;
    selectedRole: string;
}

/**
 * State for remove member modal
 */
export interface RemoveModal {
    show: boolean;
    selectedMember: Member | null;
}

/**
 * State for application details modal
 */
export interface ApplicationModal {
    show: boolean;
    selectedApplication: Application | null;
}
