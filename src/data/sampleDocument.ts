export interface CyberCrimeDocument {
  documentTitle: string;
  acknowledgement: {
    acknowledgementNo: string;
    category: string;
    subCategory: string;
    additionalInfoPresent: string;
    userId: string;
    haveYouLostMoney: string;
    incidentDateTime: string;
    complaintDate: string;
  };
  complainant: {
    name: string;
    gender: string;
    dateOfBirth: string;
    age: string;
    mobile: string;
    fatherMotherSpouseName: string;
    email: string;
    streetName: string;
    houseNo: string;
    colony: string;
    villageTown: string;
    tehsil: string;
    pincode: string;
    policeStation: string;
    district: string;
    state: string;
    relationWithVictim: string;
  };
  suspect: {
    state: string;
    pincode: string;
    complaintAdditionalInfo: string;
  };
  financialSummary: {
    totalFraudulentAmountReported: string;
    totalLienAmount: string;
    totalDisputedAmount: string;
    transactionPutOnHoldAmount: string;
    withdrawalThroughAtmAmount: string;
    othersAmount: string;
  };
  victimAccountTransactions: Array<{
    sNo: number | string;
    accountNoOrWalletId: string;
    transactionId: string;
    cardDetails: string;
    transactionAmount: string;
    referenceNo: string;
    transactionDateTime: string;
    complaintDate: string;
    bankMerchant: string;
  }>;
  supportingEvidence: Array<{
    sNo: number | string;
    description: string;
    textInformation: string;
    fileName: string;
    md5: string;
    sha256: string;
  }>;
  pendingTransactions: Array<{
    sNo: number | string;
    bankOrFi: string;
    noOfTransactionsPending: number | string;
    totalTransactionsAmount: string;
    totalDisputedAmount: string;
    pendingFrom: string;
  }>;
  fraudBreakdown: Array<{
    sNo: number | string;
    title: string;
    amount: string;
  }>;
  moneyTransferTrail: Array<{
    sNo: number | string;
    senderAccountNo: string;
    senderTxnOrUtr: string;
    layer: string;
    destinationBank: string;
    destinationAccountNo: string;
    destinationIfsc: string;
    transactionIdUtr: string;
    transactionDateTime: string;
    transactionAmount: string;
    disputedAmount: string;
    referenceNoRemarks: string;
    actionTakenBy: string;
    dateOfAction: string;
  }>;
  transactionsPutOnHold: Array<{
    sNo: number | string;
    accountNo: string;
    transactionIdUtr: string;
    putOnHoldDate: string;
    putOnHoldAmount: string;
    actionTakenBy: string;
    dateOfAction: string;
  }>;
  atmWithdrawals: Array<{
    sNo: number | string;
    accountNo: string;
    transactionIdUtr: string;
    withdrawalDateTime: string;
    withdrawalAmount: string;
    disputedAmount: string;
    referenceRemarks: string;
    atmId: string;
    atmLocation: string;
    actionTakenBy: string;
    dateOfAction: string;
  }>;
  othersUnder500: Array<{
    sNo: number | string;
    accountNo: string;
    transactionIdUtr: string;
    referenceRemarks: string;
    actionTakenBy: string;
    dateOfAction: string;
  }>;
  actionTaken: {
    complaintAcceptedBy: string;
    complaintAcceptedDate: string;
    currentStatus: string;
    eZeroFirNo: string;
    underProcessDate: string;
  };
  rawTextSummary?: string;
}

