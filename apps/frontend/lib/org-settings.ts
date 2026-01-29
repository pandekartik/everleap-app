// Organization settings - shared between settings page and forms
// In a real app, this would come from the backend API

export const ORG_SETTINGS = {
    departments: [
        "Engineering",
        "Product",
        "Marketing",
        "Sales",
        "Design",
        "HR",
        "Finance",
        "Operations"
    ],
    defaultCurrency: "USD" as "USD" | "INR" | "EUR",
};

export const CURRENCY_OPTIONS = [
    { value: "USD" as const, label: "US Dollar ($)", symbol: "$" },
    { value: "INR" as const, label: "Indian Rupee (₹)", symbol: "₹" },
    { value: "EUR" as const, label: "Euro (€)", symbol: "€" },
];

export type Currency = "USD" | "INR" | "EUR";
