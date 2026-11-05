/**
 * Comprehensive Financial Entity & Payment Service Provider (PSP) Resolver
 * Resolves banks, payment gateways, UPI applications (Google Pay, PhonePe, Paytm, etc.),
 * and regulatory clearing houses (NPCI) for cyber crime notice letters under Section 94 BNSS.
 */

export interface ResolvedEntityInfo {
  resolvedName: string;
  category: 'bank' | 'upi_app' | 'wallet' | 'npci' | 'other';
  commonAlternatives: string[];
}

/**
 * Resolves the official recipient entity name for notice letters
 * based on bank name, account number / UPI VPA, and remarks.
 */
export function resolveEntityOrBank(
  rawBank?: string,
  rawAccount?: string,
  rawRemarks?: string
): string {
  const bank = (rawBank || '').trim();
  const account = (rawAccount || '').trim();
  const remarks = (rawRemarks || '').trim();

  const bLow = bank.toLowerCase();
  const aLow = account.toLowerCase();
  const rLow = remarks.toLowerCase();

  // 1. Google / Google Pay / GPay
  if (
    bLow.includes('google') ||
    bLow.includes('gpay') ||
    bLow.includes('g-pay') ||
    bLow.includes('g pay') ||
    rLow.includes('google') ||
    rLow.includes('gpay') ||
    aLow.includes('@okaxis') ||
    aLow.includes('@okhdfcbank') ||
    aLow.includes('@oksbi') ||
    aLow.includes('@okicici') ||
    aLow.includes('@okbizaxis')
  ) {
    return 'Google Pay (Google India Digital Services Pvt. Ltd.)';
  }

  // 2. PhonePe
  if (
    bLow.includes('phonepe') ||
    bLow.includes('phone pe') ||
    bLow.includes('phone-pe') ||
    rLow.includes('phonepe') ||
    aLow.includes('@ybl') ||
    aLow.includes('@ibl') ||
    aLow.includes('@axl')
  ) {
    return 'PhonePe (PhonePe Private Limited)';
  }

  // 3. Paytm / One97
  if (
    bLow.includes('paytm') ||
    bLow.includes('one97') ||
    bLow.includes('one 97') ||
    rLow.includes('paytm') ||
    aLow.includes('@paytm')
  ) {
    return 'Paytm Payments Bank / One97 Communications Ltd.';
  }

  // 4. Amazon Pay
  if (
    bLow.includes('amazon') ||
    rLow.includes('amazon') ||
    aLow.includes('@apl') ||
    aLow.includes('@rapl')
  ) {
    return 'Amazon Pay (India) Private Limited';
  }

  // 5. BharatPe / Resilient
  if (
    bLow.includes('bharatpe') ||
    bLow.includes('bharat pe') ||
    bLow.includes('resilient') ||
    rLow.includes('bharatpe') ||
    aLow.includes('@postpe')
  ) {
    return 'BharatPe (Resilient Innovations Pvt. Ltd.)';
  }

  // 6. WhatsApp Pay
  if (
    bLow.includes('whatsapp') ||
    aLow.includes('@waaxis') ||
    aLow.includes('@wahdfc') ||
    aLow.includes('@wasbi') ||
    aLow.includes('@waicici')
  ) {
    return 'WhatsApp Pay (Meta / WhatsApp Application Services)';
  }

  // 7. MobiKwik
  if (
    bLow.includes('mobikwik') ||
    bLow.includes('mobi kwik') ||
    aLow.includes('@ikwik')
  ) {
    return 'MobiKwik (One Mobikwik Systems Ltd.)';
  }

  // 8. CRED
  if (
    bLow.includes('cred') ||
    aLow.includes('@cred')
  ) {
    return 'CRED (Dreamplug Technologies Pvt. Ltd.)';
  }

  // 9. Freecharge
  if (
    bLow.includes('freecharge') ||
    aLow.includes('@freecharge')
  ) {
    return 'Freecharge Payment Technologies Pvt. Ltd.';
  }

  // 10. Explicit NPCI
  if (
    bLow.includes('npci') ||
    bLow.includes('national payment') ||
    bLow.includes('national payments') ||
    rLow.includes('npci')
  ) {
    return 'National Payments Corporation of India (NPCI)';
  }

  // 11. Known Bank Name provided directly (don't override legitimate banks!)
  const isGeneric =
    !bank ||
    bLow === 'other' ||
    bLow === 'others' ||
    bLow === 'upi' ||
    bLow === '-' ||
    bLow === 'n/a' ||
    bLow === 'null' ||
    bLow === 'beneficiary bank';

  if (!isGeneric) {
    return bank;
  }

  // 12. If bank was generic ("Other", "UPI", etc.) but account is a UPI handle with a bank identifier
  if (account.includes('@')) {
    const handle = account.split('@')[1]?.toLowerCase() || '';
    if (handle.includes('sbi')) return 'State Bank of India (UPI)';
    if (handle.includes('hdfc')) return 'HDFC Bank (UPI)';
    if (handle.includes('icici')) return 'ICICI Bank (UPI)';
    if (handle.includes('axis')) return 'Axis Bank (UPI)';
    if (handle.includes('barod') || handle.includes('bob')) return 'Bank of Baroda (UPI)';
    if (handle.includes('pnb') || handle.includes('punb')) return 'Punjab National Bank (UPI)';
    if (handle.includes('kotak') || handle.includes('kmbl')) return 'Kotak Mahindra Bank (UPI)';
    if (handle.includes('indus')) return 'IndusInd Bank (UPI)';
    if (handle.includes('federal')) return 'Federal Bank (UPI)';
    if (handle.includes('yes')) return 'Yes Bank (UPI)';
    if (handle.includes('canara')) return 'Canara Bank (UPI)';
    if (handle.includes('union')) return 'Union Bank of India (UPI)';
    if (handle.includes('idbi')) return 'IDBI Bank (UPI)';

    // Generic UPI clearing house fallback
    return 'National Payments Corporation of India (NPCI) / UPI Nodal Officer';
  }

  // 13. Default fallback
  if (bLow === 'other' || bLow === 'others') {
    return 'Nodal Officer / Concerned Financial Entity';
  }

  return bank || 'Beneficiary Bank';
}

