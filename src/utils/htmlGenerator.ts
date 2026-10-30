import { CyberCrimeDocument } from '../data/sampleDocument';

export function generateStandaloneHtml(doc: CyberCrimeDocument): string {
  const esc = (text: any) => {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Crime Incident Acknowledgement - ${esc(doc.acknowledgement.acknowledgementNo)}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #f9fafb;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
      font-size: 13px;
    }
    .doc-container {
      max-width: 960px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 44px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border: 1px solid #d1d5db;
    }
    .header-table td {
      padding: 7px 12px;
      border: 1px solid #e5e7eb;
      font-size: 12.5px;
    }
    .header-table td.label {
      font-weight: 600;
      color: #374151;
      width: 38%;
      background-color: #f8fafc;
    }
    .header-table td.val {
      color: #111827;
      font-weight: 500;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 6px;
      margin-top: 28px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .highlight-banner {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 12px 16px;
      margin: 16px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: space-between;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #1e40af;
      font-weight: 600;
    }
    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: #1e3a8a;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 20px;
      font-size: 11.5px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #d1d5db;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    table.data-table th {
      background-color: #f1f5f9;
      font-weight: 600;
      color: #1e293b;
      font-size: 11px;
      white-space: nowrap;
    }
    table.data-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef9c3; color: #854d0e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .footer-note {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="doc-container">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 0 0 4px 0;">NATIONAL CYBER CRIME REPORTING PORTAL</h1>
      <div style="font-size: 13px; font-weight: 600; color: #475569;">Incident Acknowledgement Slip &amp; Financial Trail Report</div>
    </div>

    <!-- Top Ack Summary -->
    <table class="header-table">
      <tr>
        <td class="label">Acknowledgement No.</td>
        <td class="val"><strong>${esc(doc.acknowledgement.acknowledgementNo)}</strong></td>
        <td class="label">Incident Date/Time</td>
        <td class="val">${esc(doc.acknowledgement.incidentDateTime)}</td>
      </tr>
      <tr>
        <td class="label">Category of Complaint</td>
        <td class="val">${esc(doc.acknowledgement.category)}</td>
        <td class="label">Complaint Date</td>
        <td class="val">${esc(doc.acknowledgement.complaintDate)}</td>
      </tr>
      <tr>
        <td class="label">Sub Category of Complaint</td>
        <td class="val">${esc(doc.acknowledgement.subCategory)}</td>
        <td class="label">UserId</td>
        <td class="val">${esc(doc.acknowledgement.userId)}</td>
      </tr>
      <tr>
        <td class="label">Have You Lost Money</td>
        <td class="val"><span class="badge badge-danger">${esc(doc.acknowledgement.haveYouLostMoney)}</span></td>
        <td class="label">Additional Information Present</td>
        <td class="val">${esc(doc.acknowledgement.additionalInfoPresent)}</td>
      </tr>
    </table>

    <!-- Complainant Details -->
    <div class="section-title">Complainant / Victim Details</div>
    <table class="header-table">
      <tr>
        <td class="label">Name</td>
        <td class="val"><strong>${esc(doc.complainant.name)}</strong></td>
        <td class="label">Mobile</td>
        <td class="val">${esc(doc.complainant.mobile)}</td>
      </tr>
      <tr>
        <td class="label">Gender</td>
        <td class="val">${esc(doc.complainant.gender)}</td>
        <td class="label">Father/Mother / Spouse Name</td>
        <td class="val">${esc(doc.complainant.fatherMotherSpouseName)}</td>
      </tr>
      <tr>
        <td class="label">Date of Birth (age)</td>
        <td class="val">${esc(doc.complainant.dateOfBirth)}</td>
        <td class="label">Email / User Handle</td>
        <td class="val">${esc(doc.complainant.email)}</td>
      </tr>
      <tr>
        <td class="label">Police Station</td>
        <td class="val">${esc(doc.complainant.policeStation)}</td>
        <td class="label">District</td>
        <td class="val">${esc(doc.complainant.district)}</td>
      </tr>
      <tr>
        <td class="label">State</td>
        <td class="val">${esc(doc.complainant.state)}</td>
        <td class="label">Pincode</td>
        <td class="val">${esc(doc.complainant.pincode)}</td>
      </tr>
      <tr>
        <td class="label">Relation with Victim</td>
        <td class="val">${esc(doc.complainant.relationWithVictim || 'Self')}</td>
        <td class="label">Street / House / Colony</td>
        <td class="val">${esc([doc.complainant.houseNo, doc.complainant.streetName, doc.complainant.colony].filter(x => x && x !== '-').join(', ') || '-')}</td>
      </tr>
    </table>

    <!-- Suspect Details -->
    <div class="section-title">Suspect Details</div>
    <table class="header-table">
      <tr>
        <td class="label">State</td>
        <td class="val">${esc(doc.suspect.state)}</td>
        <td class="label">Pincode</td>
        <td class="val">${esc(doc.suspect.pincode || '-')}</td>
      </tr>
      <tr>
        <td class="label">Complaint Additional Info</td>
        <td class="val" colspan="3"><strong style="color: #b91c1c;">${esc(doc.suspect.complaintAdditionalInfo)}</strong></td>
      </tr>
    </table>

    <!-- Financial Summary Banner -->
    <div class="highlight-banner">
      <div class="stat-item">
        <span class="stat-label">Total Fraud Reported</span>
        <span class="stat-value" style="color: #b91c1c;">${esc(doc.financialSummary.totalFraudulentAmountReported)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Lien Amount</span>
        <span class="stat-value" style="color: #047857;">${esc(doc.financialSummary.totalLienAmount)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">ATM Withdrawal Total</span>
        <span class="stat-value" style="color: #4338ca;">${esc(doc.financialSummary.withdrawalThroughAtmAmount)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Put on Hold</span>
        <span class="stat-value" style="color: #b45309;">${esc(doc.financialSummary.transactionPutOnHoldAmount)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Pending / Disputed</span>
        <span class="stat-value" style="color: #6d28d9;">${esc(doc.financialSummary.totalDisputedAmount)}</span>
      </div>
    </div>

    <!-- Fraudulent Transaction Details (Victim Account) -->
    <div class="section-title">Fraudulent Transaction Details (Victim Account Details)</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35px;">S.No</th>
          <th>Account No. / Wallet ID</th>
          <th>Transaction ID</th>
          <th>Amount (₹)</th>
          <th>Transaction Date &amp; Time</th>
          <th>Complaint Date</th>
          <th>Bank / Merchant / PA</th>
        </tr>
      </thead>
      <tbody>
        ${doc.victimAccountTransactions.map(t => `
          <tr>
            <td>${esc(t.sNo)}</td>
            <td><strong>${esc(t.accountNoOrWalletId)}</strong></td>
            <td style="font-family: monospace;">${esc(t.transactionId)}</td>
            <td style="font-weight: 700; color: #b91c1c;">₹ ${esc(t.transactionAmount)}</td>
            <td>${esc(t.transactionDateTime)}</td>
            <td>${esc(t.complaintDate)}</td>
            <td>${esc(t.bankMerchant)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Supporting Evidence & Hashes -->
    ${doc.supportingEvidence && doc.supportingEvidence.length > 0 ? `
    <div class="section-title">Supporting Evidence</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Description</th>
          <th>File Name</th>
          <th>MD5</th>
          <th>SHA-256</th>
        </tr>
      </thead>
      <tbody>
        ${doc.supportingEvidence.map(e => `
          <tr>
            <td>${esc(e.sNo)}</td>
            <td>${esc(e.description)}</td>
            <td><strong>${esc(e.fileName)}</strong></td>
            <td style="font-family: monospace; font-size: 10px; word-break: break-all;">${esc(e.md5)}</td>
            <td style="font-family: monospace; font-size: 10px; word-break: break-all;">${esc(e.sha256)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <!-- Pending Transactions -->
    ${doc.pendingTransactions && doc.pendingTransactions.length > 0 ? `
    <div class="section-title">List of Pending Transactions</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Banks / FIs</th>
          <th>No. of Txns Pending</th>
          <th>Total Txn Amount</th>
          <th>Total Disputed Amount</th>
          <th>Pending From</th>
        </tr>
      </thead>
      <tbody>
        ${doc.pendingTransactions.map(p => `
          <tr>
            <td>${esc(p.sNo)}</td>
            <td><strong>${esc(p.bankOrFi)}</strong></td>
            <td>${esc(p.noOfTransactionsPending)}</td>
            <td style="font-weight: 600;">₹ ${esc(p.totalTransactionsAmount)}</td>
            <td style="font-weight: 600; color: #b91c1c;">₹ ${esc(p.totalDisputedAmount)}</td>
            <td>${esc(p.pendingFrom)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <!-- Money Transfer Trail (Multi-Layer) -->
    <div class="section-title">Money Transfer Trail (Multi-Layer Financial Flow)</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>From Acc / UTR</th>
          <th>Layer</th>
          <th>To Bank &amp; Acc / IFSC</th>
          <th>Txn ID / UTR</th>
          <th>Date &amp; Time</th>
          <th>Amount (₹)</th>
          <th>Remarks / Lien</th>
          <th>Action Taken By</th>
          <th>Date of Action</th>
        </tr>
      </thead>
      <tbody>
        ${doc.moneyTransferTrail.map(m => `
          <tr>
            <td>${esc(m.sNo)}</td>
            <td>
              <div style="font-weight: 600;">${esc(m.senderAccountNo)}</div>
              <div style="font-family: monospace; font-size: 10px; color: #6b7280;">${esc(m.senderTxnOrUtr)}</div>
            </td>
            <td><span class="badge ${m.layer.includes('1') ? 'badge-warning' : m.layer.includes('2') ? 'badge-danger' : 'badge-success'}">${esc(m.layer)}</span></td>
            <td>
              <div><strong>${esc(m.destinationBank)}</strong></div>
              <div style="font-family: monospace; font-size: 10.5px;">Acc: ${esc(m.destinationAccountNo)}</div>
              <div style="font-size: 10px; color: #4b5563;">IFSC: ${esc(m.destinationIfsc)}</div>
            </td>
            <td style="font-family: monospace; font-size: 11px;">${esc(m.transactionIdUtr)}</td>
            <td style="white-space: nowrap;">${esc(m.transactionDateTime)}</td>
            <td style="font-weight: 700; color: #1e3a8a;">₹ ${esc(m.transactionAmount)}</td>
            <td style="font-size: 10px; max-width: 150px; word-break: break-word;">${esc(m.referenceNoRemarks)}</td>
            <td>${esc(m.actionTakenBy)}</td>
            <td style="white-space: nowrap;">${esc(m.dateOfAction)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Transaction Put on Hold -->
    ${doc.transactionsPutOnHold && doc.transactionsPutOnHold.length > 0 ? `
    <div class="section-title">Transactions Put on Hold</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Account No.</th>
          <th>Transaction ID / UTR</th>
          <th>Put on Hold Date</th>
          <th>Hold Amount</th>
          <th>Action Taken By</th>
          <th>Date of Action</th>
        </tr>
      </thead>
      <tbody>
        ${doc.transactionsPutOnHold.map(h => `
          <tr>
            <td>${esc(h.sNo)}</td>
            <td><strong>${esc(h.accountNo)}</strong></td>
            <td style="font-family: monospace;">${esc(h.transactionIdUtr)}</td>
            <td>${esc(h.putOnHoldDate)}</td>
            <td style="font-weight: 700; color: #047857;">₹ ${esc(h.putOnHoldAmount)}</td>
            <td>${esc(h.actionTakenBy)}</td>
            <td>${esc(h.dateOfAction)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <!-- Withdrawal Through ATM -->
    <div class="section-title">Withdrawal Through ATM (${doc.atmWithdrawals.length} Transactions)</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Account No. &amp; UTR</th>
          <th>Date &amp; Time</th>
          <th>Amount (₹)</th>
          <th>Disputed</th>
          <th>Status</th>
          <th>ATM ID &amp; Location</th>
          <th>Bank / Action By</th>
        </tr>
      </thead>
      <tbody>
        ${doc.atmWithdrawals.map(a => `
          <tr>
            <td>${esc(a.sNo)}</td>
            <td>
              <div style="font-weight: 600;">${esc(a.accountNo)}</div>
              <div style="font-family: monospace; font-size: 10px; color: #6b7280;">UTR: ${esc(a.transactionIdUtr)}</div>
            </td>
            <td style="white-space: nowrap;">${esc(a.withdrawalDateTime)}</td>
            <td style="font-weight: 700; color: #b91c1c;">₹ ${esc(a.withdrawalAmount)}</td>
            <td style="color: #6b7280;">₹ ${esc(a.disputedAmount)}</td>
            <td><span class="badge badge-success">${esc(a.referenceRemarks)}</span></td>
            <td>
              <div style="font-weight: 600; color: #1e3a8a;">${esc(a.atmId)}</div>
              <div style="font-size: 10.5px; color: #4b5563;">${esc(a.atmLocation)}</div>
            </td>
            <td>
              <div>${esc(a.actionTakenBy)}</div>
              <div style="font-size: 10px; color: #9ca3af;">${esc(a.dateOfAction)}</div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Action Taken Box -->
    <div class="section-title">Official Action Taken &amp; Police Status</div>
    <table class="header-table" style="background: #f8fafc; border-left: 4px solid #1e3a8a;">
      <tr>
        <td class="label">Complaint Accepted By</td>
        <td class="val" colspan="3"><strong>${esc(doc.actionTaken.complaintAcceptedBy)}</strong></td>
      </tr>
      <tr>
        <td class="label">Complaint Accepted Date</td>
        <td class="val">${esc(doc.actionTaken.complaintAcceptedDate)}</td>
        <td class="label">Current Status</td>
        <td class="val"><span class="badge badge-warning" style="font-size: 12px; padding: 3px 10px;">${esc(doc.actionTaken.currentStatus)}</span></td>
      </tr>
      <tr>
        <td class="label">e-Zero FIR No.</td>
        <td class="val"><strong style="color: #1e3a8a; font-size: 13px;">${esc(doc.actionTaken.eZeroFirNo)}</strong></td>
        <td class="label">Under Process Date</td>
        <td class="val">${esc(doc.actionTaken.underProcessDate)}</td>
      </tr>
    </table>

    <div class="footer-note">
      Converted from PDF to HTML/CSS with High-Precision OCR &amp; Document Parsing.
      Official Acknowledgement generated via National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in)
    </div>
  </div>
</body>
</html>`;
}
