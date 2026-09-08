import { useAppSelector } from '../app/hooks';

export const checkUserPermission = (user: any, permissionKey: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;

    const permissions: string[] = user.permissions || [];
    if (permissions.includes('*')) return true;

    return permissions.includes(permissionKey);
};

export const checkUserAnyPermission = (user: any, permissionKeys: string[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;

    const permissions: string[] = user.permissions || [];
    if (permissions.includes('*')) return true;

    return permissionKeys.some((key) => permissions.includes(key));
};

export const useHasPermission = (permissionKey: string): boolean => {
    const user = useAppSelector((state) => state.auth.user);
    return checkUserPermission(user, permissionKey);
};

export const useHasAnyPermission = (permissionKeys: string[]): boolean => {
    const user = useAppSelector((state) => state.auth.user);
    return checkUserAnyPermission(user, permissionKeys);
};

export const useHasAllPermissions = (permissionKeys: string[]): boolean => {
    const user = useAppSelector((state) => state.auth.user);
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;

    const permissions: string[] = user.permissions || [];
    if (permissions.includes('*')) return true;

    return permissionKeys.every((key) => permissions.includes(key));
};
