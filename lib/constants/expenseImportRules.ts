import type { ExpenseCategory } from "./ExpenseCategories";

export type ExpenseImportRule = {
  id: string;
  category: ExpenseCategory;
  keywords: string[];
};

// Ordered matching rules for bank CSV imports. First match wins.
export const expenseImportRules: ExpenseImportRule[] = [
  {
    id: "food-grocery",
    category: "Food",
    keywords: ["BIEDRONKA", "LIDL", "ZABKA", "ALDI", "KAUFLAND", "CARREFOUR", "AUCHAN", "DELIKATESY", "SKLEP SPOZYWCZY", "PIEKARNIA", "BRONOWSCY"],
  },
  {
    id: "food-restaurants",
    category: "Food",
    keywords: ["MCDONALDS", "KFC", "BURGER", "PIZZA", "KEBAB", "RESTAURACJA", "BAR ", "KARCZMA", "CAFE", "SLIMAK", "FLERYNKA"],
  },
  {
    id: "health-pharmacy",
    category: "Health",
    keywords: ["APTEKA", "DOZ", "DR MAX", "ZIKO", "GEMINI", "MEDICO", "PRZYCHODNIA"],
  },
  {
    id: "transport-fuel",
    category: "Transport",
    keywords: ["ORLEN", "BP ", "SHELL", "CIRCLE K", "LOTOS", "MOYA", "PALIWO", "JAKDOJADE", "PKP", "MPK", "UBER", "BOLT"],
  },
  {
    id: "recurring-subscriptions",
    category: "Recurring",
    keywords: ["SPOTIFY", "NETFLIX", "YOUTUBE", "DISNEY", "HBO", "APPLE COM BILL", "APPLECOMBILL", "GOOGLE ", "CANVA", "ADOBE", "PAYPAL SPOTIFY"],
  },
  {
    id: "shopping-electronics",
    category: "Shopping",
    keywords: ["X KOM", "XKOM", "MEDIA EXPERT", "EURO RTV", "MEDIA MARKT", "ALIEXPRESS", "AMAZON", "EMPIK", "ROSSMANN", "HEBE", "RESERVED", "CCC"],
  },
  {
    id: "investment-platforms",
    category: "Investment",
    keywords: ["XTB", "TRADING212", "REVOLUT SECURITIES", "ETORO", "BINANCE", "BROKER", "INWEST"],
  },
];