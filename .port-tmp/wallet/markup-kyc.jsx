    {/* KYC Verification Modal */}

    <div className="kyc-modal-overlay" id="kycModalOverlay">
      <div className="kyc-modal-sheet">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 id="kycModalTitle" style={{ color: "#fff", margin: "0", fontSize: "17px", fontWeight: "800" }}>KYC Verification</h3>
          <button onClick={(event) => runInline(event, "closeKycModal()")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "16px" }}>&#x2715;</button>
        </div>
        <p id="kycModalDesc" style={{ color: "#888", fontSize: "13px", lineHeight: "1.6", marginBottom: "18px" }}></p>

        {/* Tier 2 fields */}

        <div id="kycTier2Fields">
          <label className="kyc-form-label">Phone Number</label>
          <input className="kyc-form-input" id="kycPhone" type="tel" placeholder="+234 800 000 0000" />
          <label className="kyc-form-label">NIN (National Identification Number)</label>
          <input className="kyc-form-input" id="kycNin" type="text" placeholder="11-digit NIN" maxLength={11} />
        </div>

        {/* Tier 3 fields */}

        <div id="kycTier3Fields" style={{ display: "none" }}>
          <label className="kyc-form-label">BVN (Bank Verification Number)</label>
          <input className="kyc-form-input" id="kycBvn" type="text" placeholder="11-digit BVN" maxLength={11} />
          <label className="kyc-form-label">Proof of Address</label>
          <div className="kyc-photo-box" id="kycAddressBox" onClick={(event) => runInline(event, "document.getElementById('kycAddressFile').click()")}>
            <div id="kycAddressPreview">&#x1F4C4; Tap to upload (utility bill, bank statement, etc.)</div>
          </div>
          <input type="file" id="kycAddressFile" accept="image/*,application/pdf" style={{ display: "none" }} onChange={(event) => runInline(event, "kycPreviewFile('kycAddressFile','kycAddressPreview','kycAddressBox')")} />
        </div>

        {/* Selfie (both tiers) */}

        <label className="kyc-form-label">Take a Clear Selfie (face must be visible)</label>
        <div className="kyc-photo-box" id="kycSelfieBox" onClick={(event) => runInline(event, "document.getElementById('kycSelfieFile').click()")}>
          <div id="kycSelfiePreview">&#x1F4F7; Tap to take/upload selfie</div>
        </div>
        <input type="file" id="kycSelfieFile" accept="image/*" capture="user" style={{ display: "none" }} onChange={(event) => runInline(event, "kycPreviewFile('kycSelfieFile','kycSelfiePreview','kycSelfieBox')")} />

        <div id="kycSubmitStatus" style={{ color: "#e9d5ff", fontSize: "13px", minHeight: "18px", marginBottom: "10px" }}></div>
        <button className="kyc-submit-btn" id="kycSubmitBtn" onClick={(event) => runInline(event, "submitKycRequest()")}>Submit for Review</button>

        <p style={{ color: "#555", fontSize: "11px", textAlign: "center", marginTop: "12px" }}>Your data is encrypted and used only for identity verification.</p>
      </div>
    </div>

