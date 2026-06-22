// Mirrors modules/services/invoicing/paystack_subaccount_service.py
// PaystackSubaccountService.BANK_NAME_MAP exactly — there's no banks-list
// endpoint on the backend, so this is the same fixed map the backend itself
// resolves bank_name from. Keep in sync if that map changes.
export const NIGERIAN_BANKS: { code: string; name: string }[] = [
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "044", name: "Access Bank" },
  { code: "063", name: "Diamond Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "215", name: "Unity Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "221", name: "Stanbic IBTC" },
  { code: "068", name: "Standard Chartered" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank" },
  { code: "033", name: "UBA" },
  { code: "035", name: "Wema Bank" },
  { code: "000014", name: "Zenith Bank" },
  { code: "50211", name: "Kuda Bank" },
  { code: "090267", name: "Kuda Microfinance" },
];
