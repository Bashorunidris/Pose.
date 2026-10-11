    <div className="wallet-modal" id="walletModal">
        <div className="wallet-content">
            {/* Wallet Header */}

            <div className="wallet-page-header" id="walletPageHeader">
                <button className="wallet-back-btn" onClick={(event) => runInline(event, "closeWallet()")}><i className="fas fa-arrow-left"></i></button>
                <div className="wallet-page-title"><i className="fas fa-wallet" style={{ marginRight: "8px" }}></i>My Wallet</div>
            </div>

            {/* Wallet Body */}

            <div className="wallet-page-body">
                <div className="wallet-header">
                    <button className="wallet-close" onClick={(event) => runInline(event, "closeWallet()")}>×</button>
                </div>

                <div className="wallet-balance-display">
                    <div id="walletIdDisplay" className="wallet-id-row">
                      <div>
                        <span className="wallet-id-label">ID</span>
                        <span className="wallet-id-value" id="walletIdText">Loading...</span>
                      </div>
                      <button className="wallet-id-copy-btn" onClick={(event) => runInline(event, "copyWalletId()")} aria-label="Copy wallet ID"><i className="fas fa-copy"></i></button>
                    </div>

                    <div className="wallet-balance-label">
                        Total Balance
                        <button className="wallet-eye-btn" id="walletEyeBtn" onClick={(event) => runInline(event, "toggleWalletBalanceVisibility()")} aria-label="Show or hide balance">
                            <i className="fas fa-eye" id="walletEyeIcon"></i>
                        </button>
                    </div>
                    <div className="wallet-balance-amount-wrap">
                        <div className="wallet-balance-amount" id="walletBalance"><i className="fas fa-naira-sign"></i>0</div>
                        <div className="wallet-balance-dots" id="walletBalanceDots">•••••••</div>
                    </div>

                    <div className="wallet-coin-pill">
                        <div className="wallet-coin-pill-icon">P</div>
                        <span id="walletPCoinBalance">0 Pose Coin</span>
                        <small id="pcoinRateDisplay">Loading rate...</small>
                    </div>

                    <div className="wallet-card-actions">
                        <button className="wallet-btn-topup" onClick={(event) => runInline(event, "redirectToWebStore()")}>
                            <i className="fas fa-plus"></i> Top Up
                        </button>
                        <button className="wallet-btn-withdraw" onClick={(event) => runInline(event, "openEarningsWithdrawalModal()")}>
                            <i className="fas fa-arrow-up"></i> Withdraw
                        </button>
                    </div>
                </div>

                {/* Earnings: Pose Star + Pending Views Pool */}

                <div className="wallet-currency-grid">
                    {/* Pose Star Balance (earnings from views + ad revenue) */}

                    <div className="posestar-section">
                        <div className="posestar-label"><i className="fas fa-star"></i> Pose Star</div>
                        <div className="posestar-balance" id="walletPoseStarBalance">0 Pose Star</div>
                        <div className="wallet-currency-sub" id="walletPoseStarNGN">≈ ₦0</div>
                    </div>

                    {/* Pending Views Pool — ad-revenue accumulation, not yet in main wallet.
                         Auto-transfers at 1,000 views or every 24h (see checkAndFlushPendingPool). */}

                    <div className="posestar-section" id="pendingPoolSection">
                        <div className="posestar-label"><i className="fas fa-hourglass-half"></i> Pending Views Pool</div>
                        <div className="posestar-balance" id="pendingPoolStars">0 Pose Star</div>
                        <div className="wallet-currency-sub" id="pendingPoolNGN">≈ ₦0</div>
                        <div className="wallet-pool-views" id="pendingPoolViews">0 views accumulated</div>
                        <div className="wallet-pool-hint">Auto-transfers to your main wallet at 1,000 views, or every 24 hours — whichever comes first.</div>
                    </div>
                </div>

                {/* Section navigation */}

                <div className="wallet-tabs">
                    <button className="wallet-tab-btn active" onClick={(event) => runInline(event, "switchWalletTab('set-bank')")}>
                        <i className="fas fa-university"></i>Bank
                    </button>
                    <button className="wallet-tab-btn" onClick={(event) => runInline(event, "switchWalletTab('history')")}>
                        <i className="fas fa-history"></i>History
                    </button>
                    <button className="wallet-tab-btn" onClick={(event) => runInline(event, "switchWalletTab('security')")}>
                        <i className="fas fa-shield-alt"></i>Security
                    </button>
                    <button className="wallet-tab-btn" onClick={(event) => runInline(event, "switchWalletTab('kyc')")}>
                        <i className="fas fa-id-card"></i>KYC
                    </button>
                </div>

                {/* Set Bank Tab */}

                <div className="wallet-tab-content active" id="set-bank">
                    <h3 className="wallet-tab-title"><i className="fas fa-credit-card"></i>Bank Account Information</h3>

                    {/* Bank Selection with Search */}

                    <div className="wallet-form-group">
                        <label className="wallet-form-label">Select Bank</label>
                        <div style={{ position: "relative" }}>
                            <input type="text" className="wallet-form-input" id="bankSearchInput" placeholder="Search banks... (e.g., GTBank, Moniepoint)" onInput={(event) => runInline(event, "filterBanks()")} style={{ width: "100%" }} />
                            <i className="fas fa-search" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#666" }}></i>
                        </div>

                        {/* Bank Dropdown List */}

                        <div id="bankDropdown" style={{ display: "none", position: "absolute", top: "100%", left: "0", right: "0", background: "#16121f", border: "1px solid rgba(255,255,255,.1)", borderRadius: "12px", maxHeight: "300px", overflowY: "auto", zIndex: "100", marginTop: "6px", boxShadow: "0 12px 32px rgba(0,0,0,.5)" }}>
                            {/* Banks will be populated by JavaScript */}

                        </div>
                    </div>

                    {/* Selected Bank Display */}

                    <div id="selectedBankDisplay" className="wallet-card wallet-card-accent" style={{ display: "none" }}>
                        <div style={{ color: "#a78bfa", fontWeight: "700", fontSize: "12.5px" }}>
                            <i className="fas fa-check-circle" style={{ marginRight: "8px" }}></i>Selected Bank
                        </div>
                        <div style={{ color: "#FFFFFF", fontSize: "1.05rem", fontWeight: "600", marginTop: "8px" }} id="selectedBankName">-</div>
                    </div>

                    <div className="wallet-form-group">
                        <label className="wallet-form-label">Account Number</label>
                        <input type="text" className="wallet-form-input" id="accountNumber" placeholder="10 digit account number" maxLength={10} inputmode="numeric" onInput={(event) => runInline(event, "onBankAcctInput(this.value)")} />
                    </div>

                    {/* Account Name — auto-resolved or manual fallback */}

                    <div className="wallet-form-group" id="acctNameGroup">
                        <label className="wallet-form-label">Account Holder Name</label>
                        <div id="acctNameBox">
                            {/* populated by onBankAcctInput() */}

                            <input type="text" className="wallet-form-input" id="accountName" placeholder="Enter bank account number above" />
                        </div>
                    </div>

                    <button className="wallet-submit-btn" id="saveBankBtn" onClick={(event) => runInline(event, "saveBankDetails()")}>
                        <i className="fas fa-save" style={{ marginRight: "8px" }}></i>Save Bank Details
                    </button>

                    {/* Saved Bank Info */}

                    <div id="savedBankInfo" className="wallet-card wallet-card-success" style={{ display: "none", marginTop: "1.4rem" }}>
                        <div style={{ color: "#22c55e", fontWeight: "700", fontSize: "12.5px", marginBottom: "0.9rem" }}>
                            <i className="fas fa-check-circle" style={{ marginRight: "8px" }}></i>Saved Bank Account
                        </div>
                        <div className="wallet-info-row">
                            <span className="wallet-info-row-label"><i className="fas fa-building-columns"></i>Bank</span>
                            <span className="wallet-info-row-value" id="displayBankName">-</span>
                        </div>
                        <div className="wallet-info-row">
                            <span className="wallet-info-row-label"><i className="fas fa-key"></i>Account</span>
                            <span className="wallet-info-row-value" id="displayAccountNumber">****</span>
                        </div>
                        <div className="wallet-info-row">
                            <span className="wallet-info-row-label"><i className="fas fa-user"></i>Holder</span>
                            <span className="wallet-info-row-value" id="displayAccountName">-</span>
                        </div>
                        <div style={{ color: "#FFB74D", fontSize: "0.8rem", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
                            <i className="fas fa-lock" style={{ marginRight: "6px" }}></i><span id="editLockMessage">Next
                                edit available in: calculating...</span>
                        </div>
                    </div>
                </div>

                {/* History Tab */}

                <div className="wallet-tab-content" id="history">
                    <h3 className="wallet-tab-title">Transaction History</h3>

                    <div id="walletHistoryContainer">
                        <div style={{ textAlign: "center", color: "#6b6b80", padding: "2.5rem 1rem", fontSize: "13px" }}>
                            No transactions yet
                        </div>
                    </div>
                </div>

                {/* Security Tab */}

                <div className="wallet-tab-content" id="security">
                    <h3 className="wallet-tab-title"><i className="fas fa-shield-alt"></i>Wallet Security</h3>

                    <div className="wallet-card wallet-card-accent">
                        <div className="wallet-card-title"><i className="fas fa-lock"></i>PIN Protection</div>
                        <p className="wallet-card-text" style={{ margin: "0" }}>A 6-digit PIN secures your wallet. Set how often it is required for payments below.</p>
                    </div>

                    <div id="pinStatusDisplay" className="wallet-card">
                        <div style={{ color: "#9a94b8", fontWeight: "700", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: "8px" }}>PIN Status</div>
                        <div style={{ color: "#FFFFFF", fontSize: "1.05rem", fontWeight: "600" }} id="pinStatusText"><i className="fas fa-spinner fa-spin"></i> Checking...</div>
                    </div>

                    <button className="wallet-submit-btn" id="pinActionBtn" onClick={(event) => runInline(event, "handlePinAction()")} style={{ marginBottom: "0.9rem" }}>
                        <i className="fas fa-key" style={{ marginRight: "8px" }}></i>Create PIN
                    </button>

                    <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
                        <a href="#" onClick={(event) => runInline(event, "forgotWalletPin();return false;")} style={{ color: "#a78bfa", fontSize: "12.5px", textDecoration: "none", fontWeight: "600" }}><i className="fas fa-envelope" style={{ marginRight: "5px" }}></i>Forgot PIN? Reset via email</a>
                    </div>

                    {/* PIN payment behaviour setting */}

                    <div className="wallet-card">
                        <div className="wallet-card-title" style={{ marginBottom: "4px" }}><i className="fas fa-sliders-h"></i>PIN Required For Payments</div>
                        <div style={{ color: "#6b6b80", fontSize: "11.5px", marginBottom: "12px" }}>Choose when your PIN is asked before sending gifts or buying content</div>
                        <label className="wallet-radio-option">
                            <input type="radio" name="pinPayMode" value="always" id="pinModeAlways" onChange={(event) => runInline(event, "savePinPayMode('always')")} />
                            <div>
                                <div className="wallet-radio-title">Always ask</div>
                                <div className="wallet-radio-sub">PIN required for every payment</div>
                            </div>
                        </label>
                        <label className="wallet-radio-option">
                            <input type="radio" name="pinPayMode" value="5min" id="pinMode5min" onChange={(event) => runInline(event, "savePinPayMode('5min')")} />
                            <div>
                                <div className="wallet-radio-title">Ask once every 5 minutes</div>
                                <div className="wallet-radio-sub">PIN skipped for 5 mins after entering it</div>
                            </div>
                        </label>
                        <label className="wallet-radio-option">
                            <input type="radio" name="pinPayMode" value="never" id="pinModeNever" onChange={(event) => runInline(event, "savePinPayMode('never')")} />
                            <div>
                                <div className="wallet-radio-title">Never ask</div>
                                <div className="wallet-radio-sub">No PIN needed for payments (less secure)</div>
                            </div>
                        </label>
                    </div>

                    {/* Email security alerts */}

                    <div className="wallet-card wallet-toggle-row">
                        <div>
                            <div className="wallet-card-title" style={{ marginBottom: "4px" }}><i className="fas fa-envelope-open-text"></i>Email Security Alerts</div>
                            <div style={{ color: "#6b6b80", fontSize: "11.5px" }}>Get notified at your sign-up email when your PIN changes or a withdrawal is requested</div>
                        </div>
                        <label className="rec-toggle-switch" style={{ flexShrink: "0" }}>
                            <input type="checkbox" id="emailAlertsToggle" onChange={(event) => runInline(event, "setEmailAlertsEnabled(this.checked)")} />
                            <span className="rec-toggle-slider"></span>
                        </label>
                    </div>

                    <div className="wallet-card wallet-card-warn">
                        <div style={{ color: "#d97706", fontWeight: "700", fontSize: "12.5px", marginBottom: "0.7rem" }}><i className="fas fa-exclamation-triangle" style={{ marginRight: "6px" }}></i>Important</div>
                        <ul style={{ color: "#9a94b8", fontSize: "12px", lineHeight: "1.8", margin: "0", paddingLeft: "1.3rem" }}>
                            <li>Never share your PIN with anyone</li>
                            <li>You can change your PIN anytime from this screen</li>
                            <li>Forgotten PINs can be reset via a secure link sent to your email</li>
                        </ul>
                    </div>
                </div>

                <div className="wallet-tab-content" id="kyc">
                    <h3 className="wallet-tab-title"><i className="fas fa-id-card"></i>Identity Verification (KYC)</h3>
                    <p className="wallet-tab-desc">Verify your identity to increase your withdrawal limit.</p>
                    <div id="kycStatusBanner" style={{ marginBottom: "1.2rem" }}></div>
                    <div id="kycTierCards"></div>
                </div>
            </div>
        </div>
    </div>

    {/* Purchase Modal for Pose Coin */}

    <div className="purchase-modal" id="purchaseModal">
        <div className="purchase-content">
            <button className="purchase-close" onClick={(event) => runInline(event, "closePurchaseModal()")}>×</button>

            <div className="purchase-header">
                <span className="purchase-icon"><i className="fas fa-lock-open"></i></span>
                <h2 id="purchaseTitle">Premium Content</h2>
            </div>

            <div className="purchase-details">
                <div className="purchase-detail-item">
                    <span className="purchase-label">Content Title</span>
                    <span className="purchase-value" id="purchaseTitle2">-</span>
                </div>
                <div className="purchase-detail-item">
                    <span className="purchase-label">Your Balance</span>
                    <span className="purchase-value" id="purchaseBalance">0 Pose Coin</span>
                </div>
                <div className="purchase-detail-item">
                    <span className="purchase-label">Cost</span>
                    <span className="purchase-value purchase-price" id="purchaseCostDisplay">0 Pose Coin</span>
                </div>
            </div>

            <div className="purchase-warning">
                <p id="purchaseWarningText">This action cannot be undone. You will lose Pose Coins from your balance.</p>
            </div>

            <div className="purchase-buttons">
                <button className="purchase-btn-cancel" onClick={(event) => runInline(event, "closePurchaseModal()")}>Cancel</button>
                <button className="purchase-btn-confirm" onClick={(event) => runInline(event, "confirmPurchase()")}>✅ Confirm</button>
            </div>
        </div>
    </div>

    {/* Withdraw Earnings Modal (Pose Star / Pose Coin - single flow, no fees) */}

    <div className="withdrawal-modal-overlay" id="earningsWithdrawalModalOverlay">
        <div className="withdrawal-modal-content">
            <button className="withdrawal-modal-close" onClick={(event) => runInline(event, "closeEarningsWithdrawalModal()")}>×</button>

            <div className="withdrawal-modal-header">
                <h2 style={{ color: "#FFFFFF", marginBottom: "0.5rem" }}>⭐ Withdraw Earnings</h2>
                <p style={{ color: "#999", fontSize: "0.9rem" }}>Withdraw your Pose Star or Pose Coin balance to your bank account</p>
            </div>

            <div className="withdrawal-form">
                <div className="withdrawal-form-group">
                    <label className="withdrawal-form-label">Withdraw From</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="ew-currency-tab active" id="ewTab_poseCoin" onClick={(event) => runInline(event, "selectEarningsCurrency('poseCoin')")}>
                            <div><i className="fas fa-coins" style={{ color: "#FFD700" }}></i> Pose Coin</div>
                        </div>
                        <div className="ew-currency-tab ew-currency-tab-star" id="ewTab_poseStar" onClick={(event) => runInline(event, "selectEarningsCurrency('poseStar')")}>
                            <div><i className="fas fa-star" style={{ color: "#fbbf24" }}></i> Pose Star</div>
                        </div>
                    </div>
                    <input type="hidden" id="selectedEarningsCurrency" value="poseCoin" />
                </div>

                <div className="withdrawal-form-group">
                    <label className="withdrawal-form-label">Available Balance</label>
                    <div style={{ color: "#4C1D95", fontSize: "1.8rem", fontWeight: "900" }} id="ewAvailableBalance">0 Pose Coin</div>
                </div>

                <div className="withdrawal-form-group">
                    <label className="withdrawal-form-label">Amount to Withdraw</label>
                    <div className="withdrawal-amount-input-wrapper">
                        <input type="number" className="withdrawal-amount-input" id="ewAmount" placeholder="Enter amount" min="50000" max="200000" onInput={(event) => runInline(event, "ewValidateAmount()")} style={{ paddingLeft: "1rem" }} />
                    </div>
                    <div className="withdrawal-form-info" id="ewLimitsInfo">Minimum 50,000 · Maximum 200,000 per request. No charges.</div>
                </div>

                <div className="withdrawal-form-group" style={{ background: "#0a0a0a", padding: "1rem", borderRadius: "10px", border: "2px solid #333" }}>
                    <div style={{ color: "#999", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Saved Bank Details:</div>
                    <div id="ewBankInfo" style={{ color: "#FFFFFF", fontWeight: "700" }}>
                        <div id="ewBankName" style={{ marginBottom: "0.5rem" }}>Bank: -</div>
                        <div id="ewAccountNumber" style={{ marginBottom: "0.5rem" }}>Account: ****</div>
                        <div id="ewAccountName">Name: -</div>
                    </div>
                    <button type="button" onClick={(event) => runInline(event, "switchWalletTab('set-bank')")} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "transparent", color: "#4C1D95", border: "2px solid #4C1D95", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "0.85rem" }}>
                        Change Bank Account
                    </button>
                </div>

                <div id="ewStatus" className="withdrawal-status"></div>

                <button className="withdrawal-pay-btn" id="ewSubmitBtn" onClick={(event) => runInline(event, "submitEarningsWithdrawal()")} style={{ background: "linear-gradient(135deg, #fbbf24 0%, #7c3aed 55%, #22c55e 100%)", color: "#0a0a0a" }}>
                    <span id="ewSubmitBtnText">⭐ Request Withdrawal</span>
                </button>

                <div className="withdrawal-info-box">
                    <p style={{ color: "#999", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        <span style={{ fontWeight: "700" }}>🔐 One withdrawal method, no charges.</span><br />
                        Your PIN is required to confirm. Requests are reviewed and paid out to your saved bank account.
                    </p>
                </div>
            </div>
        </div>
    </div>

    {/* Create/Change Wallet PIN Modal */}

    <div className="pin-modal-overlay" id="pinModalOverlay">
        <div className="pin-modal">
            <button className="pin-modal-close" onClick={(event) => runInline(event, "closePinModal()")}>×</button>

            <div className="pin-modal-header">
                <div className="pin-modal-title" id="pinModalTitle">Create Wallet PIN</div>
                <div className="pin-modal-subtitle" id="pinModalSubtitle">Set a 6-digit PIN to secure your wallet</div>
            </div>

            <div className="pin-info" id="pinInfo">
                🔒 Your PIN protects your wallet from unauthorized transactions. Don&apos;t share it with anyone!
            </div>

            <div className="pin-status" id="pinStatus"></div>

            <div className="pin-input-group" id="pinInputGroup">
                <input type="password" className="pin-input" id="pinInput1" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handlePinInput(event, 1)")} />
                <input type="password" className="pin-input" id="pinInput2" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handlePinInput(event, 2)")} />
                <input type="password" className="pin-input" id="pinInput3" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handlePinInput(event, 3)")} />
                <input type="password" className="pin-input" id="pinInput4" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handlePinInput(event, 4)")} />
                <input type="password" className="pin-input" id="pinInput5" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handlePinInput(event, 5)")} />
                <input type="password" className="pin-input" id="pinInput6" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handlePinInput(event, 6)")} />
            </div>

            <div className="pin-toggle-visibility">
                <label>
                    <input type="checkbox" id="pinVisibilityToggle" onChange={(event) => runInline(event, "togglePinVisibility()")} />
                    Show PIN
                </label>
            </div>

            <div id="pinForgotLink" style={{ display: "none", textAlign: "center", margin: "0.5rem 0 1rem" }}>
                <a href="#" onClick={(event) => runInline(event, "forgotWalletPin();return false;")} style={{ color: "#a78bfa", fontSize: "12.5px", textDecoration: "none" }}><i className="fas fa-envelope" style={{ marginRight: "5px" }}></i>Forgot PIN? Verify by email</a>
            </div>

            <div id="pinConfirmSection" style={{ display: "none" }}>
                <div className="pin-modal-subtitle" style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
                    Confirm your PIN
                </div>
                <div className="pin-input-group" id="pinConfirmInputGroup">
                    <input type="password" className="pin-input confirm" id="pinConfirmInput1" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handleConfirmPinInput(event, 1)")} />
                    <input type="password" className="pin-input confirm" id="pinConfirmInput2" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handleConfirmPinInput(event, 2)")} />
                    <input type="password" className="pin-input confirm" id="pinConfirmInput3" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handleConfirmPinInput(event, 3)")} />
                    <input type="password" className="pin-input confirm" id="pinConfirmInput4" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handleConfirmPinInput(event, 4)")} />
                    <input type="password" className="pin-input confirm" id="pinConfirmInput5" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handleConfirmPinInput(event, 5)")} />
                    <input type="password" className="pin-input confirm" id="pinConfirmInput6" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "handleConfirmPinInput(event, 6)")} />
                </div>
            </div>

            <div className="pin-button-group">
                <button className="pin-action-btn secondary" onClick={(event) => runInline(event, "closePinModal()")}>Cancel</button>
                <button className="pin-action-btn primary" id="pinSubmitBtn" onClick={(event) => runInline(event, "submitPin()")} disabled>Create
                    PIN</button>
            </div>
        </div>
    </div>

    {/* Wallet Onboarding Modal (mandatory first-time setup: phone = wallet ID + PIN) */}

    <div className="pin-modal-overlay" id="walletOnboardingModalOverlay">
        <div className="pin-modal">
            <button className="pin-modal-close" onClick={(event) => runInline(event, "closeWalletOnboardingModal()")}>×</button>

            <div className="pin-modal-header">
                <div className="pin-modal-title">Secure Your Wallet</div>
                <div className="pin-modal-subtitle">Add your phone number and create a PIN to continue</div>
            </div>

            <div className="pin-info">
                🔒 Your phone number becomes your wallet ID and your PIN protects it from unauthorized transactions.
            </div>

            <div className="pin-status" id="woStatus"></div>

            <label className="kyc-form-label" style={{ display: "block", marginBottom: "6px" }}>Country</label>
            <select className="kyc-form-input" id="woCountry" onChange={(event) => runInline(event, "woOnCountryChange()")} style={{ marginBottom: "1rem" }}></select>

            <label className="kyc-form-label" style={{ display: "block", marginBottom: "6px" }}>Phone Number</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem" }}>
                <div id="woDialCode" style={{ flex: "0 0 auto", display: "flex", alignItems: "center", background: "#1a1a2e", border: "1px solid #333", borderRadius: "10px", padding: "0 14px", color: "#c4b5fd", fontSize: "14px", fontWeight: "700" }}>+234</div>
                <input className="kyc-form-input" id="woPhone" type="tel" placeholder="800 000 0000" style={{ marginBottom: "0", flex: "1" }} onInput={(event) => runInline(event, "woCheckComplete()")} />
            </div>

            <div className="pin-modal-subtitle" style={{ marginBottom: "0.75rem" }}>Create a 6-digit PIN</div>
            <div className="pin-input-group">
                <input type="password" className="pin-input" id="woPin1" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 1, 'woPin')")} />
                <input type="password" className="pin-input" id="woPin2" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 2, 'woPin')")} />
                <input type="password" className="pin-input" id="woPin3" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 3, 'woPin')")} />
                <input type="password" className="pin-input" id="woPin4" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 4, 'woPin')")} />
                <input type="password" className="pin-input" id="woPin5" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 5, 'woPin')")} />
                <input type="password" className="pin-input" id="woPin6" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 6, 'woPin')")} />
            </div>

            <div className="pin-modal-subtitle" style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>Confirm your PIN</div>
            <div className="pin-input-group">
                <input type="password" className="pin-input confirm" id="woPinConfirm1" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 1, 'woPinConfirm')")} />
                <input type="password" className="pin-input confirm" id="woPinConfirm2" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 2, 'woPinConfirm')")} />
                <input type="password" className="pin-input confirm" id="woPinConfirm3" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 3, 'woPinConfirm')")} />
                <input type="password" className="pin-input confirm" id="woPinConfirm4" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 4, 'woPinConfirm')")} />
                <input type="password" className="pin-input confirm" id="woPinConfirm5" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 5, 'woPinConfirm')")} />
                <input type="password" className="pin-input confirm" id="woPinConfirm6" maxLength={1} placeholder="\u2022" onInput={(event) => runInline(event, "woHandlePinInput(event, 6, 'woPinConfirm')")} />
            </div>

            <div className="pin-button-group">
                <button className="pin-action-btn primary" id="woSubmitBtn" onClick={(event) => runInline(event, "submitWalletOnboarding()")} style={{ width: "100%" }} disabled>Secure My Wallet</button>
            </div>
        </div>
    </div>

