export const isAllowed = (tenant: string, tenantId: string) => {
    if (tenant !== tenantId) {
        throw new Error("You are not allowed to crate a topping");
    }
};
