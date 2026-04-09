import {
  Clock,
  LogOut,
  Info,
  KeyRound,
  Dog,
  Baby,
  CreditCard,
} from "lucide-react";

// Each policy "tile" — an icon, a title, and one or more lines of detail
type PolicyItem = {
  icon: React.ReactNode;
  title: string;
  details: string[];
};

const POLICIES: PolicyItem[] = [
  {
    icon: <Clock size={18} aria-hidden="true" />,
    title: "Check-in",
    details: [
      "From 3:00 PM — anytime after",
      "Minimum check-in age: 18",
    ],
  },
  {
    icon: <LogOut size={18} aria-hidden="true" />,
    title: "Check-out",
    details: ["Before 12:00 PM (noon)"],
  },
  {
    icon: <Info size={18} aria-hidden="true" />,
    title: "Special check-in instructions",
    details: [
      "Front desk staff will greet guests on arrival",
      "Information may be translated using automated tools",
    ],
  },
  {
    icon: <KeyRound size={18} aria-hidden="true" />,
    title: "Access methods",
    details: ["Staffed front desk"],
  },
  {
    icon: <Dog size={18} aria-hidden="true" />,
    title: "Pets",
    details: [
      "Pets not allowed",
      "Service animals are welcome and exempt from fees",
    ],
  },
  {
    icon: <Baby size={18} aria-hidden="true" />,
    title: "Children & extra beds",
    details: [
      "Children are welcome",
      "Rollaway/extra beds are not available",
      "Cribs (infant beds) are not available",
    ],
  },
];

// Payment method names shown as simple labelled badges — cleaner than the Figma SVG exports
const PAYMENT_METHODS = ["Visa", "Mastercard", "Diners Club", "JCB", "PayPal"];

export default function PoliciesSection() {
  return (
    <div className="bg-card rounded-xl shadow-sm p-6 flex flex-col gap-6">

      {/* Policy grid — 1 column on mobile, 2 on md+, 3 on lg+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {POLICIES.map((policy) => (
          <div
            key={policy.title}
            className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-border"
          >
            {/* Icon + title row */}
            <div className="flex items-center gap-2 text-foreground">
              <span className="shrink-0">{policy.icon}</span>
              <span className="font-bold text-sm">{policy.title}</span>
            </div>

            {/* Detail lines */}
            <ul className="flex flex-col gap-1">
              {policy.details.map((line) => (
                <li key={line} className="text-xs text-muted-foreground leading-normal">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Payment types — full-width row of badges */}
      <div className="flex flex-col gap-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-foreground">
          <CreditCard size={18} className="shrink-0" aria-hidden="true" />
          <span className="font-bold text-sm">Accepted payment methods</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((method) => (
            <span
              key={method}
              className="px-3 py-1 rounded-full border border-border text-xs font-medium text-foreground bg-card"
            >
              {method}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