export const SAMPLE_DOCUMENT: CyberCrimeDocument = {
  documentTitle: "National Cyber Crime Reporting Portal - Incident Acknowledgement",
  acknowledgement: {
    acknowledgementNo: "31109260232375",
    category: "Online Financial Fraud",
    subCategory: "UPI Related Frauds",
    additionalInfoPresent: "Yes",
    userId: "SA62412609241038",
    haveYouLostMoney: "Yes",
    incidentDateTime: "24/09/2026 12 : 21 : AM",
    complaintDate: "24/09/2026",
  },
  complainant: {
    name: "SANKARBHAI VANJARA",
    gender: "Male",
    dateOfBirth: "01/06/1965 Age (61 Years )",
    age: "61 Years",
    mobile: "9724996241",
    fatherMotherSpouseName: "JAYRUKJI",
    email: "SA62412609241038",
    streetName: "-",
    houseNo: "-",
    colony: "-",
    villageTown: "-",
    tehsil: "-",
    pincode: "394670",
    policeStation: "SONGADH",
    district: "TAPI",
    state: "GUJARAT",
    relationWithVictim: "Self",
  },
  suspect: {
    state: "GUJARAT",
    pincode: "-",
    complaintAdditionalInfo: "SHOPPING FRAUD - 2,10,200/-HELPLINE8",
  },
  financialSummary: {
    totalFraudulentAmountReported: "₹ 2,10,200.00",
    totalLienAmount: "₹ 667.50",
    totalDisputedAmount: "₹ 93,600.00",
    transactionPutOnHoldAmount: "Rs. 667.50",
    withdrawalThroughAtmAmount: "Rs. 1,26,500.00",
    othersAmount: "Rs. 42,000.00",
  },
  victimAccountTransactions: [
    {
      sNo: 1,
      accountNoOrWalletId: "16090100017167",
      transactionId: "225272690094",
      cardDetails: "-",
      transactionAmount: "41,800.00",
      referenceNo: "-",
      transactionDateTime: "15/09/2026 00:00:AM",
      complaintDate: "24/09/2026 12:21:PM",
      bankMerchant: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
    },
    {
      sNo: 2,
      accountNoOrWalletId: "16090100017167",
      transactionId: "177946282220",
      cardDetails: "-",
      transactionAmount: "50,000.00",
      referenceNo: "-",
      transactionDateTime: "11/09/2026 00:00:AM",
      complaintDate: "24/09/2026 12:21:PM",
      bankMerchant: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
    },
    {
      sNo: 3,
      accountNoOrWalletId: "16090100017167",
      transactionId: "062297182277",
      cardDetails: "-",
      transactionAmount: "30,000.00",
      referenceNo: "-",
      transactionDateTime: "17/09/2026 00:00:AM",
      complaintDate: "24/09/2026 12:21:PM",
      bankMerchant: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
    },
    {
      sNo: 4,
      accountNoOrWalletId: "16090100017167",
      transactionId: "883567636279",
      cardDetails: "-",
      transactionAmount: "30,000.00",
      referenceNo: "-",
      transactionDateTime: "11/09/2026 00:00:AM",
      complaintDate: "24/09/2026 12:21:PM",
      bankMerchant: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
    },
    {
      sNo: 5,
      accountNoOrWalletId: "16090100017167",
      transactionId: "786062643522",
      cardDetails: "-",
      transactionAmount: "20,000.00",
      referenceNo: "-",
      transactionDateTime: "12/09/2026 00:00:AM",
      complaintDate: "24/09/2026 12:21:PM",
      bankMerchant: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
    },
    {
      sNo: 6,
      accountNoOrWalletId: "16090100017167",
      transactionId: "427779828313",
      cardDetails: "-",
      transactionAmount: "20,000.00",
      referenceNo: "-",
      transactionDateTime: "12/09/2026 00:00:AM",
      complaintDate: "24/09/2026 12:21:PM",
      bankMerchant: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
    },
    {
      sNo: 7,
      accountNoOrWalletId: "16090100017167",
      transactionId: "458052127549",
      cardDetails: "-",
      transactionAmount: "6,600.00",
      referenceNo: "-",
      transactionDateTime: "15/09/2026 00:00:AM",
      complaintDate: "24/09/2026 12:21:PM",
      bankMerchant: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
    },
    {
      sNo: 8,
      accountNoOrWalletId: "16090100017167",
      transactionId: "960186230585",
      cardDetails: "-",
      transactionAmount: "11,800.00",
      referenceNo: "-",
      transactionDateTime: "10/09/2026 00:00:AM",
      complaintDate: "24/09/2026 12:21:PM",
      bankMerchant: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
    },
  ],
  supportingEvidence: [
    {
      sNo: 1,
      description: "Other",
      textInformation: "NA",
      fileName: "1930citizen_202609241121312778450.pdf",
      md5: "8A62C25D600DBE9DCE9D4757ADA4D69F",
      sha256: "39AB3851C598B182FC65006AFE78477B512E5BAA0D9E19E28D5DAA7A829615DB",
    },
  ],
  pendingTransactions: [
    {
      sNo: 1,
      bankOrFi: "State Bank of India",
      noOfTransactionsPending: 3,
      totalTransactionsAmount: "81,800.00",
      totalDisputedAmount: "81,800.00",
      pendingFrom: "24/09/2026 12:23:43",
    },
    {
      sNo: 2,
      bankOrFi: "Paytm",
      noOfTransactionsPending: 1,
      totalTransactionsAmount: "11,800.00",
      totalDisputedAmount: "11,800.00",
      pendingFrom: "24/09/2026 12:37:06",
    },
  ],
  fraudBreakdown: [
    {
      sNo: 1,
      title: "Transaction put on hold",
      amount: "Rs. 667.50",
    },
    {
      sNo: 2,
      title: "Withdrawal through ATM",
      amount: "Rs. 1,26,500.00",
    },
    {
      sNo: 3,
      title: "Others [ <=500]",
      amount: "Rs. 42,000.00",
    },
  ],
  moneyTransferTrail: [
    {
      sNo: 1,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "786062643522",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "786062643522",
      transactionDateTime: "12/09/2026 11:34:00 AM",
      transactionAmount: "20,000.00",
      disputedAmount: "20,000.00",
      referenceNoRemarks: "-",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:22:PM",
    },
    {
      sNo: 2,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "427779828313",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "427779828313",
      transactionDateTime: "13/09/2026 11:54:00 AM",
      transactionAmount: "20,000.00",
      disputedAmount: "20,000.00",
      referenceNoRemarks: "-",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:23:PM",
    },
    {
      sNo: 3,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "062297182277",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "062297182277",
      transactionDateTime: "17/09/2026 01:56:00 PM",
      transactionAmount: "30,000.00",
      disputedAmount: "30,000.00",
      referenceNoRemarks: "-",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:24:PM",
    },
    {
      sNo: 4,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "225272690094",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "225272690094",
      transactionDateTime: "15/09/2026 12:00:00 AM",
      transactionAmount: "41,800.00",
      disputedAmount: "41,800.00",
      referenceNoRemarks: "Lien Amount: 0.00, Ack no: 31109260232375, Root_UTR: 225272690094, Lien_Status: N/A",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:28:PM",
    },
    {
      sNo: 5,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "427779828313",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "427779828313",
      transactionDateTime: "13/09/2026 12:00:00 AM",
      transactionAmount: "20,000.00",
      disputedAmount: "20,000.00",
      referenceNoRemarks: "Lien Amount: 0.00, Ack no: 31109260232375, Root_UTR: 427779828313, Lien_Status: N/A",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:28:PM",
    },
    {
      sNo: 6,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "960186230585",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "960186230585",
      transactionDateTime: "10/09/2026 12:00:00 AM",
      transactionAmount: "11,800.00",
      disputedAmount: "11,800.00",
      referenceNoRemarks: "Lien Amount: 0.00, Ack no: 31109260232375, Root_UTR: 960186230585, Lien_Status: N/A",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:28:PM",
    },
    {
      sNo: 7,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "883567636279",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "883567636279",
      transactionDateTime: "11/09/2026 12:00:00 AM",
      transactionAmount: "30,000.00",
      disputedAmount: "30,000.00",
      referenceNoRemarks: "Lien Amount: 0.00, Ack no: 31109260232375, Root_UTR: 883567636279, Lien_Status: N/A",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:28:PM",
    },
    {
      sNo: 8,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "177946282220",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "177946282220",
      transactionDateTime: "11/09/2026 12:00:00 AM",
      transactionAmount: "50,000.00",
      disputedAmount: "50,000.00",
      referenceNoRemarks: "Lien Amount: 0.00, Ack no: 31109260232375, Root_UTR: 177946282220, Lien_Status: N/A",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:28:PM",
    },
    {
      sNo: 9,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "062297182277",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "062297182277",
      transactionDateTime: "17/09/2026 12:00:00 AM",
      transactionAmount: "30,000.00",
      disputedAmount: "30,000.00",
      referenceNoRemarks: "Lien Amount: 0.00, Ack no: 31109260232375, Root_UTR: 062297182277, Lien_Status: N/A",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:28:PM",
    },
    {
      sNo: 10,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "786062643522",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "786062643522",
      transactionDateTime: "12/09/2026 12:00:00 AM",
      transactionAmount: "20,000.00",
      disputedAmount: "20,000.00",
      referenceNoRemarks: "Lien Amount: 0.00, Ack no: 31109260232375, Root_UTR: 786062643522, Lien_Status: N/A",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:28:PM",
    },
    {
      sNo: 11,
      senderAccountNo: "16090100017167",
      senderTxnOrUtr: "458052127549",
      layer: "Layer : 1",
      destinationBank: "State Bank of India",
      destinationAccountNo: "00000045507539522",
      destinationIfsc: "SBIN0051455",
      transactionIdUtr: "458052127549",
      transactionDateTime: "15/09/2026 12:00:00 AM",
      transactionAmount: "6,600.00",
      disputedAmount: "6,600.00",
      referenceNoRemarks: "Lien Amount: 0.00, Ack no: 31109260232375, Root_UTR: 458052127549, Lien_Status: N/A",
      actionTakenBy: "Bank of Baroda (Including Vijaya Bank and Dena Bank)",
      dateOfAction: "24/09/2026 12:28:PM",
    },
    {
      sNo: 12,
      senderAccountNo: "45507539522",
      senderTxnOrUtr: "960186230585",
      layer: "Layer : 2",
      destinationBank: "Yes Bank",
      destinationAccountNo: "001425000000051",
      destinationIfsc: "YESB0MCHUPI",
      transactionIdUtr: "625342789639",
      transactionDateTime: "10/09/2026 08:40:35 PM",
      transactionAmount: "11,800.00",
      disputedAmount: "11,800.00",
      referenceNoRemarks: "-",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 13,
      senderAccountNo: "001425000000051",
      senderTxnOrUtr: "625342789639",
      layer: "Layer : 3",
      destinationBank: "Paytm",
      destinationAccountNo: "001425000000051",
      destinationIfsc: "PAYTM",
      transactionIdUtr: "625342789639",
      transactionDateTime: "10/09/2026 08:40:35 PM",
      transactionAmount: "11,800.00",
      disputedAmount: "11,800.00",
      referenceNoRemarks: "-",
      actionTakenBy: "Yes Bank",
      dateOfAction: "24/09/2026 12:37:PM",
    },
  ],
  transactionsPutOnHold: [
    {
      sNo: 1,
      accountNo: "45507539522",
      transactionIdUtr: "062297182277",
      putOnHoldDate: "17/09/2026",
      putOnHoldAmount: "222.50",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:34:PM",
    },
    {
      sNo: 2,
      accountNo: "45507539522",
      transactionIdUtr: "883567636279",
      putOnHoldDate: "11/09/2026",
      putOnHoldAmount: "222.50",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:34:PM",
    },
    {
      sNo: 3,
      accountNo: "45507539522",
      transactionIdUtr: "786062643522",
      putOnHoldDate: "12/09/2026",
      putOnHoldAmount: "222.50",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:34:PM",
    },
  ],
  atmWithdrawals: [
    {
      sNo: 1,
      accountNo: "45507539522",
      transactionIdUtr: "177946282220",
      withdrawalDateTime: "11/09/2026 12:09:06 PM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "10,000.00",
      referenceRemarks: "SUCCESS",
      atmId: "S1BD051455001",
      atmLocation: "SBI DUGRI BASANT AVENUE, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 2,
      accountNo: "45507539522",
      transactionIdUtr: "062297182277",
      withdrawalDateTime: "17/09/2026 02:10:27 PM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "9,777.50",
      referenceRemarks: "SUCCESS",
      atmId: "U1NF015297080",
      atmLocation: "PIPAL CHOWK GYASPURA LDH, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 3,
      accountNo: "45507539522",
      transactionIdUtr: "786062643522",
      withdrawalDateTime: "12/09/2026 11:39:24 AM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "9,777.50",
      referenceRemarks: "SUCCESS",
      atmId: "E1AWLD15",
      atmLocation: "-, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 4,
      accountNo: "45507539522",
      transactionIdUtr: "177946282220",
      withdrawalDateTime: "11/09/2026 12:10:03 PM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "10,000.00",
      referenceRemarks: "SUCCESS",
      atmId: "S1BD051455001",
      atmLocation: "SBI DUGRI BASANT AVENUE, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 5,
      accountNo: "45507539522",
      transactionIdUtr: "883567636279",
      withdrawalDateTime: "11/09/2026 12:09:06 PM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "10,000.00",
      referenceRemarks: "SUCCESS",
      atmId: "S1BD051455001",
      atmLocation: "SBI DUGRI BASANT AVENUE, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 6,
      accountNo: "45507539522",
      transactionIdUtr: "883567636279",
      withdrawalDateTime: "11/09/2026 12:10:03 PM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "10,000.00",
      referenceRemarks: "SUCCESS",
      atmId: "S1BD051455001",
      atmLocation: "SBI DUGRI BASANT AVENUE, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 7,
      accountNo: "45507539522",
      transactionIdUtr: "177946282220",
      withdrawalDateTime: "11/09/2026 12:11:05 PM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "10,000.00",
      referenceRemarks: "SUCCESS",
      atmId: "S1BD051455001",
      atmLocation: "SBI DUGRI BASANT AVENUE, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 8,
      accountNo: "45507539522",
      transactionIdUtr: "062297182277",
      withdrawalDateTime: "17/09/2026 02:08:05 PM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "10,000.00",
      referenceRemarks: "SUCCESS",
      atmId: "U1NF015297080",
      atmLocation: "PIPAL CHOWK GYASPURA LDH, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 9,
      accountNo: "45507539522",
      transactionIdUtr: "177946282220",
      withdrawalDateTime: "11/09/2026 12:12:09 PM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "10,000.00",
      referenceRemarks: "SUCCESS",
      atmId: "S1BD051455001",
      atmLocation: "SBI DUGRI BASANT AVENUE, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 10,
      accountNo: "45507539522",
      transactionIdUtr: "062297182277",
      withdrawalDateTime: "17/09/2026 02:09:21 PM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "10,000.00",
      referenceRemarks: "SUCCESS",
      atmId: "U1NF015297080",
      atmLocation: "PIPAL CHOWK GYASPURA LDH, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 11,
      accountNo: "45507539522",
      transactionIdUtr: "786062643522",
      withdrawalDateTime: "12/09/2026 11:38:24 AM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "10,000.00",
      referenceRemarks: "SUCCESS",
      atmId: "E1AWLD15",
      atmLocation: "-, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 12,
      accountNo: "45507539522",
      transactionIdUtr: "458052127549",
      withdrawalDateTime: "15/09/2026 01:25:43 PM",
      withdrawalAmount: "6,500.00",
      disputedAmount: "6,500.00",
      referenceRemarks: "SUCCESS",
      atmId: "DPCN2475",
      atmLocation: "-, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
    {
      sNo: 13,
      accountNo: "45507539522",
      transactionIdUtr: "883567636279",
      withdrawalDateTime: "11/09/2026 12:11:05 PM",
      withdrawalAmount: "10,000.00",
      disputedAmount: "9,777.50",
      referenceRemarks: "SUCCESS",
      atmId: "S1BD051455001",
      atmLocation: "SBI DUGRI BASANT AVENUE, LUDHIANA, PB, IN",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
  ],
  othersUnder500: [
    {
      sNo: 1,
      accountNo: "45507539522",
      transactionIdUtr: "458052127549",
      referenceRemarks: "-",
      actionTakenBy: "State Bank of India",
      dateOfAction: "24/09/2026 12:36:PM",
    },
  ],
  actionTaken: {
    complaintAcceptedBy: "Login Id: sp-tapidist Name: Superintendent of Police Tapi(DISTRICT)",
    complaintAcceptedDate: "24/09/2026 04:46:11 PM",
    currentStatus: "Under Process",
    eZeroFirNo: "011824004263088",
    underProcessDate: "24/09/2026 04:46:11 PM",
  },
};