/**
 * Returns preset quick alternative names for rapid selection in letter generator
 */
export function getEntitySuggestions(
  currentName: string,
  accountNo: string = ''
): string[] {
  const low = `${currentName} ${accountNo}`.toLowerCase();

  if (low.includes('google') || low.includes('gpay') || low.includes('@ok')) {
    return [
      'Google Pay (Google India Digital Services Pvt. Ltd.)',
      'Google Pay Nodal Officer',
      'Google India Digital Services Pvt. Ltd.',
      'Axis Bank (Google Pay PSP Bank)',
      'HDFC Bank (Google Pay PSP Bank)',
      'National Payments Corporation of India (NPCI)',
    ];
  }

  if (low.includes('phonepe') || low.includes('@ybl') || low.includes('@ibl') || low.includes('@axl')) {
    return [
      'PhonePe (PhonePe Private Limited)',
      'PhonePe Nodal Officer',
      'YES Bank Ltd. (PhonePe PSP Bank)',
      'ICICI Bank Ltd. (PhonePe PSP Bank)',
      'National Payments Corporation of India (NPCI)',
    ];
  }

  if (low.includes('paytm')) {
    return [
      'Paytm Payments Bank / One97 Communications Ltd.',
      'Paytm Nodal Officer',
      'One97 Communications Ltd.',
      'National Payments Corporation of India (NPCI)',
    ];
  }

  if (low.includes('npci')) {
    return [
      'National Payments Corporation of India (NPCI)',
      'NPCI Nodal Officer (Cyber Crime Escalations)',
      'UPI Nodal Officer / Clearing Operations',
    ];
  }

  return [
    currentName,
    `${currentName} - Nodal Officer`,
    'National Payments Corporation of India (NPCI)',
  ];
}
