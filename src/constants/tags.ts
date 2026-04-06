export const ALLOWED_TAGS = [
  'Debt collection',
  'Consumer Loan',
  'Credit card or prepaid card',
  'Mortgage',
  'Vehicle loan or lease',
  'Student loan',
  'Payday loan, title loan, or personal loan',
  'Checking or savings account',
  'Bank account or service',
  'Money transfer, virtual currency, or money service',
  'Money transfers',
  'Other financial services'
] as const;

export const LABEL_DESCRIPTIONS: Record<typeof ALLOWED_TAGS[number], string> = {
  "Debt collection": "False claims by creditors, unauthorized charges, bank refusing to honor disputes, absurd late fees on contested balances",
  "Consumer Loan": "Personal or vehicle loans set up fraudulently, dealer financing fraud, unauthorized loan in consumer's name, installment lending issues",
  "Credit card or prepaid card": "Bait and switch on fees, annual fee disputes, billing fraud, rewards issues, stolen prepaid card funds, military-targeted offers",
  "Mortgage": "Home foreclosure disputes, loan modification denials, VA loan issues, Bank of America/servicer misconduct, escrow and refinancing problems",
  "Vehicle loan or lease": "Auto loans and leases: payments, repossession, GAP insurance, dealer financing disputes, lease terms",
  "Student loan": "Scam consolidation services charging unauthorized fees, repayment plan confusion, federal/private loan servicing, forgiveness program issues",
  "Payday loan, title loan, or personal loan": "Harassing collection calls about unknown debts, payday/title/personal loan disputes, high-interest short-term lending, no proof of debt",
  "Checking or savings account": "Account access issues, fees, opening/closing disputes, fraud on checking or savings account",
  "Bank account or service": "Mortgage modification disputes via bank, account access, mailing errors by bank, general banking service complaints",
  "Money transfer, virtual currency, or money service": "PayPal/Venmo account limitations, funds held arbitrarily, wire transfers, remittances, virtual currency, military members abroad",
  "Money transfers": "Wire transfers, money orders, remittance disputes, delayed or lost transfers",
  "Other financial services": "Old uncashed checks, stale dividend payments, unclaimed funds, credit report disputes, credit repair, foreign exchange, services not covered by other categories",
}

export const FEW_SHOT_EXAMPLES: { tag: typeof ALLOWED_TAGS[number]; claim: string }[] = [
  {
    tag: "Consumer Loan",
    claim: "I had a loan with XXXX Greensky XXXX Our bank shows that the amount is paid and I called to confirm that there is a XXXX balance on my account but Transition and Greensky says that the information is accurate with a XXXX balance.",
  },
  {
    tag: "Other financial services",
    claim: "I feel that trans union is artificially holding my credit at a lower level to force me to pay higher interest rates. I will be forwarding a copy of my credit report to both the U.S Attorney and the Nevada States Attorney.",
  },
  {
    tag: "Payday loan, title loan, or personal loan",
    claim: "Been getting harrassing calls from Monterey Financial Collections about a debt I have no idea about. They put it in collections without ever sending me anything in the mail to prove to me I owe anything.",
  },
  {
    tag: "Bank account or service",
    claim: "M & t bank customer service Claims a credit card can not be issued without a chip. The card is constantly denied! Poor customer service with XXXX, XXXX and XXXX. Refused give me the president!",
  },
  {
    tag: "Mortgage",
    claim: "Wells Fargo has ruined our life, by denying a payment paid to them via our checking account at Wells Fargo to Wells Fargo Mortgage. Then slapping enormous amount of late fees and what not. This is my third complaint to you, but you are also not helping.",
  },
  {
    tag: "Credit card or prepaid card",
    claim: "BAIT AND SWITCH. Barclays lured military members into signing up for a credit card by waiving the annual fee while on XXXX XXXX. Then once established as a customer they imposed an annual fee of {$1000.00}.",
  },
  {
    tag: "Debt collection",
    claim: "A charge was made by a company making false claims for a product and also added an additional product not purchased. The bank will not honor my dispute and is charging me absurd late fees on balance not paid.",
  },
  {
    tag: "Student loan",
    claim: "I will need to send you the information because it takes place over several years and will not fit in this space. Happy to provide it, just not enough room here. Thanks.",
  },
  {
    tag: "Money transfers",
    claim: "An unkown friend put money into my account. I could not identify the source, the bank took my money. The bank does not know where the money came from. I want my money back.",
  },
  {
    tag: "Credit card or prepaid card",
    claim: "On XX/XX/XXXX my Paypal Prepaid card stop being able to transfer funds from my paypal to my prepaid card, it just says it is unable to complete the transaction, And today XX/XX/XXXX it is still in that same mode and getting the same error.",
  },
  {
    tag: "Other financial services",
    claim: "Calling me on my job and submitting personal information to co-workers in reference to the debt. Also, the debt collector's attitude and style of questioning was very unprofessional. I felt I was being interrogated while working.",
  },
]