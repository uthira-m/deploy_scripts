import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isCommander = user?.role === 'commander';
  const isPersonnel = user?.role === 'personnel';
  
  return {
    // Role checks
    isAdmin,
    isCommander,
    isPersonnel,
    
    // Permission checks
    canModify: isAdmin || isCommander, // Admin and Commander can create/edit/delete
    canView: true, // All authenticated users can view
    canEditProfile: isAdmin || isCommander, // Admin and Commander can edit profiles
    canAssignCompany: isAdmin, // Only admin can assign personnel to companies
    
    // User data
    role: user?.role,
    profileId: user?.profile_id,
    userId: user?.id,
    
    // Helper functions
    canAccessOwnProfile: (profileId: number) => {
      // Admin can access any profile
      if (isAdmin) return true;
      // Commander and Personnel can only access their own profile
      return user?.profile_id === profileId;
    },
    
    shouldShowActions: isAdmin || isCommander, // Show action buttons for admin and commander
  };
}






