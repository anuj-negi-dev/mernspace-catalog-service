export const isAllowed = (tenant: string, tenantId: string) => {
    if (tenant !== tenantId) {
        return false;
    }
    return true;
};
