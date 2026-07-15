export const Roles = {
    Admin: 'admin',
    Customer: 'customer',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
//its just take all of its values, and create a type from them
//"admin" | "user";
// so te can be compared like this
// function createUser(role: Role) {}
