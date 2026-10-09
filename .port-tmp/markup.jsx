
<div id="dashLoader">
<div className="dash-spinner"></div>
<p>Loading your channel…</p>
</div>

<div id="page-home" className="page active">

<div className="topbar">
<div className="topbar-brand" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <img src="/logo.png" alt="Pose" width="32" height="32" style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover", flexShrink: "0" }} />
  <span>Pose <em>Channel</em></span>
</div>
<div className="topbar-actions">
<button className="btn btn-ghost" style={{ position: "relative" }} onClick={(event) => runInline(event, "openInboxPopup()")}>
<i className="fas fa-inbox"></i>
Inbox
<span id="inboxBadge" style={{ display: "none", position: "absolute", top: "-4px", right: "-4px", background: "#DC2626", color: "#fff", fontSize: "10px", fontWeight: "700", minWidth: "16px", height: "16px", borderRadius: "99px", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>0</span>
</button>
<button className="btn btn-ghost" onClick={(event) => runInline(event, "openSettings()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
<circle cx="12" cy="12" r="3" />
</svg>
Settings
</button>
<button className="btn btn-purple" onClick={(event) => runInline(event, "goBackToPose()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M19 12H5M12 5l-7 7 7 7" />
</svg>
Go Back to Pose
</button>
</div>
</div>

<div className="tabs-bar">
<div className="tab-item active" data-tab="home" onClick={(event) => runInline(event, "onMainTab(this,'home')")}>
<i className="fas fa-house"></i> Home
</div>
<div className="tab-item" data-tab="studio" onClick={(event) => runInline(event, "onMainTab(this,'studio')")}>
<i className="fas fa-film"></i> Studio
</div>
<div className="tab-item" data-tab="earnings" onClick={(event) => runInline(event, "onMainTab(this,'earnings')")}>
<i className="fas fa-coins"></i> Earnings
</div>
<div className="tab-item" data-tab="legibility" onClick={(event) => runInline(event, "onMainTab(this,'legibility')")}>
<i className="fas fa-clipboard-list"></i> Legibility
</div>
</div>

<div className="channel-banner" onClick={(event) => runInline(event, "viewFullImage(channelData && channelData.bannerURL, 'Channel Banner')")}>
<div className="banner-upload-hint" onClick={(event) => runInline(event, "event.stopPropagation(); openModal('bannerModal')")} style={{ cursor: "pointer" }}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
</svg>
Edit banner
</div>
<div className="channel-avatar-wrap" title="View channel photo" onClick={(event) => runInline(event, "event.stopPropagation(); viewFullImage(channelData && channelData.profileURL, 'Channel Photo')")} style={{ cursor: "pointer" }}>
<span className="channel-avatar-initials">P</span>
</div>
<div className="avatar-edit-btn" title="Change channel photo" onClick={(event) => runInline(event, "event.stopPropagation(); openModal('photoModal')")}>
<i className="fa-solid fa-camera"></i>
</div>
</div>

<div className="channel-info">
<div className="channel-name">Pose Channel</div>
<div className="channel-handle">@posechannel  ·  Creator</div>
<span className="channel-badge">
<i className="fas fa-circle-check"></i> Verified Creator
</span>
</div>

<div className="stats-container">
<div className="stat-card">
<div className="stat-icon"><i className="fas fa-eye"></i></div>
<div className="stat-value" id="statViews">—</div>
<div className="stat-label">Total Views</div>
</div>
<div className="stat-card">
<div className="stat-icon" style={{ color: "#f472b6" }}><i className="fas fa-thumbs-up"></i></div>
<div className="stat-value" id="statLikes">—</div>
<div className="stat-label">Total Likes</div>
</div>
<div className="stat-card">
<div className="stat-icon"><i className="fas fa-film"></i></div>
<div className="stat-value" id="statVideos">—</div>
<div className="stat-label">Videos</div>
</div>
<div className="stat-card">
<div className="stat-icon" style={{ color: "#f87171" }}><i className="fas fa-heart"></i></div>
<div className="stat-value" id="statFans">—</div>
<div className="stat-label">Fans</div>
</div>
</div>

{/* Channel-wide payout requirement strip (always visible on home) */}

<div id="homeEligStrip" onClick={(event) => runInline(event, "onMainTab(document.querySelector(\".tab-item[data-tab=\\\"earnings\\\"]\"),\"earnings\");")} style={{ cursor: "pointer", margin: "0 16px 14px", padding: "11px 14px", borderRadius: "12px", background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: "10px" }}>
<div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F59E0B", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
<i className="fas fa-shield-halved"></i>
</div>
<div style={{ flex: "1", minWidth: "0" }}>
<div style={{ fontSize: "12.5px", fontWeight: "800", color: "#78350F", lineHeight: "1.3" }}>
Payout Requirements
</div>
<div id="homeEligText" style={{ fontSize: "11px", color: "#92400E", lineHeight: "1.4", marginTop: "2px" }}>
Paid videos need <b>10 views</b> to start earning, then release every <b>5 hours</b> · <b id="homeSlotsRemaining">5</b> pricing slots left this month.
</div>
</div>
<i className="fas fa-chevron-right" style={{ color: "#92400E", fontSize: "11px", flexShrink: "0" }}></i>
</div>

<div className="cta-row">
<button className="btn btn-purple btn-lg" onClick={(event) => runInline(event, "openUpload()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
</svg>
Upload Video
</button>
<button className="btn btn-outline-purple btn-lg" onClick={(event) => runInline(event, "openAllVideos()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
</svg>
See All Videos
</button>
</div>

</div>{/* /page-home */}


<div id="page-studio" className="page">

<div className="studio-topbar">
<button className="back-btn" onClick={(event) => runInline(event, "goBack()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M19 12H5M12 5l-7 7 7 7" />
</svg>
Back
</button>
<span className="studio-title">Studio Analytics</span>
</div>

<div className="studio-layout">

<div className="studio-sidebar">
<div className="sb-tab active" onClick={(event) => runInline(event, "onSidebarTab(this,'views')")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
</svg>
<span className="sb-label">Views</span>
</div>
<div className="sb-tab" onClick={(event) => runInline(event, "onSidebarTab(this,'likes')")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
</svg>
<span className="sb-label">Likes</span>
</div>
<div className="sb-tab" onClick={(event) => runInline(event, "onSidebarTab(this,'fan')")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
<span className="sb-label">Fan</span>
</div>
<div className="sb-tab" onClick={(event) => runInline(event, "onSidebarTab(this,'comments')")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
</svg>
<span className="sb-label">Cmts</span>
</div>
<div className="sb-tab" onClick={(event) => runInline(event, "onSidebarTab(this,'engagement')")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
</svg>
<span className="sb-label">Engage</span>
</div>
</div>

<div className="studio-content">

<div className="card analytics-card">
<div className="analytics-header">
<div>
<div className="analytics-htitle" id="aTitle">Monthly Views</div>
<div className="analytics-hsub" id="aSub">Total views across all content · Last 6 months</div>
</div>
<div className="analytics-period-badge">Last 6 months</div>
</div>
<div className="analytics-nums" id="aNums"></div>
<div className="chart-wrap">
<canvas id="analyticsChart"></canvas>
</div>
</div>

<div className="card banner-section">
<div className="banner-title">
<i className="fas fa-fire"></i> Most Watched Videos
<span className="banner-badge">Top 10</span>
</div>
<div className="banner-scroll" id="banner-watched"></div>
</div>

<div className="card banner-section">
<div className="banner-title">
<i className="fas fa-coins"></i> Most Paid Videos
<span className="banner-badge">Top Earners</span>
</div>
<div className="banner-scroll" id="banner-paid"></div>
</div>

<div className="two-col-banners">
<div className="card banner-section">
<div className="banner-title">
<i className="fas fa-heart"></i> Most Liked
</div>
<div className="banner-scroll" id="banner-liked"></div>
</div>
<div className="card banner-section">
<div className="banner-title">
<i className="fas fa-bolt"></i> Most Engaged
</div>
<div className="banner-scroll" id="banner-engaged"></div>
</div>
</div>

<div className="card table-section">
<div className="table-header-row">
<div className="table-title">Video Performance</div>
<div className="period-tabs">
<div className="ptab active" onClick={(event) => runInline(event, "onPeriod(this,'24h')")}>24 hrs</div>
<div className="ptab" onClick={(event) => runInline(event, "onPeriod(this,'72h')")}>72 hrs</div>
<div className="ptab" onClick={(event) => runInline(event, "onPeriod(this,'7d')")}>7 days</div>
</div>
</div>
<table>
<thead>
<tr>
<th>Video</th>
<th className="c"><i className="fas fa-eye"></i> Views</th>
<th className="c"><i className="fas fa-heart"></i> Likes</th>
<th className="c"><i className="fas fa-comment"></i> Comments</th>
<th className="c"><i className="fas fa-coins"></i> Coins</th>
</tr>
</thead>
<tbody id="perfBody"></tbody>
</table>
</div>

</div>{/* /studio-content */}

</div>{/* /studio-layout */}

</div>{/* /page-studio */}


<div id="page-earnings" className="page">

<div className="studio-topbar">
<button className="back-btn" onClick={(event) => runInline(event, "goBackFromEarnings()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M19 12H5M12 5l-7 7 7 7" />
</svg>
Back
</button>
<span className="studio-title">Earnings</span>
</div>

<div style={{ padding: "16px 18px 0" }}>
<div style={{ fontSize: "12px", fontWeight: "600", color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: ".6px" }}>Paid Views Earnings</div>
</div>

<div style={{ padding: "16px 18px" }}>
<div className="card" style={{ padding: "22px" }}>

<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
<span style={{ fontSize: "13px", fontWeight: "500", color: "var(--gray-500)" }}>Revenue Summary</span>
<div style={{ display: "flex", alignItems: "center", gap: "0", background: "var(--gray-100)", borderRadius: "9px", padding: "3px", border: "1px solid var(--gray-200)" }}>
<div className="curr-btn active" id="currNGN" onClick={(event) => runInline(event, "onCurrency('NGN')")}>₦ NGN</div>
<div className="curr-btn" id="currCOIN" onClick={(event) => runInline(event, "onCurrency('COIN')")}>🪙 Coin</div>
<div className="curr-btn" id="currUSER" onClick={(event) => runInline(event, "onCurrency('USER')")}>🌍 Local</div>
</div>
</div>

<div id="directRevRow" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--gray-100)" }}>
<div>
<div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: ".7px", color: "var(--gray-400)", fontWeight: "600" }}>Paid Views Revenue</div>
<div style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "3px" }}>Pose Coin pay-per-view purchases</div>
</div>
<div style={{ textAlign: "right" }}>
<div style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", fontWeight: "700", color: "var(--purple-deep)" }} id="directRevDisplay">—</div>
<div style={{ fontSize: "11px", color: "var(--green)", fontWeight: "600", marginTop: "2px" }} id="directRevChange">—</div>
</div>
</div>

<div style={{ marginTop: "18px", background: "var(--purple-ghost)", border: "1.5px solid var(--purple-pale)", borderRadius: "14px", padding: "18px 20px", textAlign: "center" }}>
<div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".9px", fontWeight: "700", color: "var(--purple-mid)", marginBottom: "8px" }}>Total Take-Home</div>
<div id="totalRevDisplay" style={{ fontFamily: "'Playfair Display',serif", fontWeight: "700", color: "var(--purple-deep)", lineHeight: "1", fontSize: "42px" }}>—</div>
<div style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "8px" }} id="totalRevSub">—</div>
</div>

{/* Advanced Earnings Analysis */}

<div style={{ marginTop: "24px" }}>
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
<span style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-900)" }}>Revenue Trends</span>
<span style={{ fontSize: "11px", color: "var(--purple-main)", fontWeight: "600" }}>Last 7 Days</span>
</div>
<div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "16px", height: "220px", marginBottom: "20px" }}>
<canvas id="earningsTrendChart"></canvas>
</div>

<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
<div style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: "14px", padding: "14px" }}>
<div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--gray-400)", fontWeight: "700", letterSpacing: "0.5px" }}>Avg. Daily</div>
<div id="avgDailyRev" style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", marginTop: "4px" }}>₦0</div>
<div style={{ fontSize: "10px", color: "var(--green)", fontWeight: "600", marginTop: "2px" }}>Stable</div>
</div>
<div style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: "14px", padding: "14px" }}>
<div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--gray-400)", fontWeight: "700", letterSpacing: "0.5px" }}>Est. Monthly</div>
<div id="estMonthlyRev" style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", marginTop: "4px" }}>₦0</div>
<div style={{ fontSize: "10px", color: "var(--purple-main)", fontWeight: "600", marginTop: "2px" }}>Projected</div>
</div>
</div>
</div>

{/* Available vs Locked breakdown */}

<div id="availLockBox" style={{ display: "grid", marginTop: "14px", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
<div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "12px", padding: "12px" }}>
<div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: ".7px", fontWeight: "700", color: "#047857" }}>Available to Withdraw</div>
<div id="availAmount" style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: "700", color: "#065F46", marginTop: "4px" }}>₦0</div>
<div style={{ fontSize: "10.5px", color: "#047857", marginTop: "2px" }}>Met 1K / 10-view rules</div>
</div>
<div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", padding: "12px" }}>
<div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: ".7px", fontWeight: "700", color: "#92400E" }}>🔒 Locked in Pools</div>
<div id="lockedAmount" style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: "700", color: "#78350F", marginTop: "4px" }}>₦0</div>
<div style={{ fontSize: "10.5px", color: "#92400E", marginTop: "2px" }}>Releases as views build up</div>
</div>
</div>

{/* Eligibility / threshold banner */}

<div id="eligibilityBanner" style={{ marginTop: "14px", background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", border: "1px solid #FDE68A", borderRadius: "12px", padding: "12px 14px" }}>
<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
<i className="fas fa-shield-halved" style={{ color: "#D97706" }}></i>
<span style={{ fontSize: "12.5px", fontWeight: "800", color: "#78350F" }}>Withdrawal Requirements</span>
</div>
<div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.55", marginBottom: "8px" }}>
<b>Paid Videos:</b> each paid video needs <b>10 total views</b> to start earning — after that, earnings release every <b>5 hours</b> for however many views it got.
</div>

{/* Paid progress */}

<div id="paidEligibilityRow" style={{ background: "#fff", border: "1px solid #FDE68A", borderRadius: "10px", padding: "10px 12px" }}>
<div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", fontWeight: "700", color: "#78350F", marginBottom: "4px" }}>
<span><i className="fas fa-coins" style={{ marginRight: "4px" }}></i> Paid Video Pool</span>
<span id="paidEligStatus">—</span>
</div>
<div id="paidEligText" style={{ fontSize: "10.5px", color: "#92400E", marginTop: "2px", lineHeight: "1.5" }}>—</div>
</div>
</div>

<div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px" }} id="rateNote">
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2">
<circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
</svg>
<span style={{ fontSize: "11px", color: "var(--gray-400)" }} id="rateNoteText">Loading live exchange rate…</span>
</div>
</div>
</div>

{/* Action Buttons */}

<div style={{ padding: "0 18px 12px", display: "flex", gap: "8px" }}>
<button onClick={(event) => runInline(event, "openPayMethodPopup()")} style={{ flex: "1", padding: "13px 8px", borderRadius: "13px", background: "linear-gradient(135deg,var(--purple-deep),var(--purple-main))", color: "white", fontSize: "12px", fontWeight: "700", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 14px rgba(124,58,237,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
<i className="fas fa-building-columns"></i> Payment
</button>
<button onClick={(event) => runInline(event, "openWithdrawPopup()")} style={{ flex: "1", padding: "13px 8px", borderRadius: "13px", background: "linear-gradient(135deg,#059669,#10B981)", color: "white", fontSize: "12px", fontWeight: "700", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 14px rgba(5,150,105,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
<i className="fas fa-wallet"></i> Withdraw
</button>
<button onClick={(event) => runInline(event, "openHistoryPopup()")} style={{ flex: "1", padding: "13px 8px", borderRadius: "13px", background: "linear-gradient(135deg,#1E40AF,#3B82F6)", color: "white", fontSize: "12px", fontWeight: "700", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 14px rgba(59,130,246,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
<i className="fas fa-clock-rotate-left"></i> History
</button>
</div>

<div style={{ padding: "0 18px 16px" }}>
<div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "10px 14px" }}>
<i className="fas fa-clock" style={{ color: "#D97706", fontSize: "12px" }}></i>
<span style={{ fontSize: "11px", color: "#92400E", lineHeight: "1.4" }}>Withdrawals are processed <b>9 AM – 12 AM daily</b> · Takes <b>15 min to 1 hour</b></span>
</div>
</div>


<div style={{ padding: "0 18px 30px" }}>
<div className="card" style={{ padding: "20px" }}>
<div style={{ fontFamily: "'Playfair Display',serif", fontSize: "15.5px", fontWeight: "700", color: "var(--text-main)", marginBottom: "16px" }}>
<i className="fas fa-calendar-days" style={{ marginRight: "6px" }}></i> Revenue Timeline
</div>
<div style={{ display: "flex", gap: "6px", marginBottom: "18px", flexWrap: "wrap" }}>
<div className="tl-pill active" onClick={(event) => runInline(event, "onTimeline(this,'24h')")}>24 hrs</div>
<div className="tl-pill" onClick={(event) => runInline(event, "onTimeline(this,'72h')")}>72 hrs</div>
<div className="tl-pill" onClick={(event) => runInline(event, "onTimeline(this,'7d')")}>7 days</div>
<div className="tl-pill" onClick={(event) => runInline(event, "onTimeline(this,'30d')")}>30 days</div>
</div>
<div id="timelineList" style={{ display: "flex", flexDirection: "column", gap: "10px" }}></div>
</div>
</div>

</div>{/* /page-earnings */}


{/* ============ INBOX POPUP ============ */}

<div id="inboxPopup" className="inbox-popup-overlay hidden" onClick={(event) => runInline(event, "if(event.target===this)closeInboxPopup();")}>
<div className="inbox-popup-card">
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
<div style={{ fontFamily: "'Playfair Display',serif", fontSize: "19px", fontWeight: "700", color: "var(--text-main)" }}>
<i className="fas fa-inbox" style={{ marginRight: "6px", color: "var(--purple-main)" }}></i> Inbox
</div>
<button onClick={(event) => runInline(event, "closeInboxPopup()")} style={{ background: "none", border: "none", fontSize: "18px", color: "var(--gray-400)", cursor: "pointer", padding: "4px" }}>
<i className="fas fa-xmark"></i>
</button>
</div>
<div id="inboxList"></div>
</div>
</div>

{/* ============ GLOBAL MODAL / TOAST CONTAINERS ============
     Used by openModal()/closeModal()/showToast() — kept at the top level
     (not inside page-settings) so they exist from first load, letting
     Edit/Change-photo/Change-banner controls work from any page, not just
     after Settings has been opened once. */}

<div id="settModals"></div>
<div id="settToast" style={{ position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%) translateY(20px)", background: "var(--text-main)", color: "white", padding: "10px 22px", borderRadius: "30px", fontSize: "13px", fontWeight: "500", opacity: "0", transition: "all .3s", zIndex: "9999", pointerEvents: "none", whiteSpace: "nowrap" }}></div>

{/* ============ PAYMENT METHOD POPUP ============ */}

<div id="payMethodPopup" className="earn-popup-overlay hidden">
<div className="earn-popup-card">
<div className="uppop-handle"></div>
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
<div style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>
<i className="fas fa-building-columns" style={{ marginRight: "6px", color: "var(--purple-main)" }}></i> Payment Method
</div>
<button onClick={(event) => runInline(event, "closePayMethodPopup()")} style={{ background: "none", border: "none", fontSize: "20px", color: "var(--gray-400)", cursor: "pointer", padding: "4px" }}><i className="fas fa-times"></i></button>
</div>
<div style={{ fontSize: "12px", color: "var(--gray-400)", marginBottom: "18px" }}>Choose how you receive your earnings</div>
<div id="pmDateWarning" style={{ display: "none", background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px" }}>
<div style={{ fontSize: "12px", fontWeight: "600", color: "#DC2626" }}><i className="fas fa-lock" style={{ marginRight: "4px" }}></i> Payment method changes are locked</div>
<div style={{ fontSize: "11px", color: "#991B1B", marginTop: "4px" }}>You can only change your payment method between the <b>1st and 25th</b> of each month.</div>
</div>

<div style={{ display: "flex", gap: "0", background: "var(--gray-100)", borderRadius: "12px", padding: "4px", marginBottom: "20px" }}>
<div className="pay-method-tab active" id="pmAuto" onClick={(event) => runInline(event, "onPayMethod('auto')")}>
<i className="fas fa-clock" style={{ marginRight: "5px" }}></i>Auto Monthly
</div>
<div className="pay-method-tab" id="pmManual" onClick={(event) => runInline(event, "onPayMethod('manual')")}>
<i className="fas fa-hand-holding-dollar" style={{ marginRight: "5px" }}></i>Manual Request
</div>
</div>

<div id="pmAutoDesc" style={{ background: "var(--purple-ghost)", border: "1.5px solid var(--purple-pale)", borderRadius: "12px", padding: "14px 16px", marginBottom: "18px" }}>
<div style={{ fontSize: "13px", fontWeight: "600", color: "var(--purple-deep)", marginBottom: "4px" }}><i className="fas fa-info-circle" style={{ marginRight: "4px" }}></i> Automatic Transfer</div>
<div style={{ fontSize: "12px", color: "var(--gray-500)", lineHeight: "1.5" }}>Your earnings are automatically sent to your bank on the <b>25th of every month</b>. Minimum payout: ₦5,000.</div>
</div>
<div id="pmManualDesc" style={{ background: "#FEF3C7", border: "1.5px solid #FDE68A", borderRadius: "12px", padding: "14px 16px", marginBottom: "18px", display: "none" }}>
<div style={{ fontSize: "13px", fontWeight: "600", color: "#92400E", marginBottom: "4px" }}><i className="fas fa-info-circle" style={{ marginRight: "4px" }}></i> Manual Request</div>
<div style={{ fontSize: "12px", color: "var(--gray-500)", lineHeight: "1.5" }}>Withdraw anytime using the <b>Withdraw</b> button. Minimum: ₦2,000. Fees apply.</div>
</div>

<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
<div>
<label style={{ fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "6px", display: "block" }}>Account Number</label>
<input type="text" id="pmAcctNum" maxLength={10} placeholder="e.g. 0123456789" className="earn-input" />
</div>
<div>
<label style={{ fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "6px", display: "block" }}>Account Name</label>
<input type="text" id="pmAcctName" placeholder="e.g. John Doe" className="earn-input" />
</div>
<div>
<label style={{ fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "6px", display: "block" }}>Bank Name</label>
<input type="text" id="pmBankName" placeholder="e.g. Access Bank" className="earn-input" />
</div>
</div>

<button id="pmSaveBtn" onClick={(event) => runInline(event, "savePaymentMethod()")} className="earn-primary-btn" style={{ marginTop: "18px" }}>
<i className="fas fa-save" style={{ marginRight: "6px" }}></i> Save Payment Details
</button>
<div id="pmSavedBadge" style={{ display: "none", marginTop: "12px", textAlign: "center" }}>
<span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ECFDF5", color: "#059669", fontSize: "12px", fontWeight: "600", padding: "7px 16px", borderRadius: "20px", border: "1px solid #A7F3D0" }}>
<i className="fas fa-check-circle"></i> Payment details saved
</span>
</div>
</div>
</div>

{/* ============ WITHDRAW POPUP ============ */}

<div id="withdrawPopup" className="earn-popup-overlay hidden">
<div className="earn-popup-card">
<div className="uppop-handle"></div>
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
<div style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>
<i className="fas fa-wallet" style={{ marginRight: "6px", color: "#059669" }}></i> Withdraw Earnings
</div>
<button onClick={(event) => runInline(event, "closeWithdrawPopup()")} style={{ background: "none", border: "none", fontSize: "20px", color: "var(--gray-400)", cursor: "pointer", padding: "4px" }}><i className="fas fa-times"></i></button>
</div>

<div style={{ margin: "16px 0", background: "linear-gradient(135deg,var(--purple-deep),var(--purple-main))", borderRadius: "16px", padding: "20px", textAlign: "center", color: "white" }}>
<div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: ".7", marginBottom: "6px" }}>Available Balance</div>
<div id="wdBalance" style={{ fontFamily: "'Playfair Display',serif", fontSize: "36px", fontWeight: "700" }}>₦0</div>
</div>

{/* Amount Input */}

<div style={{ marginBottom: "16px" }}>
<label style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".6px", color: "var(--gray-500)", display: "block", marginBottom: "8px" }}>
<i className="fas fa-coins" style={{ marginRight: "5px", color: "var(--purple-main)" }}></i>Amount to Withdraw
</label>
<div style={{ position: "relative" }}>
<span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", fontWeight: "700", color: "var(--gray-400)" }}>₦</span>
<input type="number" id="wdAmountInput" min="500" placeholder="0" onInput={(event) => runInline(event, "onWdAmountInput(this.value)")} style={{ width: "100%", padding: "13px 14px 13px 30px", borderRadius: "12px", border: "1.5px solid var(--gray-200)", fontSize: "20px", fontWeight: "700", fontFamily: "'Playfair Display',serif", color: "var(--purple-deep)", outline: "none", boxSizing: "border-box", transition: "border .2s" }} onFocus={(event) => runInline(event, "this.style.borderColor='var(--purple-main)'")} onBlur={(event) => runInline(event, "this.style.borderColor='var(--gray-200)'")} />
</div>
{/* Quick amount chips */}

<div id="wdQuickChips" style={{ display: "flex", gap: "7px", marginTop: "10px", flexWrap: "wrap" }}></div>
<div id="wdAmountError" style={{ display: "none", fontSize: "11.5px", color: "var(--red)", marginTop: "6px", fontWeight: "600" }}>
<i className="fas fa-triangle-exclamation" style={{ marginRight: "4px" }}></i><span id="wdAmountErrorText"></span>
</div>
</div>

<div id="wdBankInfo" style={{ background: "var(--gray-50)", border: "1.5px solid var(--gray-200)", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
<div style={{ fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", marginBottom: "8px" }}>Sending to:</div>
<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
<div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }} id="wdAcctName">—</div>
<div style={{ fontSize: "13px", color: "var(--gray-500)" }} id="wdAcctNum">—</div>
<div style={{ fontSize: "12px", color: "var(--gray-400)" }} id="wdBankName">—</div>
</div>
</div>

<div id="wdNoBankMsg" style={{ display: "none", background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: "12px", padding: "14px", marginBottom: "16px", textAlign: "center" }}>
<div style={{ fontSize: "13px", fontWeight: "600", color: "#DC2626", marginBottom: "4px" }}><i className="fas fa-exclamation-triangle" style={{ marginRight: "4px" }}></i> No bank account set up</div>
<div style={{ fontSize: "12px", color: "#991B1B" }}>Go to <b>Payment Method</b> to add your bank details first.</div>
</div>

<div id="wdFeeBreakdown" style={{ background: "var(--purple-ghost)", border: "1.5px solid var(--purple-pale)", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
<div style={{ fontSize: "12px", fontWeight: "600", color: "var(--purple-deep)", marginBottom: "8px" }}><i className="fas fa-receipt" style={{ marginRight: "4px" }}></i> Fee Breakdown</div>
<div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--gray-600)", marginBottom: "4px" }}>
<span>Withdrawal Amount</span><span id="wdAmountDisplay">₦0</span>
</div>
<div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--gray-600)", marginBottom: "4px" }}>
<span>Processing Fee</span><span id="wdFeeDisplay">₦0</span>
</div>
<div style={{ borderTop: "1px solid var(--purple-pale)", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "700", color: "var(--purple-deep)" }}>
<span>You Receive</span><span id="wdReceiveDisplay">₦0</span>
</div>
</div>

<div id="wdMinWarning" style={{ display: "none", background: "#FEF3C7", border: "1.5px solid #FDE68A", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#92400E", textAlign: "center" }}>
<i className="fas fa-info-circle" style={{ marginRight: "4px" }}></i> Minimum withdrawal is ₦500
</div>

<div id="wdMethodWarning" style={{ display: "none", background: "#FEF3C7", border: "1.5px solid #FDE68A", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#92400E", textAlign: "center" }}>
<i className="fas fa-info-circle" style={{ marginRight: "4px" }}></i> Switch payment method to "Manual Request" to withdraw
</div>

<button id="withdrawBtn" onClick={(event) => runInline(event, "requestWithdrawal()")} disabled className="earn-primary-btn" style={{ background: "linear-gradient(135deg,#059669,#10B981)", boxShadow: "0 4px 14px rgba(5,150,105,.3)" }}>
<i className="fas fa-paper-plane" style={{ marginRight: "6px" }}></i> Request Withdrawal
</button>
</div>
</div>

<div id="page-legibility" className="page">

{/* TOP BAR */}

<div className="studio-topbar">
<button className="back-btn" onClick={(event) => runInline(event, "goBackFromLegibility()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M19 12H5M12 5l-7 7 7 7" />
</svg>
Back
</button>
<span className="studio-title">Legibility & Standards</span>
</div>

{/* HERO */}

<div className="leg-hero">
<div className="leg-hero-orb leg-orb1"></div>
<div className="leg-hero-orb leg-orb2"></div>
<div className="leg-hero-orb leg-orb3"></div>
<div className="leg-hero-content">
<div className="leg-hero-badge">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
</svg>
Platform Standards
</div>
<h1 className="leg-hero-title">Pose Channel<br /><em>Legibility Guide</em></h1>
<p className="leg-hero-sub">Everything you need to know about monetization eligibility, content policies, and creator conduct on Pose Channel.</p>
<div className="leg-hero-stats">
<div className="leg-hstat">
<span className="leg-hstat-val" data-count="5">0</span>
<span className="leg-hstat-label">Policy Sections</span>
</div>
<div className="leg-hstat-div"></div>
<div className="leg-hstat">
<span className="leg-hstat-val" data-count="4">0</span>
<span className="leg-hstat-label">Rating Tiers</span>
</div>
<div className="leg-hstat-div"></div>
<div className="leg-hstat">
<span className="leg-hstat-val" data-count="24">0</span>
<span className="leg-hstat-label">Hour Review</span>
</div>
</div>
</div>
</div>

<div className="leg-body">

{/* ════════════════════════════════════════════════
SECTION 01 · MONETIZATION & ELIGIBILITY TIERS
═════════════════════════════════════════════════ */}

<div className="leg-section leg-reveal">
<div className="leg-sec-header">
<div className="leg-sec-icon leg-icon-green">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
</svg>
</div>
<div>
<div className="leg-sec-num">01</div>
<div className="leg-sec-title">Monetization & Eligibility Tiers</div>
</div>
</div>
<p className="leg-sec-desc">Pose Channel earnings come entirely from Pose Coin pay-per-view purchases. Free content builds your audience and reach but does not generate direct revenue on its own.</p>

{/* ── TIER CARDS ── */}

<div className="leg-tiers" style={{ marginBottom: "24px" }}>

{/* Standard / Free Content */}

<div className="leg-tier-card leg-tier-free">
<div className="leg-tier-glow"></div>
<div className="leg-tier-head">
<div className="leg-tier-badge free-badge">
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
</svg>
Standard
</div>
<div className="leg-tier-tag">Free Content</div>
</div>
<div className="leg-tier-metrics">
<div style={{ padding: "14px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "12.5px", fontStyle: "italic" }}>
No requirements — free content is always available to upload
</div>
<div style={{ marginTop: "10px", fontSize: "11px", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "6px", paddingTop: "8px", borderTop: "1px solid var(--gray-100)" }}>
<i className="fas fa-circle-info" style={{ color: "var(--purple-main)" }}></i>
No direct revenue — builds reach toward Pose Coin pricing eligibility
</div>
</div>
</div>

{/* Premium / Paid Content */}

<div className="leg-tier-card leg-tier-paid">
<div className="leg-tier-glow paid-glow"></div>
<div className="leg-tier-head">
<div className="leg-tier-badge paid-badge">
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
</svg>
Premium
</div>
<div className="leg-tier-tag">Paid Content</div>
</div>
<div className="leg-tier-metrics">
<div className="leg-metric">
<div className="leg-metric-row">
<div className="leg-metric-icon">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
</svg>
</div>
<span className="leg-metric-label">Views (per paid video)</span>
<span className="leg-metric-val">10</span>
</div>
<div className="leg-bar-bg">
<div className="leg-bar-fill" data-w="0" style={{ background: "linear-gradient(90deg,#D97706,#FBBF24)" }}></div>
</div>
<div className="leg-bar-hint">0 / 10</div>
</div>
<div style={{ marginTop: "10px", fontSize: "11px", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "6px", paddingTop: "8px", borderTop: "1px solid var(--gray-100)" }}>
<i className="fas fa-circle-info" style={{ color: "#D97706" }}></i>
No follower minimum — paid videos start earning after 10 views, then release every 5 hours
</div>
</div>
</div>

</div>{/* /leg-tiers */}


{/* ── PAY-AS-YOU-WATCH ── */}

<div style={{ borderRadius: "16px", border: "1.5px solid var(--purple-pale)", overflow: "hidden", marginBottom: "16px" }}>

{/* Header */}

<div style={{ background: "linear-gradient(135deg,#4C1D95,#7C3AED)", padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
<div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
<i className="fas fa-coins" style={{ color: "white", fontSize: "16px" }}></i>
</div>
<div>
<div style={{ fontSize: "15px", fontWeight: "700", color: "white" }}>Pay-As-You-Watch</div>
<div style={{ fontSize: "11.5px", color: "rgba(255,255,255,.65)" }}>Model 2 · For filmmakers, educators & long-form creators</div>
</div>
</div>

<div style={{ padding: "18px", background: "var(--purple-ghost)" }}>

{/* How It Works */}

<div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".7px", color: "var(--gray-400)", marginBottom: "10px" }}>How It Works</div>
<div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "18px" }}>

{/* Step 1 */}

<div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "11px", background: "white", border: "1px solid var(--gray-100)" }}>
<div style={{ width: "30px", height: "30px", borderRadius: "8px", flexShrink: "0", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
<i className="fas fa-upload" style={{ color: "#7C3AED", fontSize: "12px" }}></i>
</div>
<div style={{ flex: "1" }}>
<div style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>
<span style={{ color: "var(--purple-mid)", marginRight: "4px" }}>1.</span>Upload a video
</div>
<div style={{ fontSize: "11px", color: "var(--gray-500)" }}>1 min 30 sec up to 6 hours in length</div>
</div>
</div>

{/* Step 2 */}

<div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "11px", background: "white", border: "1px solid var(--gray-100)" }}>
<div style={{ width: "30px", height: "30px", borderRadius: "8px", flexShrink: "0", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
<i className="fas fa-coins" style={{ color: "#D97706", fontSize: "12px" }}></i>
</div>
<div style={{ flex: "1" }}>
<div style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>
<span style={{ color: "var(--purple-mid)", marginRight: "4px" }}>2.</span>Set your Pose Coin price
</div>
<div style={{ fontSize: "11px", color: "var(--gray-500)" }}>Based on content length and value</div>
</div>
</div>

{/* Step 3 */}

<div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "11px", background: "white", border: "1px solid var(--gray-100)" }}>
<div style={{ width: "30px", height: "30px", borderRadius: "8px", flexShrink: "0", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
<i className="fas fa-wallet" style={{ color: "#2563EB", fontSize: "12px" }}></i>
</div>
<div style={{ flex: "1" }}>
<div style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>
<span style={{ color: "var(--purple-mid)", marginRight: "4px" }}>3.</span>Viewer pays to watch
</div>
<div style={{ fontSize: "11px", color: "var(--gray-500)" }}>Wallet balance deducted automatically on play</div>
</div>
</div>

{/* Step 4 */}

<div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "11px", background: "white", border: "1px solid var(--gray-100)" }}>
<div style={{ width: "30px", height: "30px", borderRadius: "8px", flexShrink: "0", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
<i className="fas fa-bolt" style={{ color: "#059669", fontSize: "12px" }}></i>
</div>
<div style={{ flex: "1" }}>
<div style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>
<span style={{ color: "var(--purple-mid)", marginRight: "4px" }}>4.</span>Instant earnings
</div>
<div style={{ fontSize: "11px", color: "var(--gray-500)" }}>75% lands in your wallet immediately</div>
</div>
</div>

</div>{/* /How It Works */}


{/* Coin Pricing Range */}

<div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".7px", color: "var(--gray-400)", marginBottom: "10px" }}>Coin Pricing Range</div>
<div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "18px" }}>

{/* Short Videos */}

<div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderRadius: "11px", background: "white", border: "1.5px solid var(--gray-100)" }}>
<div style={{ fontSize: "22px", flexShrink: "0" }}>🎬</div>
<div style={{ flex: "1" }}>
<div style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>Short Videos</div>
<div style={{ fontSize: "11px", color: "var(--gray-500)" }}>Up to ~15 mins</div>
</div>
<div style={{ textAlign: "right" }}>
<div style={{ fontSize: "13px", fontWeight: "700", color: "var(--purple-deep)" }}>4–100 PCK</div>
<div style={{ fontSize: "10.5px", color: "var(--gray-400)" }}>₦1–6 per PCK by region</div>
</div>
</div>

{/* Medium Videos */}

<div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderRadius: "11px", background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
<div style={{ fontSize: "22px", flexShrink: "0" }}>🎞</div>
<div style={{ flex: "1" }}>
<div style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>Medium Videos</div>
<div style={{ fontSize: "11px", color: "var(--gray-500)" }}>15–60 mins</div>
</div>
<div style={{ textAlign: "right" }}>
<div style={{ fontSize: "13px", fontWeight: "700", color: "#92400E" }}>101–500 PCK</div>
<div style={{ fontSize: "10.5px", color: "var(--gray-400)" }}>Priced per minute of runtime</div>
</div>
</div>

{/* Long Videos / Movies */}

<div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", borderRadius: "11px", background: "#F5F3FF", border: "1.5px solid #DDD6FE" }}>
<div style={{ fontSize: "22px", flexShrink: "0" }}>🎥</div>
<div style={{ flex: "1" }}>
<div style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>Long Videos / Movies</div>
<div style={{ fontSize: "11px", color: "var(--gray-500)" }}>1 hour and above</div>
</div>
<div style={{ textAlign: "right" }}>
<div style={{ fontSize: "13px", fontWeight: "700", color: "#6B21A8" }}>501–2,000 PCK</div>
<div style={{ fontSize: "10.5px", color: "var(--gray-400)" }}>₦1–6 per PCK by region</div>
</div>
</div>

</div>{/* /Pricing Range */}


{/* Revenue Split */}

<div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".7px", color: "var(--gray-400)", marginBottom: "10px" }}>Revenue Split</div>
<div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "12px", padding: "14px", marginBottom: "18px" }}>
<div style={{ marginBottom: "10px" }}>
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
<span style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--text-main)" }}>
<i className="fas fa-user" style={{ color: "var(--purple-main)", marginRight: "5px" }}></i>You (Creator)
</span>
<span style={{ fontSize: "14px", fontWeight: "800", color: "var(--purple-deep)" }}>75%</span>
</div>
<div style={{ height: "9px", background: "var(--gray-100)", borderRadius: "99px", overflow: "hidden" }}>
<div style={{ height: "100%", width: "75%", background: "linear-gradient(90deg,var(--purple-deep),var(--purple-mid))", borderRadius: "99px" }}></div>
</div>
</div>
<div>
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
<span style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--gray-500)" }}>Pose Platform</span>
<span style={{ fontSize: "14px", fontWeight: "800", color: "var(--gray-400)" }}>25%</span>
</div>
<div style={{ height: "9px", background: "var(--gray-100)", borderRadius: "99px", overflow: "hidden" }}>
<div style={{ height: "100%", width: "25%", background: "var(--gray-300)", borderRadius: "99px" }}></div>
</div>
</div>
</div>

{/* Benefits */}

<div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".7px", color: "var(--gray-400)", marginBottom: "10px" }}>Benefits & Remarks</div>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>

<div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 11px", borderRadius: "10px", background: "white", border: "1px solid var(--gray-100)" }}>
<div style={{ width: "28px", height: "28px", borderRadius: "8px", flexShrink: "0", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
<i className="fas fa-ban" style={{ color: "#059669", fontSize: "11px" }}></i>
</div>
<div style={{ fontSize: "11.5px", fontWeight: "600", color: "var(--text-main)", lineHeight: "1.3" }}>No subscriptions</div>
</div>

<div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 11px", borderRadius: "10px", background: "white", border: "1px solid var(--gray-100)" }}>
<div style={{ width: "28px", height: "28px", borderRadius: "8px", flexShrink: "0", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
<i className="fas fa-sliders" style={{ color: "#2563EB", fontSize: "11px" }}></i>
</div>
<div style={{ fontSize: "11.5px", fontWeight: "600", color: "var(--text-main)", lineHeight: "1.3" }}>Flexible coin pricing</div>
</div>

<div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 11px", borderRadius: "10px", background: "white", border: "1px solid var(--gray-100)" }}>
<div style={{ width: "28px", height: "28px", borderRadius: "8px", flexShrink: "0", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
<i className="fas fa-chart-line" style={{ color: "#D97706", fontSize: "11px" }}></i>
</div>
<div style={{ fontSize: "11.5px", fontWeight: "600", color: "var(--text-main)", lineHeight: "1.3" }}>Strong creator earnings</div>
</div>

<div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", borderRadius: "10px", background: "#FEF3C7", border: "1px solid #FDE68A", marginTop: "4px" }}>
<div style={{ width: "28px", height: "28px", borderRadius: "8px", flexShrink: "0", background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
<i className="fas fa-comment-dots" style={{ color: "#D97706", fontSize: "11px" }}></i>
</div>
<div style={{ flex: "1", fontSize: "11.5px", color: "#92400E", lineHeight: "1.45" }}>
<strong>Pay-As-You-Watch Remark:</strong> Viewers are far more likely to pay for videos that are relatively cheap. Pricing should also align with the overall quality and value of your video.
</div>
</div>

</div>{/* /Benefits grid */}

</div>
</div>{/* /Pay-As-You-Watch */}


{/* ── PRICING PRO TIPS ── */}

<div style={{ background: "linear-gradient(135deg,#1E0A3C,#4C1D95)", borderRadius: "13px", padding: "16px" }}>
<div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".7px", color: "rgba(255,255,255,.5)", marginBottom: "10px" }}>
<i className="fas fa-lightbulb" style={{ marginRight: "5px", color: "#FDE68A" }}></i>Pro Tips · Maximise Pose Coin Earnings
</div>
<div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
<div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
<i className="fas fa-circle-check" style={{ color: "#A78BFA", fontSize: "11px", marginTop: "2px", flexShrink: "0" }}></i>
<span style={{ fontSize: "12px", color: "rgba(255,255,255,.72)", lineHeight: "1.5" }}>Lower-priced videos convert more often — cheap and consistent beats rare and expensive</span>
</div>
<div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
<i className="fas fa-circle-check" style={{ color: "#A78BFA", fontSize: "11px", marginTop: "2px", flexShrink: "0" }}></i>
<span style={{ fontSize: "12px", color: "rgba(255,255,255,.72)", lineHeight: "1.5" }}>Use your monthly pricing slots on your strongest content — they're limited, so spend them wisely</span>
</div>
<div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
<i className="fas fa-circle-check" style={{ color: "#A78BFA", fontSize: "11px", marginTop: "2px", flexShrink: "0" }}></i>
<span style={{ fontSize: "12px", color: "rgba(255,255,255,.72)", lineHeight: "1.5" }}>A strong free trailer converts viewers into paying customers for the full video</span>
</div>
<div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
<i className="fas fa-circle-check" style={{ color: "#A78BFA", fontSize: "11px", marginTop: "2px", flexShrink: "0" }}></i>
<span style={{ fontSize: "12px", color: "rgba(255,255,255,.72)", lineHeight: "1.5" }}>Every creator gets 5 custom-price slots for movies and another 5 for seasons each month — once a season is priced, every episode inside it can be priced too</span>
</div>
</div>
</div>

</div>{/* /Section 01 */}


{/* ════════════════════════════════════════════════
SECTION 02 · MANDATORY AGE RATING SYSTEM
═════════════════════════════════════════════════ */}

<div className="leg-section leg-reveal">
<div className="leg-sec-header">
<div className="leg-sec-icon leg-icon-blue">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
</svg>
</div>
<div>
<div className="leg-sec-num">02</div>
<div className="leg-sec-title">Mandatory Age Rating System</div>
</div>
</div>
<p className="leg-sec-desc">Every video must be manually rated during upload. Inaccurate ratings are a direct violation of Pose Channel terms and may result in loss of Pose Coin pricing privileges.</p>

<div className="leg-ratings">

{/* All Ages */}

<div className="leg-rating-card" style={{ "--delay": ".05s" } as CSSProperties}>
<div className="leg-rating-icon" style={{ background: "#D1FAE5", color: "#059669", borderColor: "#A7F3D0" }}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="12" cy="12" r="10" /><path d="M8 12l2.5 2.5L16 9" />
</svg>
</div>
<div className="leg-rating-badge" style={{ background: "#D1FAE5", color: "#065F46" }}>All Ages</div>
<div className="leg-rating-desc">General audiences. No profanity, violence, or suggestive themes of any kind.</div>
<div className="leg-rating-tags">
<span className="rtag rtag-green">✔ Approved</span>
<span className="rtag rtag-green">✔ Monetizable</span>
</div>
</div>

{/* Teen */}

<div className="leg-rating-card" style={{ "--delay": ".1s" } as CSSProperties}>
<div className="leg-rating-icon" style={{ background: "#DBEAFE", color: "#2563EB", borderColor: "#BFDBFE" }}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
<path d="M12 8v4" />
<circle cx="12" cy="16" r="1" fill="currentColor" />
</svg>
</div>
<div className="leg-rating-badge" style={{ background: "#DBEAFE", color: "#1E40AF" }}>Teen</div>
<div className="leg-rating-desc">Mild language or fantasy violence permitted. Not suitable for very young audiences.</div>
<div className="leg-rating-tags">
<span className="rtag rtag-blue">✔ Approved</span>
<span className="rtag rtag-blue">✔ Monetizable</span>
</div>
</div>

{/* Mature */}

<div className="leg-rating-card" style={{ "--delay": ".15s" } as CSSProperties}>
<div className="leg-rating-icon" style={{ background: "#FEF3C7", color: "#D97706", borderColor: "#FDE68A" }}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
<line x1="12" y1="9" x2="12" y2="13" />
<line x1="12" y1="17" x2="12.01" y2="17" />
</svg>
</div>
<div className="leg-rating-badge" style={{ background: "#FEF3C7", color: "#92400E" }}>Mature</div>
<div className="leg-rating-desc">Adults only. Must be strictly gated — younger users must not be able to access this content.</div>
<div className="leg-rating-tags">
<span className="rtag rtag-orange">⚠ Gated</span>
<span className="rtag rtag-orange">Pricing Restricted</span>
</div>
</div>

{/* Inaccurate */}

<div className="leg-rating-card" style={{ "--delay": ".2s" } as CSSProperties}>
<div className="leg-rating-icon" style={{ background: "#FEE2E2", color: "#DC2626", borderColor: "#FECACA" }}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="12" cy="12" r="10" />
<line x1="15" y1="9" x2="9" y2="15" />
<line x1="9" y1="9" x2="15" y2="15" />
</svg>
</div>
<div className="leg-rating-badge" style={{ background: "#FEE2E2", color: "#991B1B" }}>Inaccurate</div>
<div className="leg-rating-desc">Providing a false rating violates Pose Channel terms and will result in immediate loss of Pose Coin pricing privileges.</div>
<div className="leg-rating-tags">
<span className="rtag rtag-red">✖ Violation</span>
<span className="rtag rtag-red">Pricing Revoked</span>
</div>
</div>

</div>
</div>{/* /Section 02 */}


{/* ════════════════════════════════════════════════
SECTION 03 · CONTENT INTEGRITY & AD SAFETY
═════════════════════════════════════════════════ */}

<div className="leg-section leg-reveal">
<div className="leg-sec-header">
<div className="leg-sec-icon leg-icon-purple">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.084-.134-2.135-.382-3.016z" />
</svg>
</div>
<div>
<div className="leg-sec-num">03</div>
<div className="leg-sec-title">Content Integrity & Platform Safety</div>
</div>
</div>
<p className="leg-sec-desc">Violation of any rule below results in immediate removal of Pose Coin pricing from that video — or the entire channel.</p>

<div className="leg-rules">

{/* Inappropriate Language */}

<div className="leg-rule-item" style={{ "--delay": ".04s" } as CSSProperties}>
<div className="leg-rule-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
</svg>
</div>
<div className="leg-rule-body">
<div className="leg-rule-title">Inappropriate Language</div>
<div className="leg-rule-desc">Frequent profanity — especially in the first 30 seconds — disqualifies a video from monetization.</div>
</div>
<div className="leg-rule-status danger">✖ Policy Risk</div>
</div>

{/* Violence & Sensitive Events */}

<div className="leg-rule-item" style={{ "--delay": ".08s" } as CSSProperties}>
<div className="leg-rule-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
</svg>
</div>
<div className="leg-rule-body">
<div className="leg-rule-title">Violence & Sensitive Events</div>
<div className="leg-rule-desc">Graphic violence, self-harm encouragement, or exploitation of tragedies is strictly prohibited.</div>
</div>
<div className="leg-rule-status danger">✖ Banned</div>
</div>

{/* Harmful or Dangerous Acts */}

<div className="leg-rule-item" style={{ "--delay": ".12s" } as CSSProperties}>
<div className="leg-rule-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
</svg>
</div>
<div className="leg-rule-body">
<div className="leg-rule-title">Harmful or Dangerous Acts</div>
<div className="leg-rule-desc">Videos that show or encourage acts leading to serious physical injury are not eligible for Pose Coin pricing.</div>
</div>
<div className="leg-rule-status danger">✖ Banned</div>
</div>

{/* Shocking Content */}

<div className="leg-rule-item" style={{ "--delay": ".16s" } as CSSProperties}>
<div className="leg-rule-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
</svg>
</div>
<div className="leg-rule-body">
<div className="leg-rule-title">Shocking Content</div>
<div className="leg-rule-desc">Content designed to disgust or petrify (e.g. graphic medical procedures without educational context) is banned.</div>
</div>
<div className="leg-rule-status warn">⚠ Review</div>
</div>

{/* Intellectual Property */}

<div className="leg-rule-item" style={{ "--delay": ".20s" } as CSSProperties}>
<div className="leg-rule-icon" style={{ background: "#EDE9FE", color: "#7C3AED" }}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
</svg>
</div>
<div className="leg-rule-body">
<div className="leg-rule-title">Intellectual Property</div>
<div className="leg-rule-desc">Pose Coin pricing is only allowed where the creator owns 100% of visual and audio rights. Unlicensed music or clips restrict monetization.</div>
</div>
<div className="leg-rule-status safe">✔ Required</div>
</div>

</div>
</div>{/* /Section 03 */}


{/* ════════════════════════════════════════════════
SECTION 04 · RULES OF GOOD CONDUCT
═════════════════════════════════════════════════ */}

<div className="leg-section leg-reveal">
<div className="leg-sec-header">
<div className="leg-sec-icon" style={{ background: "#FCE7F3", color: "#DB2777", borderColor: "#FBCFE8" }}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
<circle cx="9" cy="7" r="4" />
<path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
</svg>
</div>
<div>
<div className="leg-sec-num">04</div>
<div className="leg-sec-title">Rules of Good Conduct</div>
</div>
</div>
<p className="leg-sec-desc">These rules govern the entire Pose community and ensure a professional, respectful environment for all creators and viewers.</p>

<div className="leg-conduct-grid">

{/* User Safety */}

<div className="leg-conduct-card" style={{ "--delay": ".05s" } as CSSProperties}>
<div className="leg-conduct-icon" style={{ background: "linear-gradient(135deg,#EDE9FE,#DDD6FE)", color: "#6D28D9" }}>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
</svg>
</div>
<div className="leg-conduct-title">User Safety</div>
<div className="leg-conduct-body">Content that promotes bullying, harassment, or doxing of other users will result in a <strong>permanent ban</strong>.</div>
<div className="leg-conduct-footer danger-footer">
<i className="fas fa-bolt"></i> Permanent Ban
</div>
</div>

{/* Zero Hate Tolerance */}

<div className="leg-conduct-card" style={{ "--delay": ".1s" } as CSSProperties}>
<div className="leg-conduct-icon" style={{ background: "linear-gradient(135deg,#FEE2E2,#FECACA)", color: "#DC2626" }}>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="12" cy="12" r="10" />
<line x1="15" y1="9" x2="9" y2="15" />
<line x1="9" y1="9" x2="15" y2="15" />
</svg>
</div>
<div className="leg-conduct-title">Zero Hate Tolerance</div>
<div className="leg-conduct-body">No content promoting hatred or discrimination based on race, religion, gender, or orientation.</div>
<div className="leg-conduct-footer danger-footer">
<i className="fas fa-ban"></i> Zero Tolerance
</div>
</div>

{/* No Deceptive Behaviour */}

<div className="leg-conduct-card" style={{ "--delay": ".15s" } as CSSProperties}>
<div className="leg-conduct-icon" style={{ background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", color: "#D97706" }}>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<rect x="3" y="3" width="18" height="18" rx="2" />
<path d="M9 9h6M9 12h6M9 15h4" />
</svg>
</div>
<div className="leg-conduct-title">No Deceptive Behaviour</div>
<div className="leg-conduct-body">Clickbait thumbnails are prohibited. Titles, metadata, and tags must accurately represent the video content.</div>
<div className="leg-conduct-footer warn-footer">
<i className="fas fa-triangle-exclamation"></i> Policy Violation
</div>
</div>

{/* Interactive Safety */}

<div className="leg-conduct-card" style={{ "--delay": ".2s" } as CSSProperties}>
<div className="leg-conduct-icon" style={{ background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", color: "#059669" }}>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
</svg>
</div>
<div className="leg-conduct-title">Interactive Safety</div>
<div className="leg-conduct-body">Users can report any video. Pose Channel moderators review <strong>all reports within 24 hours</strong> of submission.</div>
<div className="leg-conduct-footer safe-footer">
<i className="fas fa-circle-check"></i> 24hr Review
</div>
</div>

</div>
</div>{/* /Section 04 */}


{/* ════════════════════════════════════════════════
SECTION 05 · CONTENT DECEPTION & SEVERE PENALTIES
═════════════════════════════════════════════════ */}

<div className="leg-section leg-reveal">
<div className="leg-sec-header">
<div className="leg-sec-icon" style={{ background: "#FEE2E2", color: "#DC2626", borderColor: "#FCA5A5" }}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
</svg>
</div>
<div>
<div className="leg-sec-num">05</div>
<div className="leg-sec-title">Content Deception & Revenue Forfeiture</div>
</div>
</div>
<p className="leg-sec-desc">Misleading viewers into paying coins for content they did not expect violates Pose's core content integrity policy.</p>

<div style={{ background: "#FFF5F5", border: "1px solid #FEB2B2", borderRadius: "12px", padding: "16px", marginBottom: "18px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
<div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
<i className="fas fa-triangle-exclamation" style={{ color: "#DC2626", fontSize: "14px" }}></i>
</div>
<div style={{ flex: "1" }}>
<div style={{ fontSize: "13.5px", fontWeight: "700", color: "#9B1C1C", marginBottom: "4px" }}>Deceptive Metadata & Clickbait Policy</div>
<div style={{ fontSize: "12.5px", color: "#7F1D1D", lineHeight: "1.5", marginBottom: "10px" }}>
Posting <strong>fake/misleading thumbnails</strong> or utilizing wrong/deceptive titles that trick people into wasting their hard-earned Pose Coins is strictly forbidden. Any attempt to monetize through deception will result in severe penalties:
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
<span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "white", background: "#DC2626", padding: "4px 9px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
<i className="fas fa-user-slash"></i> Permanent Ban
</span>
<span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "white", background: "#9B1C1C", padding: "4px 9px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
<i className="fas fa-ban"></i> Revenue Forfeited
</span>
</div>
</div>
</div>
</div>{/* /Section 05 */}


</div>
</div>

<div id="page-upload" className="page">

<div className="studio-topbar">
<button className="back-btn" onClick={(event) => runInline(event, "closeUpload()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M19 12H5M12 5l-7 7 7 7" />
</svg>
Back
</button>
<span className="studio-title">Upload Content</span>
<div id="uploadChannelBadge" style={{ display: "flex", alignItems: "center", gap: "7px", background: "var(--purple-ghost)", border: "1px solid var(--purple-pale)", borderRadius: "20px", padding: "5px 12px 5px 7px", marginLeft: "auto" }}>
<div id="uploadChannelAvatar" style={{ width: "24px", height: "24px", borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg,var(--purple-deep),var(--purple-mid))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "white" }}>P</div>
<span id="uploadChannelName" style={{ fontSize: "12px", fontWeight: "600", color: "var(--purple-deep)" }}>My Channel</span>
</div>
</div>

{/* ── INFO BANNER ── */}

<div className="upload-info-banner" id="uploadInfoBanner">
<div className="uib-icon"><i className="fas fa-rocket"></i></div>
<div className="uib-text">
<div className="uib-title">Fill every detail — it pays you back 💰</div>
<div className="uib-sub">
Accurate <b>category</b>, <b>subcategory</b>, <b>tags</b> and <b>description</b> help us push your video to the right audience,
boost watch-time, unlock <b>monetization</b> faster and grow your <b>earnings</b>.
</div>
</div>
<button className="uib-close" type="button" aria-label="Dismiss" onClick={(event) => runInline(event, "document.getElementById('uploadInfoBanner').style.display='none'")}>
<i className="fas fa-times"></i>
</button>
</div>

{/* Upload Tabs */}

<div className="upload-tabs">
<div className="upload-tab-btn active" onClick={(event) => runInline(event, "switchUploadTab(this,'single')")}>
<i className="fas fa-film"></i> Single Video
</div>
<div className="upload-tab-btn" onClick={(event) => runInline(event, "switchUploadTab(this,'season')")}>
<i className="fas fa-layer-group"></i> Seasons & Episodes
</div>
</div>

{/* ── SUCCESS SCREEN (shared) ── */}

<div className="usuccess-screen" id="uSuccessScreen">
<div className="usuccess-icon">✓</div>
<div className="usuccess-title" id="uSuccessTitle">Posted Successfully!</div>
<div className="usuccess-sub" id="uSuccessSub">Your content is live and ready for viewers.</div>
<div className="usuccess-actions">
<button className="usuccess-again" onClick={(event) => runInline(event, "resetUploadPage()")}>
<i className="fas fa-plus" style={{ marginRight: "6px" }}></i>Upload Another
</button>
<button className="usuccess-studio" onClick={(event) => runInline(event, "closeUpload()")}>
<i className="fas fa-chart-bar" style={{ marginRight: "6px" }}></i>Go to Studio
</button>
</div>
</div>

{/* ════════════════════════════
TAB 1 — SINGLE VIDEO
═════════════════════════════ */}

<div className="upload-panel active" id="panel-single">
<div className="upload-form-wrap">

{/* Video File */}

<div className="upload-card">
<div className="upload-card-title">
<i className="fas fa-video"></i> Video File
<span className="ureq-dot" style={{ marginLeft: "2px" }}></span>
</div>
<div className="udrop" id="sVideoDrop" onDragOver={(event) => runInline(event, "event.preventDefault();this.classList.add('dragover')")} onDragLeave={(event) => runInline(event, "this.classList.remove('dragover')")} onDrop={(event) => runInline(event, "handleDrop(event,'sVideoFile','sVideoPreview','sVideoProgress')")}>
<input type="file" id="sVideoFile" accept="video/*" onChange={(event) => runInline(event, "handleFileSelect(this,'sVideoPreview','sVideoProgress')")} />
<div className="udrop-icon"><i className="fas fa-cloud-arrow-up"></i></div>
<div className="udrop-label">Tap or drag your video here</div>
<div className="udrop-sub">MP4 · MOV · AVI  ·  Up to 6 hours</div>
</div>
<div className="ufile-preview" id="sVideoPreview" style={{ display: "none" }}>
<i className="fas fa-file-video"></i>
<div>
<div className="ufile-name" id="sVideoName">—</div>
<div className="ufile-size" id="sVideoSize">—</div>
</div>
<button className="ufile-remove" onClick={(event) => runInline(event, "removeFile('sVideoFile','sVideoPreview','sVideoProgress')")}>
<i className="fas fa-times"></i>
</button>
</div>
<div className="uprog-wrap" id="sVideoProgress">
<div className="uprog-label">
<span id="sVideoProgLabel">Uploading…</span>
<span id="sVideoProgPct">0%</span>
</div>
<div className="uprog-bg"><div className="uprog-fill" id="sVideoProgFill"></div></div>
</div>
<div className="uhelp">
<i className="fas fa-circle-info"></i>
Files up to 4GB are supported. Do not close this page while uploading.
</div>
<div style={{ marginTop: "10px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
<i className="fas fa-triangle-exclamation" style={{ color: "#D97706", fontSize: "13px", marginTop: "1px", flexShrink: "0" }}></i>
<div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.5" }}>
<strong>No watermarks.</strong> Don't upload content carrying another platform's logo or watermark (TikTok, Instagram, YouTube, Snapchat, CapCut, etc.). Watermarked uploads may be removed and can affect your channel's standing.
</div>
</div>
</div>

{/* Trailer (optional) */}

<div className="upload-card">
<div className="upload-card-title">
<i className="fas fa-clapperboard"></i> Trailer
<span style={{ fontSize: "11px", fontWeight: "500", color: "var(--gray-400)", marginLeft: "4px" }}>(optional)</span>
</div>
<div className="udrop" id="sTrailerDrop" onDragOver={(event) => runInline(event, "event.preventDefault();this.classList.add('dragover')")} onDragLeave={(event) => runInline(event, "this.classList.remove('dragover')")} onDrop={(event) => runInline(event, "handleDrop(event,'sTrailerFile','sTrailerPreview',null)")}>
<input type="file" id="sTrailerFile" accept="video/*" onChange={(event) => runInline(event, "handleFileSelect(this,'sTrailerPreview',null)")} />
<div className="udrop-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
<i className="fas fa-play"></i>
</div>
<div className="udrop-label">Upload a short trailer</div>
<div className="udrop-sub">Viewers can watch this for free — even if video is paid or scheduled</div>
</div>
<div className="ufile-preview" id="sTrailerPreview" style={{ display: "none" }}>
<i className="fas fa-file-video" style={{ color: "#D97706" }}></i>
<div>
<div className="ufile-name" id="sTrailerName">—</div>
<div className="ufile-size" id="sTrailerSize">—</div>
</div>
<button className="ufile-remove" onClick={(event) => runInline(event, "removeFile('sTrailerFile','sTrailerPreview',null)")}>
<i className="fas fa-times"></i>
</button>
</div>
<div className="uhelp">
<i className="fas fa-circle-info"></i>
A great trailer under 2 minutes can increase views by 3×. It goes live immediately regardless of your release schedule.
</div>
</div>

{/* Details */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-pen-nib"></i> Video Details</div>

{/* Name */}

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Video Title</div>
<input className="ufield-input" type="text" id="sTitle" placeholder="Give your video a clear, searchable title\u2026" />
<div className="uhelp"><i className="fas fa-circle-info"></i> Keep it descriptive and honest — clickbait titles violate Pose policy.</div>
</div>

{/* Category */}

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Category</div>
<select className="ufield-input" id="sCategory" onChange={(event) => runInline(event, "populateSubcategory('sCategory','sSubcategory');if(document.getElementById('sPriceMode')?.value==='paid')refreshAutoPriceUI('s');")}>
<option value="">— Select a category —</option>
<option value="comedy">😂 Comedy</option>
<option value="dance">💃 Dance</option>
<option value="music">🎵 Music</option>
<option value="movies">🎥 Movies</option>
<option value="tvshows">📺 TV Shows</option>
<option value="anime">🎌 Anime</option>
<option value="nollywood">🎬 Nollywood / Drama</option>
<option value="documentary">🎙 Documentary</option>
<option value="education">📚 Education / Tutorial</option>
<option value="lifestyle">✨ Lifestyle / Vlog</option>
<option value="fashion">👗 Fashion / Beauty</option>
<option value="food">🍲 Food / Cooking</option>
<option value="sports">⚽ Sports / Fitness</option>
<option value="gaming">🎮 Gaming</option>
<option value="tech">💻 Tech</option>
<option value="news">📰 News / Politics</option>
<option value="travel">✈ï¸ Travel / Adventure</option>
<option value="kids">🧒 Kids / Family</option>
<option value="health">🧘 Health</option>
<option value="motivation">🔥 Motivation / Self-Help</option>
</select>
<div className="uhelp"><i className="fas fa-circle-info"></i> Choose the category that best describes your video. This helps viewers discover your content.</div>
</div>

{/* Subcategory (dynamic — depends on main category) */}

<div className="ufield" id="sSubcategoryWrap" style={{ display: "none" }}>
<div className="ufield-label">Subcategory</div>
<select className="ufield-input" id="sSubcategory">
<option value="">— Select a subcategory —</option>
</select>
<div className="uhelp"><i className="fas fa-circle-info"></i> Pick a subcategory so viewers can find your video under the right tab on the watch page.</div>
</div>

{/* Description */}

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Description <span style={{ fontWeight: "400", color: "var(--gray-400)", textTransform: "none", letterSpacing: "0" }}>(min. 10 words)</span></div>
<textarea className="ufield-input" id="sDesc" placeholder="Tell viewers what this video is about\u2026 (at least 10 words required)"></textarea>
<div className="uhelp"><i className="fas fa-circle-info"></i> A good description helps viewers find your content through search. Minimum 10 words required.</div>
</div>

{/* Thumbnail */}

<div className="ufield">
<div className="ufield-label">Thumbnail <span style={{ fontWeight: "400", color: "var(--gray-400)", textTransform: "none", letterSpacing: "0" }}>(optional)</span></div>
<div className="uthumb-preview" id="sThumbPreview" onClick={(event) => runInline(event, "document.getElementById('sThumbFile').click()")}>
<div className="uthumb-placeholder">🎬</div>
<div className="uthumb-change"><i className="fas fa-camera" style={{ marginRight: "4px" }}></i>Choose Image</div>
</div>
<input type="file" id="sThumbFile" accept="image/*" style={{ display: "none" }} onChange={(event) => runInline(event, "handleThumb(this,'sThumbPreview')")} />
<div className="uhelp"><i className="fas fa-circle-info"></i> 16:9 ratio works best (e.g. 1280×720). If skipped, a placeholder is shown.</div>
</div>

{/* Age Rating */}

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Age Rating</div>
<div className="urating-pills" id="sRatingPills">
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('single','3+',this)")}>3+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('single','7+',this)")}>7+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('single','10+',this)")}>10+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('single','13+',this)")}>13+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('single','16+',this)")}>16+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('single','18+',this)")}>18+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('single','25+',this)")}>25+</div>
</div>
<input type="hidden" id="sRating" value="" />
<div className="uhelp"><i className="fas fa-circle-info"></i>
<span><strong>Required.</strong> Inaccurate ratings result in immediate loss of Pose Coin pricing privileges. <strong>3+/7+</strong> = young children, no scary or risky content. <strong>10+/13+</strong> = mild language or fantasy violence. <strong>16+/18+</strong> = mature themes, must be strictly gated. <strong>25+</strong> = adults-only / explicit.</span>
</div>
</div>
</div>

{/* Production & Cast */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-clapperboard"></i> Production & Cast <span style={{ fontWeight: "400", color: "var(--gray-400)", textTransform: "none", letterSpacing: "0", fontSize: "12px" }}>(optional)</span></div>
<div className="uhelp" style={{ marginBottom: "14px" }}>
<i className="fas fa-circle-info"></i>
Adding cast and production credits boosts discoverability — viewers can search by actor, director, or studio.
</div>

<div className="ufield">
<div className="ufield-label">Director(s)</div>
<input className="ufield-input" type="text" id="sDirector" placeholder="e.g. Kunle Afolayan, Genevieve Nnaji" />
<div className="uhelp"><i className="fas fa-circle-info"></i> Separate multiple directors with commas.</div>
</div>

<div className="ufield">
<div className="ufield-label">Writer(s) / Screenplay</div>
<input className="ufield-input" type="text" id="sWriter" placeholder="e.g. Biyi Bandele, Chimamanda Adichie" />
</div>

<div className="ufield">
<div className="ufield-label">Producer(s)</div>
<input className="ufield-input" type="text" id="sProducer" placeholder="e.g. Mo Abudu, EbonyLife Studios" />
</div>

<div className="ufield">
<div className="ufield-label">Cast / Actors & Actresses</div>
<textarea className="ufield-input" id="sCast" placeholder="e.g. Genevieve Nnaji, Ramsey Nouah, Rita Dominic, Pete Edochie\u2026"></textarea>
<div className="uhelp"><i className="fas fa-circle-info"></i> Comma-separated list of leads & supporting cast.</div>
</div>

<div className="ufield">
<div className="ufield-label">Studio / Production Company</div>
<input className="ufield-input" type="text" id="sStudio" placeholder="e.g. EbonyLife Studios, Inkblot Productions" />
</div>

<div className="ufield">
<div className="ufield-label">Year of Release</div>
<input className="ufield-input" type="number" id="sYear" min="1900" max="2100" placeholder="e.g. 2024" />
</div>

<div className="ufield">
<div className="ufield-label">Language</div>
<input className="ufield-input" type="text" id="sLanguage" placeholder="e.g. English, Yoruba, Igbo, Pidgin" />
</div>

<div className="ufield">
<div className="ufield-label">Country / Region</div>
<input className="ufield-input" type="text" id="sCountry" placeholder="e.g. Nigeria, Ghana, South Africa" />
</div>

<div className="ufield">
<div className="ufield-label">Genre Tags</div>
<input className="ufield-input" type="text" id="sGenres" placeholder="e.g. Drama, Thriller, Family" />
<div className="uhelp"><i className="fas fa-circle-info"></i> Comma-separated. These appear as filter tags on the watch page.</div>
</div>

<div className="ufield">
<div className="ufield-label">Subtitles / Captions Available</div>
<input className="ufield-input" type="text" id="sSubtitles" placeholder="e.g. English, French, Hausa" />
</div>
</div>

{/* Schedule */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-calendar-days"></i> Release Schedule</div>
<div className="usched-toggle" onClick={(event) => runInline(event, "toggleSched('sSchedToggle','sSchedDate',true)")}>
<div>
<div className="usched-toggle-label">Schedule for Later</div>
<div className="usched-toggle-sub">Video unlocks on the date you choose</div>
</div>
<label className="usched-sw" onClick={(event) => runInline(event, "event.stopPropagation()")}>
<input type="checkbox" id="sSchedToggle" onChange={(event) => runInline(event, "toggleSched('sSchedToggle','sSchedDate')")} />
<span className="usched-sw-slider"></span>
</label>
</div>
<div className="usched-date-wrap" id="sSchedDate">
<div className="ufield-label" style={{ marginBottom: "6px" }}>Release Date & Time</div>
<input className="ufield-input" type="datetime-local" id="sSchedDT" />
<div className="uhelp" style={{ marginTop: "6px" }}>
<i className="fas fa-circle-info"></i>
Your trailer (if uploaded) will be watchable immediately. The main video unlocks at this date/time.
</div>
</div>
<div className="uhelp" style={{ marginTop: "8px" }}>
<i className="fas fa-circle-info"></i>
Scheduling a release and sharing your trailer first is a great way to build hype before launch.
</div>
</div>
{/* Pricing */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-coins"></i> Pricing</div>
<div className="uprice-toggle">
<div className="uprice-opt active" id="sFreeBtn" onClick={(event) => runInline(event, "setPrice('single','free')")}>
<i className="fas fa-unlock"></i> Free
</div>
<div className="uprice-opt" id="sPaidBtn" onClick={(event) => runInline(event, "setPrice('single','paid')")}>
<i className="fas fa-coins"></i> Paid (Pose Coin)
</div>
<div className="uprice-opt" id="sWtcBtn" onClick={(event) => runInline(event, "setPrice('single','wtc')")} title="Let WTC set the price automatically from category, length and your channel's views">
<i className="fas fa-wand-magic-sparkles"></i> WTC
</div>
</div>

{/* Free Info */}

<div id="sFreeInfo" className="ufree-badge">
<i className="fas fa-unlock"></i>
<div>
<div className="ufree-badge-text">Free to Watch</div>
<div className="ufree-badge-sub">No direct earnings — great for building reach and audience.</div>
</div>
</div>

{/* Paid Coin Slider */}

<div id="sCoinWrap" className="ucoin-wrap" style={{ display: "none" }}>
<div className="ucoin-display" id="sCoinVal"><input type="number" className="ucoin-num-input" id="sCoinInput" min="4" max="2000" value="8" onInput={(event) => runInline(event, "updateCoinFromInput('s')")} /> PCK</div>
<div className="ucoin-naira" id="sCoinNaira">Price in Pose Coin Kobo (1 PCK = ₦1)</div>
<div className="ucoin-cat short" id="sCoinCat">Short Video</div>
<input type="range" className="ucoin-slider" id="sCoinSlider" min="4" max="2000" value="8" onInput={(event) => runInline(event, "updateCoinSlider('s')")} />
<div className="ucoin-range-labels">
<span id="sCoinMinLbl">4 PCK minimum</span><span id="sCoinMaxLbl">2,000 PCK</span>
</div>
<div id="sSlotsNotice" className="uhelp" style={{ marginTop: "10px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "8px 10px" }}>
<i className="fas fa-circle-info" style={{ color: "#D97706" }}></i>
You've used <strong id="sSlotsRemaining">0/5</strong> custom-price slots on movies this month.
</div>
<div className="uhelp" style={{ marginTop: "8px" }}>
<i className="fas fa-circle-info"></i>
1 PCK = ₦1 in Nigeria · ₦3 in other African countries · ₦6 internationally. Also converted to your local currency below.
</div>
</div>

{/* Auto-Priced (shown when WTC is picked, or once monthly movie slots are used up) */}

<div id="sAutoPriceLocked" className="ucoin-wrap" style={{ display: "none" }}>
<div className="ucoin-display" id="sAutoPriceVal">— PCK</div>
<div className="uhelp" style={{ marginTop: "6px", background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: "8px", padding: "8px 10px" }} id="sAutoPriceReason">
<i className="fas fa-circle-info" style={{ color: "#6B21A8" }}></i>
This video's price is auto-calculated from its category, length and your channel's current total views.
</div>
<div className="uhelp" style={{ marginTop: "8px" }} id="sAutoPriceBreakdown"></div>
</div>
<input type="hidden" id="sPriceMode" value="free" />
<input type="hidden" id="sCoinPrice" value="0" />
<input type="hidden" id="sPricingChoice" value="manual" />
</div>

{/* Post Button */}

<button className="usubmit-btn" id="sPostBtn" onClick={(event) => runInline(event, "postSingleVideo()")}>
<i className="fas fa-paper-plane"></i> Post Video
</button>

</div>
</div>{/* /panel-single */}


{/* ════════════════════════════
TAB 2 — SEASONS & EPISODES
═════════════════════════════ */}

<div className="upload-panel" id="panel-season">
<div className="upload-form-wrap">

{/* Mode Toggle */}

<div className="smode-toggle">
<div className="smode-btn active" id="smodeNewBtn" onClick={(event) => runInline(event, "setSeasonMode('new')")}>
<i className="fas fa-plus-circle"></i> Start New Season
</div>
<div className="smode-btn" id="smodeAddBtn" onClick={(event) => runInline(event, "setSeasonMode('add')")}>
<i className="fas fa-folder-plus"></i> Add to Existing Season
</div>
</div>

{/* ── NEW SEASON SETUP ── */}

<div id="newSeasonBlock">

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-layer-group"></i> Season Details</div>

{/* Season Title */}

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Season Title</div>
<input className="ufield-input" type="text" id="seaTitle" placeholder="e.g. The Lagos Chronicles \u2014 Season 1" />
<div className="uhelp"><i className="fas fa-circle-info"></i> This is the name viewers will see for the entire season.</div>
</div>

{/* Season Number */}

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Season Number</div>
<input className="ufield-input" type="number" id="seaNumber" value="1" min="1" />
<div className="uhelp"><i className="fas fa-circle-info"></i> Auto-filled based on your existing seasons. Edit if needed.</div>
</div>

{/* Planned Episode Count */}

<div className="ufield">
<div className="ufield-label">Episodes Planned for This Season</div>
<input className="ufield-input" type="number" id="seaPlannedEpisodes" min="1" placeholder="e.g. 8" />
<div className="uhelp"><i className="fas fa-circle-info"></i> Optional — how many episodes you plan to release under this season. You don't have to upload them all now; viewers will see "X of Y episodes released" as you add more over time.</div>
</div>

{/* Season Category — multi-select (Music, Dance, News/Politics and Lifestyle
     dropped from seasons; those stay single-video-only categories) */}

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Categories</div>
<div className="ucat-multi" id="seaCategoryChips">
<div className="ucat-chip" data-cat="comedy" onClick={(event) => runInline(event, "toggleSeaCategory(this,'comedy')")}>😂 Comedy</div>
<div className="ucat-chip" data-cat="movies" onClick={(event) => runInline(event, "toggleSeaCategory(this,'movies')")}>🎥 Movies</div>
<div className="ucat-chip" data-cat="tvshows" onClick={(event) => runInline(event, "toggleSeaCategory(this,'tvshows')")}>📺 TV Shows</div>
<div className="ucat-chip" data-cat="anime" onClick={(event) => runInline(event, "toggleSeaCategory(this,'anime')")}>🎌 Anime</div>
<div className="ucat-chip" data-cat="nollywood" onClick={(event) => runInline(event, "toggleSeaCategory(this,'nollywood')")}>🎬 Nollywood / Drama</div>
<div className="ucat-chip" data-cat="documentary" onClick={(event) => runInline(event, "toggleSeaCategory(this,'documentary')")}>🎙 Documentary</div>
<div className="ucat-chip" data-cat="education" onClick={(event) => runInline(event, "toggleSeaCategory(this,'education')")}>📚 Education / Tutorial</div>
<div className="ucat-chip" data-cat="fashion" onClick={(event) => runInline(event, "toggleSeaCategory(this,'fashion')")}>👗 Fashion / Beauty</div>
<div className="ucat-chip" data-cat="food" onClick={(event) => runInline(event, "toggleSeaCategory(this,'food')")}>🍲 Food / Cooking</div>
<div className="ucat-chip" data-cat="sports" onClick={(event) => runInline(event, "toggleSeaCategory(this,'sports')")}>⚽ Sports / Fitness</div>
<div className="ucat-chip" data-cat="gaming" onClick={(event) => runInline(event, "toggleSeaCategory(this,'gaming')")}>🎮 Gaming</div>
<div className="ucat-chip" data-cat="tech" onClick={(event) => runInline(event, "toggleSeaCategory(this,'tech')")}>💻 Tech</div>
<div className="ucat-chip" data-cat="travel" onClick={(event) => runInline(event, "toggleSeaCategory(this,'travel')")}>✈️ Travel / Adventure</div>
<div className="ucat-chip" data-cat="kids" onClick={(event) => runInline(event, "toggleSeaCategory(this,'kids')")}>🧒 Kids / Family</div>
<div className="ucat-chip" data-cat="health" onClick={(event) => runInline(event, "toggleSeaCategory(this,'health')")}>🧘 Health</div>
<div className="ucat-chip" data-cat="motivation" onClick={(event) => runInline(event, "toggleSeaCategory(this,'motivation')")}>🔥 Motivation / Self-Help</div>
</div>
<input type="hidden" id="seaCategory" value="" />
<div className="uhelp"><i className="fas fa-circle-info"></i> Select all categories that apply — this applies to the entire season and all its episodes. Picking more categories raises the WTC auto-price.</div>
</div>

{/* Season Subcategory (dynamic — depends on main category) */}

<div className="ufield" id="seaSubcategoryWrap" style={{ display: "none" }}>
<div className="ufield-label">Subcategory</div>
<select className="ufield-input" id="seaSubcategory">
<option value="">— Select a subcategory —</option>
</select>
<div className="uhelp"><i className="fas fa-circle-info"></i> Pick a subcategory so viewers can find your season under the right tab on the watch page.</div>
</div>

{/* Season Description */}

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Description <span style={{ fontWeight: "400", color: "var(--gray-400)", textTransform: "none", letterSpacing: "0" }}>(min. 10 words)</span></div>
<textarea className="ufield-input" id="seaDesc" placeholder="What is this season about? (at least 10 words required)"></textarea>
<div className="uhelp"><i className="fas fa-circle-info"></i> Minimum 10 words required. Helps viewers understand what the season covers.</div>
</div>

{/* Season Thumbnail */}

<div className="ufield">
<div className="ufield-label">Season Thumbnail <span style={{ fontWeight: "400", color: "var(--gray-400)", textTransform: "none", letterSpacing: "0" }}>(optional)</span></div>
<div className="uthumb-preview" id="seaThumbPreview" onClick={(event) => runInline(event, "document.getElementById('seaThumbFile').click()")}>
<div className="uthumb-placeholder">🎬</div>
<div className="uthumb-change"><i className="fas fa-camera" style={{ marginRight: "4px" }}></i>Choose Image</div>
</div>
<input type="file" id="seaThumbFile" accept="image/*" style={{ display: "none" }} onChange={(event) => runInline(event, "handleThumb(this,'seaThumbPreview')")} />
<div className="uhelp"><i className="fas fa-circle-info"></i> This represents the whole season in search and discovery.</div>
</div>

{/* Season Trailer */}

<div className="ufield">
<div className="ufield-label">Season Trailer <span style={{ fontWeight: "400", color: "var(--gray-400)", textTransform: "none", letterSpacing: "0" }}>(optional)</span></div>
<div className="udrop" onDragOver={(event) => runInline(event, "event.preventDefault();this.classList.add('dragover')")} onDragLeave={(event) => runInline(event, "this.classList.remove('dragover')")} onDrop={(event) => runInline(event, "handleDrop(event,'seaTrailerFile','seaTrailerPreview',null)")}>
<input type="file" id="seaTrailerFile" accept="video/*" onChange={(event) => runInline(event, "handleFileSelect(this,'seaTrailerPreview',null)")} />
<div className="udrop-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
<i className="fas fa-play"></i>
</div>
<div className="udrop-label">Upload a season trailer</div>
<div className="udrop-sub">Always watchable — free for all viewers</div>
</div>
<div className="ufile-preview" id="seaTrailerPreview" style={{ display: "none" }}>
<i className="fas fa-file-video" style={{ color: "#D97706" }}></i>
<div>
<div className="ufile-name" id="seaTrailerName">—</div>
<div className="ufile-size" id="seaTrailerSize">—</div>
</div>
<button className="ufile-remove" onClick={(event) => runInline(event, "removeFile('seaTrailerFile','seaTrailerPreview',null)")}>
<i className="fas fa-times"></i>
</button>
</div>
<div className="uhelp"><i className="fas fa-circle-info"></i> Trailers go live immediately regardless of episode schedules.</div>
</div>

{/* Season Age Rating */}

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Age Rating (applies to all episodes)</div>
<div className="urating-pills" id="seaRatingPills">
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('season','3+',this)")}>3+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('season','7+',this)")}>7+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('season','10+',this)")}>10+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('season','13+',this)")}>13+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('season','16+',this)")}>16+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('season','18+',this)")}>18+</div>
<div className="urating-pill" onClick={(event) => runInline(event, "selectRating('season','25+',this)")}>25+</div>
</div>
<input type="hidden" id="seaRating" value="" />
<div className="uhelp"><i className="fas fa-circle-info"></i>
<strong>Required.</strong> This rating covers the entire season. Individual episodes cannot exceed this rating.
</div>
</div>
</div>

{/* Season Production & Cast */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-clapperboard"></i> Production & Cast <span style={{ fontWeight: "400", color: "var(--gray-400)", textTransform: "none", letterSpacing: "0", fontSize: "12px" }}>(optional — applies to whole season)</span></div>
<div className="uhelp" style={{ marginBottom: "14px" }}>
<i className="fas fa-circle-info"></i>
Cast and credits entered here cover every episode. You can add a per-episode "Guest Cast" later.
</div>

<div className="ufield">
<div className="ufield-label">Director(s)</div>
<input className="ufield-input" type="text" id="seaDirector" placeholder="e.g. Kunle Afolayan, Genevieve Nnaji" />
<div className="uhelp"><i className="fas fa-circle-info"></i> Separate multiple directors with commas.</div>
</div>

<div className="ufield">
<div className="ufield-label">Writer(s) / Screenplay</div>
<input className="ufield-input" type="text" id="seaWriter" placeholder="e.g. Biyi Bandele, Chimamanda Adichie" />
</div>

<div className="ufield">
<div className="ufield-label">Producer(s) / Executive Producer</div>
<input className="ufield-input" type="text" id="seaProducer" placeholder="e.g. Mo Abudu, EbonyLife Studios" />
</div>

<div className="ufield">
<div className="ufield-label">Main Cast / Actors & Actresses</div>
<textarea className="ufield-input" id="seaCast" placeholder="e.g. Genevieve Nnaji, Ramsey Nouah, Rita Dominic, Pete Edochie\u2026"></textarea>
<div className="uhelp"><i className="fas fa-circle-info"></i> Comma-separated list of recurring leads & supporting cast.</div>
</div>

<div className="ufield">
<div className="ufield-label">Studio / Production Company</div>
<input className="ufield-input" type="text" id="seaStudio" placeholder="e.g. EbonyLife Studios, Inkblot Productions" />
</div>

<div className="ufield">
<div className="ufield-label">Year of Release</div>
<input className="ufield-input" type="number" id="seaYear" min="1900" max="2100" placeholder="e.g. 2024" />
</div>

<div className="ufield">
<div className="ufield-label">Language</div>
<input className="ufield-input" type="text" id="seaLanguage" placeholder="e.g. English, Yoruba, Igbo, Pidgin" />
</div>

<div className="ufield">
<div className="ufield-label">Country / Region</div>
<input className="ufield-input" type="text" id="seaCountry" placeholder="e.g. Nigeria, Ghana, South Africa" />
</div>

<div className="ufield">
<div className="ufield-label">Genre Tags</div>
<input className="ufield-input" type="text" id="seaGenres" placeholder="e.g. Drama, Thriller, Family" />
<div className="uhelp"><i className="fas fa-circle-info"></i> Comma-separated. Used as filter tags on the season page.</div>
</div>

<div className="ufield">
<div className="ufield-label">Subtitles / Captions Available</div>
<input className="ufield-input" type="text" id="seaSubtitles" placeholder="e.g. English, French, Hausa" />
</div>
</div>

{/* Season Pricing Mode */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-coins"></i> Season Pricing Model</div>
<div className="uhelp" style={{ marginBottom: "14px" }}>
<i className="fas fa-circle-info"></i>
Choose how viewers pay for this season. You can change per-episode pricing later.
</div>
<div className="season-price-mode">
<div className="spmode-option selected" id="spFreeOpt" onClick={(event) => runInline(event, "setSeasonPriceMode('free')")}>
<div className="spmode-radio"></div>
<div>
<div className="spmode-label"><i className="fas fa-unlock" style={{ marginRight: "5px", color: "#D97706" }}></i>Free Season (No Earnings)</div>
<div className="spmode-sub">All episodes free. No direct revenue — best for growing an audience fast before switching to paid.</div>
</div>
</div>
<div className="spmode-option" id="spPerEpOpt" onClick={(event) => runInline(event, "setSeasonPriceMode('per-episode')")}>
<div className="spmode-radio"></div>
<div>
<div className="spmode-label"><i className="fas fa-coins" style={{ marginRight: "5px", color: "var(--purple-main)" }}></i>Pay Per Episode</div>
<div className="spmode-sub">Viewers pay Pose Coins per episode. You set the price for each episode individually.</div>
</div>
</div>
<div className="spmode-option" id="spFullOpt" onClick={(event) => runInline(event, "setSeasonPriceMode('full-season')")}>
<div className="spmode-radio"></div>
<div>
<div className="spmode-label"><i className="fas fa-layer-group" style={{ marginRight: "5px", color: "#059669" }}></i>Buy Full Season</div>
<div className="spmode-sub">Viewers pay once to unlock all episodes. You set the full season price in coins.</div>
</div>
</div>
<div className="spmode-option" id="spMixedOpt" onClick={(event) => runInline(event, "setSeasonPriceMode('mixed')")}>
<div className="spmode-radio"></div>
<div>
<div className="spmode-label"><i className="fas fa-shuffle" style={{ marginRight: "5px", color: "#2563EB" }}></i>Mixed (Free Intro + Paid)</div>
<div className="spmode-sub">First episode(s) free to watch, remaining episodes require coin payment. Great for hooking new viewers.</div>
</div>
</div>
</div>
<input type="hidden" id="seaPriceMode" value="free" />

{/* Full Season Coin Price */}

<div id="seaFullPriceToggle" className="uprice-toggle" style={{ display: "none" }}>
<div className="uprice-opt active" id="seaFullManualBtn" onClick={(event) => runInline(event, "setSeasonFullPricingMode('manual')")}>
<i className="fas fa-sliders"></i> Manual
</div>
<div className="uprice-opt" id="seaFullWtcBtn" onClick={(event) => runInline(event, "setSeasonFullPricingMode('wtc')")} title="WTC prices the full season at double this category's single-video auto-price">
<i className="fas fa-wand-magic-sparkles"></i> WTC
</div>
</div>
<div id="seaFullCoinWrap" className="ucoin-wrap" style={{ display: "none", marginTop: "14px" }}>
<div className="ucoin-display" id="seaFullCoinVal">100 PCK</div>
<div className="ucoin-naira" id="seaFullCoinNaira">for full season</div>
<input type="range" className="ucoin-slider" id="seaFullCoinSlider" min="100" max="10000" value="100" onInput={(event) => runInline(event, "updateSeasonCoinSlider()")} />
<div className="ucoin-range-labels">
<span>100 PCK</span><span>10,000 PCK</span>
</div>
<div className="uhelp" style={{ marginTop: "10px" }}>
<i className="fas fa-circle-info"></i>
Full-season pricing rewards binge-watchers and gives you predictable income per fan.
</div>
</div>

{/* Full Season — WTC auto price (double the single-video WTC price for this category) */}

<div id="seaFullAutoPriceLocked" className="ucoin-wrap" style={{ display: "none", marginTop: "14px" }}>
<div className="ucoin-display" id="seaFullAutoPriceVal">— PCK</div>
<div className="uhelp" style={{ marginTop: "6px", background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: "8px", padding: "8px 10px" }}>
<i className="fas fa-circle-info" style={{ color: "#6B21A8" }}></i>
WTC prices the full season at double what a single video in this category would auto-price at.
</div>
<div className="uhelp" style={{ marginTop: "8px" }} id="seaFullAutoPriceBreakdown"></div>
</div>
<input type="hidden" id="seaFullPricingChoice" value="manual" />
<input type="hidden" id="seaFullAutoCoinPrice" value="0" />

{/* Mixed — free episode count */}

<div id="seaMixedWrap" style={{ display: "none", marginTop: "14px" }}>
<div className="ufield-label" style={{ marginBottom: "6px" }}>How many free episodes?</div>
<input className="ufield-input" type="number" id="seaFreeEpCount" value="1" min="1" max="20" />
<div className="uhelp" style={{ marginTop: "6px" }}>
<i className="fas fa-circle-info"></i>
Episodes beyond this number will require coin payment. You set prices per episode below.
</div>
</div>
</div>

{/* Season Schedule */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-calendar-days"></i> Season Premiere Date</div>
<div className="usched-toggle" onClick={(event) => runInline(event, "toggleSched('seaSchedToggle','seaSchedDate',true)")}></div>
<div>
<div className="usched-toggle-label">Schedule Premiere</div>
<div className="usched-toggle-sub">Season page goes live on this date</div>
</div>
<label className="usched-sw" onClick={(event) => runInline(event, "event.stopPropagation()")}>
<input type="checkbox" id="seaSchedToggle" onChange={(event) => runInline(event, "toggleSched('seaSchedToggle','seaSchedDate')")} />
<span className="usched-sw-slider"></span>
</label>
</div>
<div className="usched-date-wrap" id="seaSchedDate">
<div className="ufield-label" style={{ marginBottom: "6px" }}>Premiere Date & Time</div>
<input className="ufield-input" type="datetime-local" id="seaSchedDT" />
<div className="uhelp" style={{ marginTop: "6px" }}>
<i className="fas fa-circle-info"></i>
The season trailer is always visible. Episodes respect their own release dates.
</div>
</div>
</div>

<button className="usubmit-btn" id="seaCreateBtn" onClick={(event) => runInline(event, "createSeason()")}>
<i className="fas fa-folder-plus"></i> Create Season Shell
</button>

<div className="upload-divider"><span>then add your first episode below</span></div>

</div>{/* /newSeasonBlock */}


{/* ── EXISTING SEASON PICKER ── */}

<div id="existingSeasonBlock" style={{ display: "none" }}>
<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-folder-open"></i> Select Season</div>
<div id="existingSeasonList">
<div style={{ fontSize: "13px", color: "var(--gray-400)", fontStyle: "italic", padding: "8px 0" }}>
Loading your seasons…
</div>
</div>
<input type="hidden" id="selectedSeasonId" value="" />
<div className="uhelp" style={{ marginTop: "8px" }}>
<i className="fas fa-circle-info"></i>
Select the season you want to add an episode to. Episode number is auto-filled.
</div>
</div>

{/* Selected Season Info Preview */}

<div id="selectedSeasonInfo" style={{ display: "none" }} className="upload-card">
<div className="upload-card-title"><i className="fas fa-circle-info"></i> Season Info</div>
<div id="selectedSeasonInfoContent"></div>
<div id="epListPreview" className="ep-list-preview" style={{ display: "none" }}>
<div className="ep-list-title">Episodes already uploaded</div>
<div id="epListItems"></div>
</div>
</div>
</div>

{/* ── EPISODE FORM (shown after season selected/created) ── */}

<div id="episodeBlock" style={{ display: "none" }}>
{/* Draft-until-2-episodes progress — see createSeason()/postEpisode() */}

<div id="seasonDraftNotice" className="uhelp" style={{ marginBottom: "14px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "10px 12px" }}>
<i className="fas fa-circle-info" style={{ color: "#D97706" }}></i>
This season stays a private draft — invisible everywhere on Pose — until it has at least
<strong>2 episodes</strong>. Currently <strong id="seasonDraftEpCount">0</strong>/2 added.
</div>
<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-play-circle"></i> Episode Details</div>
<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Episode Number</div>
<input className="ufield-input" type="number" id="epNumber" value="1" min="1" />
<div className="uhelp"><i className="fas fa-circle-info"></i> Auto-filled from the last episode. Edit freely.</div>
</div>

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Episode Title</div>
<input className="ufield-input" type="text" id="epTitle" placeholder="e.g. Episode 1: The Beginning" />
</div>

<div className="ufield">
<div className="ufield-label"><span className="ureq-dot"></span> Description <span style={{ fontWeight: "400", color: "var(--gray-400)", textTransform: "none", letterSpacing: "0" }}>(min. 10 words)</span></div>
<textarea className="ufield-input" id="epDesc" placeholder="What happens in this episode? (at least 10 words required)"></textarea>
<div className="uhelp"><i className="fas fa-circle-info"></i> Minimum 10 words required per episode.</div>
</div>

<div className="ufield">
<div className="ufield-label">Episode Thumbnail <span style={{ fontWeight: "400", color: "var(--gray-400)", textTransform: "none", letterSpacing: "0" }}>(optional)</span></div>
<div className="uthumb-preview" id="epThumbPreview" onClick={(event) => runInline(event, "document.getElementById('epThumbFile').click()")}>
<div className="uthumb-placeholder">🎬</div>
<div className="uthumb-change"><i className="fas fa-camera" style={{ marginRight: "4px" }}></i>Choose Image</div>
</div>
<input type="file" id="epThumbFile" accept="image/*" style={{ display: "none" }} onChange={(event) => runInline(event, "handleThumb(this,'epThumbPreview')")} />
</div>
</div>

{/* Episode Video + Trailer */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-video"></i> Episode Video File <span className="ureq-dot" style={{ marginLeft: "2px" }}></span></div>
<div className="udrop" id="epVideoDrop" onDragOver={(event) => runInline(event, "event.preventDefault();this.classList.add('dragover')")} onDragLeave={(event) => runInline(event, "this.classList.remove('dragover')")} onDrop={(event) => runInline(event, "handleDrop(event,'epVideoFile','epVideoPreview','epVideoProgress')")}>
<input type="file" id="epVideoFile" accept="video/*" onChange={(event) => runInline(event, "handleFileSelect(this,'epVideoPreview','epVideoProgress')")} />
<div className="udrop-icon"><i className="fas fa-cloud-arrow-up"></i></div>
<div className="udrop-label">Tap or drag episode video</div>
<div className="udrop-sub">MP4 · MOV · AVI</div>
</div>
<div className="ufile-preview" id="epVideoPreview" style={{ display: "none" }}>
<i className="fas fa-file-video"></i>
<div>
<div className="ufile-name" id="epVideoName">—</div>
<div className="ufile-size" id="epVideoSize">—</div>
</div>
<button className="ufile-remove" onClick={(event) => runInline(event, "removeFile('epVideoFile','epVideoPreview','epVideoProgress')")}>
<i className="fas fa-times"></i>
</button>
</div>
<div className="uprog-wrap" id="epVideoProgress">
<div className="uprog-label">
<span id="epVideoProgLabel">Uploading…</span>
<span id="epVideoProgPct">0%</span>
</div>
<div className="uprog-bg"><div className="uprog-fill" id="epVideoProgFill"></div></div>
</div>
<div className="uhelp" style={{ marginTop: "10px" }}>
<i className="fas fa-circle-info"></i> Files up to 4GB are supported. Keep this page open during upload.
</div>
<div style={{ marginTop: "10px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
<i className="fas fa-triangle-exclamation" style={{ color: "#D97706", fontSize: "13px", marginTop: "1px", flexShrink: "0" }}></i>
<div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.5" }}>
<strong>No watermarks.</strong> Don't upload content carrying another platform's logo or watermark (TikTok, Instagram, YouTube, Snapchat, CapCut, etc.). Watermarked uploads may be removed and can affect your channel's standing.
</div>
</div>

<div className="upload-divider" style={{ margin: "16px 0" }}><span>episode trailer</span></div>

<div className="udrop" onDragOver={(event) => runInline(event, "event.preventDefault();this.classList.add('dragover')")} onDragLeave={(event) => runInline(event, "this.classList.remove('dragover')")} onDrop={(event) => runInline(event, "handleDrop(event,'epTrailerFile','epTrailerPreview',null)")}>
<input type="file" id="epTrailerFile" accept="video/*" onChange={(event) => runInline(event, "handleFileSelect(this,'epTrailerPreview',null)")} />
<div className="udrop-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
<i className="fas fa-play"></i>
</div>
<div className="udrop-label">Episode Trailer <span style={{ fontWeight: "400", color: "var(--gray-400)" }}>(optional)</span></div>
<div className="udrop-sub">Always free to watch — builds anticipation</div>
</div>
<div className="ufile-preview" id="epTrailerPreview" style={{ display: "none" }}>
<i className="fas fa-file-video" style={{ color: "#D97706" }}></i>
<div>
<div className="ufile-name" id="epTrailerName">—</div>
<div className="ufile-size" id="epTrailerSize">—</div>
</div>
<button className="ufile-remove" onClick={(event) => runInline(event, "removeFile('epTrailerFile','epTrailerPreview',null)")}>
<i className="fas fa-times"></i>
</button>
</div>
</div>

{/* Episode Production & Guest Cast */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-clapperboard"></i> Episode Credits <span style={{ fontWeight: "400", color: "var(--gray-400)", textTransform: "none", letterSpacing: "0", fontSize: "12px" }}>(optional)</span></div>
<div className="uhelp" style={{ marginBottom: "14px" }}>
<i className="fas fa-circle-info"></i>
Main cast is inherited from the season. Use these fields only for episode-specific credits.
</div>

<div className="ufield">
<div className="ufield-label">Episode Director</div>
<input className="ufield-input" type="text" id="epDirector" placeholder="Leave blank to use the season director" />
</div>

<div className="ufield">
<div className="ufield-label">Episode Writer</div>
<input className="ufield-input" type="text" id="epWriter" placeholder="Leave blank to use the season writer" />
</div>

<div className="ufield">
<div className="ufield-label">Guest Cast</div>
<textarea className="ufield-input" id="epGuestCast" placeholder="e.g. Special guests appearing only in this episode\u2026"></textarea>
<div className="uhelp"><i className="fas fa-circle-info"></i> Comma-separated list of guest stars.</div>
</div>
</div>

{/* Episode Schedule */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-calendar-days"></i> Episode Release Date</div>

<div className="usched-toggle" onClick={(event) => runInline(event, "toggleSched('epSchedToggle','epSchedDate',true)")}>
<div>
<div className="usched-toggle-label">Schedule This Episode</div>
<div className="usched-toggle-sub">Override the season premiere date for this episode</div>
</div>
<label className="usched-sw" onClick={(event) => runInline(event, "event.stopPropagation()")}>
<input type="checkbox" id="epSchedToggle" onChange={(event) => runInline(event, "toggleSched('epSchedToggle','epSchedDate')")} />
<span className="usched-sw-slider"></span>
</label>
</div>
<div className="usched-date-wrap" id="epSchedDate">
<div className="ufield-label" style={{ marginBottom: "6px" }}>Release Date & Time</div>
<input className="ufield-input" type="datetime-local" id="epSchedDT" />
<div className="uhelp" style={{ marginTop: "6px" }}>
<i className="fas fa-circle-info"></i>
Leave blank to use the season premiere date. Episode trailer always goes live immediately.
</div>
</div>
</div>

{/* Episode Pricing */}

<div className="upload-card">
<div className="upload-card-title"><i className="fas fa-coins"></i> Episode Pricing</div>
<div className="uhelp" style={{ marginBottom: "14px" }}>
<i className="fas fa-circle-info"></i>
You can make episode 1 free to attract viewers, then charge for the rest.
</div>
<div className="uprice-toggle">
<div className="uprice-opt active" id="epFreeBtn" onClick={(event) => runInline(event, "setPrice('episode','free')")}>
<i className="fas fa-unlock"></i> Free
</div>
<div className="uprice-opt" id="epPaidBtn" onClick={(event) => runInline(event, "setPrice('episode','paid')")}>
<i className="fas fa-coins"></i> Paid
</div>
<div className="uprice-opt" id="epWtcBtn" onClick={(event) => runInline(event, "setPrice('episode','wtc')")} title="Let WTC set the price automatically from category, length and your channel's views">
<i className="fas fa-wand-magic-sparkles"></i> WTC
</div>
</div>

<div id="epFreeInfo" className="ufree-badge">
<i className="fas fa-unlock"></i>
<div>
<div className="ufree-badge-text">Free Episode — No Earnings</div>
<div className="ufree-badge-sub">Great for episode 1 to hook new viewers</div>
</div>
</div>

<div id="epCoinWrap" className="ucoin-wrap" style={{ display: "none" }}>
<div className="ucoin-display" id="epCoinVal"><input type="number" className="ucoin-num-input" id="epCoinInput" min="4" max="2000" value="8" onInput={(event) => runInline(event, "updateCoinFromInput('ep')")} /> PCK</div>
<div className="ucoin-naira" id="epCoinNaira">Price in Pose Coin Kobo (1 PCK = ₦1)</div>
<div className="ucoin-cat short" id="epCoinCat">Short Episode</div>
<input type="range" className="ucoin-slider" id="epCoinSlider" min="4" max="2000" value="8" onInput={(event) => runInline(event, "updateCoinSlider('ep')")} />
<div className="ucoin-range-labels">
<span id="epCoinMinLbl">4 PCK minimum</span><span id="epCoinMaxLbl">2,000 PCK</span>
</div>
<div id="epSlotsNotice" className="uhelp" style={{ marginTop: "10px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "8px 10px" }}>
<i className="fas fa-circle-info" style={{ color: "#D97706" }}></i>
Pricing this season uses 1 of your monthly season slots — <strong id="epSlotsRemaining">0/5</strong> used this month. Once a season is priced, you can price as many episodes inside it as you like.
</div>
<div className="uhelp" style={{ marginTop: "8px" }}>
<i className="fas fa-circle-info"></i>
Viewers can also buy the full season if that option is set.
</div>
</div>

{/* Auto-Priced (shown when WTC is picked for this episode, or once all 5 monthly season slots are used up) */}

<div id="epAutoPriceLocked" className="ucoin-wrap" style={{ display: "none" }}>
<div className="ucoin-display" id="epAutoPriceVal">— PCK</div>
<div className="uhelp" style={{ marginTop: "6px", background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: "8px", padding: "8px 10px" }} id="epAutoPriceReason">
<i className="fas fa-circle-info" style={{ color: "#6B21A8" }}></i>
This episode's price is auto-calculated from its category, length and your channel's current total views.
</div>
<div className="uhelp" style={{ marginTop: "8px" }} id="epAutoPriceBreakdown"></div>
</div>
<input type="hidden" id="epPriceMode" value="free" />
<input type="hidden" id="epCoinPrice" value="0" />
<input type="hidden" id="epPricingChoice" value="manual" />
</div>

{/* Post Episode Button */}

<button className="usubmit-btn" id="epPostBtn" onClick={(event) => runInline(event, "postEpisode()")}>
<i className="fas fa-paper-plane"></i> Post Episode
</button>

</div>{/* /episodeBlock */}


</div>
</div>{/* /panel-season */}


{/* /page-upload */}


<div id="page-allvideos" className="page">

<div className="av-topbar">
<div className="av-topbar-row1">
<button className="back-btn" onClick={(event) => runInline(event, "closeAllVideos()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M19 12H5M12 5l-7 7 7 7" />
</svg>
Back
</button>
<div className="av-search-wrap">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="11" cy="11" r="8" />
<path d="M21 21l-4.35-4.35" />
</svg>
<input className="av-search-input" id="avSearchInput" placeholder="Search videos, seasons, episodes\u2026" onInput={(event) => runInline(event, "onAvSearch(this.value)")} />
</div>
</div>
<div className="av-tabs">
<div className="av-tab active" id="avTabSingle" onClick={(event) => runInline(event, "switchAvTab('single')")}>
<i className="fas fa-film"></i> Single Videos
<span className="av-tab-count" id="avCountSingle">0</span>
</div>
<div className="av-tab" id="avTabSeason" onClick={(event) => runInline(event, "switchAvTab('season')")}>
<i className="fas fa-layer-group"></i> Seasons & Episodes
<span className="av-tab-count" id="avCountSeason">0</span>
</div>
</div>
</div>

<div className="av-content">

{/* Sort row */}

<div className="av-sort-row">
<span className="av-sort-label" id="avSortLabel">Showing all videos</span>
<select className="av-sort-select" id="avSortSelect" onChange={(event) => runInline(event, "onAvSort(this.value)")}>
<option value="newest">Newest First</option>
<option value="oldest">Oldest First</option>
<option value="views">Most Viewed</option>
<option value="revenue">Top Earning</option>
</select>
</div>

{/* Single Videos Panel */}

<div id="avPanelSingle"></div>

{/* Seasons Panel */}

<div id="avPanelSeason" style={{ display: "none" }}></div>

</div>
</div>

<div id="page-videodetail" className="page">

<div className="vd-topbar">
<button className="vd-back-btn" id="vdBackBtn" onClick={(event) => runInline(event, "closeVideoDetail()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M19 12H5M12 5l-7 7 7 7" />
</svg>
Back
</button>
<span className="vd-topbar-title" id="vdTopTitle">Video</span>
</div>

{/* Player */}

<div className="vd-player-wrap" id="vdPlayerWrap">
<div className="vd-shimmer" id="vdShimmer">
<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5">
<polygon points="5 3 19 12 5 21 5 3" />
</svg>
</div>
</div>

{/* Body */}

<div className="vd-body" id="vdBody">
{/* filled by JS */}

</div>

</div>

<div id="uploadProgressPopup" className="hidden">
<div className="uppop-card">
<div className="uppop-handle"></div>
<div className="uppop-title" id="uppopTitle">Uploading Video…</div>
<div className="uppop-sub" id="uppopSub">Please keep this page open</div>

<div className="uppop-file-row">
<div className="uppop-file-icon"><i className="fas fa-file-video"></i></div>
<div style={{ flex: "1", minWidth: "0" }}>
<div className="uppop-file-name" id="uppopFileName">video.mp4</div>
<div className="uppop-file-size" id="uppopFileSize">—</div>
</div>
</div>

<div className="uppop-steps" id="uppopSteps"></div>

<div className="uppop-main-prog">
<div className="uppop-prog-label">
<span id="uppopProgLabel">Uploading…</span>
<span id="uppopProgPct">0%</span>
</div>
<div className="uppop-prog-bg">
<div className="uppop-prog-fill" id="uppopProgFill"></div>
</div>
<div className="uppop-speed" id="uppopSpeed"></div>
</div>

<div className="uppop-note">
<i className="fas fa-circle-info"></i>
<span>Upload time depends on your video's file size and your internet speed — bigger files and slower networks naturally take longer. Keep this page open.</span>
</div>

<div className="uppop-tip" id="uppopTip">
<i className="fas fa-lightbulb"></i>
<span id="uppopTipText"></span>
</div>

<button className="uppop-retry-btn" id="uppopRetryBtn" style={{ display: "none" }}>
<i className="fas fa-rotate-right" style={{ marginRight: "6px" }}></i>Retry Upload
</button>
<div style={{ display: "flex", gap: "10px" }}>
<button className="uppop-cancel-btn" id="uppopMinBtn" onClick={(event) => runInline(event, "minimiseUploadPopup()")} style={{ flex: "1", background: "var(--purple-ghost)", color: "var(--purple-main)", borderColor: "var(--purple-pale)" }}>
<i className="fas fa-minus" style={{ marginRight: "6px" }}></i>Minimise
</button>
<button className="uppop-cancel-btn" id="uppopCancelBtn" onClick={(event) => runInline(event, "cancelUpload()")} style={{ flex: "1" }}>
<i className="fas fa-times" style={{ marginRight: "6px" }}></i>Cancel
</button>
</div>

</div>
</div>
{/* Minimised Upload Bar */}

<div id="uppopMiniBar" onClick={(event) => runInline(event, "expandUploadPopup()")}>
<div className="uppop-mini-spinner"></div>
<div className="uppop-mini-content">
<div className="uppop-mini-label" id="uppopMiniLabel">Uploading…</div>
<div className="uppop-mini-pct" id="uppopMiniPct">0%</div>
<div className="uppop-mini-bar-bg"><div className="uppop-mini-bar-fill" id="uppopMiniBarFill"></div></div>
</div>
<div className="uppop-mini-expand"><i className="fas fa-chevron-up"></i></div>
</div>

<div id="historyPopup" className="earn-popup-overlay hidden">
<div className="earn-popup-card" style={{ paddingBottom: "52px" }}>
<div className="uppop-handle"></div>

{/* Header */}

<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
<div style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>
<i className="fas fa-clock-rotate-left" style={{ marginRight: "7px", color: "var(--purple-main)" }}></i>History
</div>
<button onClick={(event) => runInline(event, "closeHistoryPopup()")} style={{ background: "none", border: "none", fontSize: "20px", color: "var(--gray-400)", cursor: "pointer", padding: "4px" }}>
<i className="fas fa-times"></i>
</button>
</div>

{/* 3 Tabs */}

<div style={{ display: "flex", gap: "0", background: "var(--gray-100)", borderRadius: "12px", padding: "4px", marginBottom: "20px" }}>
<div className="hist-tab active" id="htab-transactions" onClick={(event) => runInline(event, "switchHistTab('transactions')")}>
<i className="fas fa-receipt" style={{ marginRight: "5px", fontSize: "11px" }}></i>Transactions
</div>
<div className="hist-tab" id="htab-requests" onClick={(event) => runInline(event, "switchHistTab('requests')")}>
<i className="fas fa-paper-plane" style={{ marginRight: "5px", fontSize: "11px" }}></i>Requests
</div>
<div className="hist-tab" id="htab-support" onClick={(event) => runInline(event, "switchHistTab('support')")}>
<i className="fas fa-headset" style={{ marginRight: "5px", fontSize: "11px" }}></i>Support
</div>
</div>

{/* ══════════════════════════════════
TAB 1 — TRANSACTIONS
═══════════════════════════════════ */}

<div id="hpanel-transactions">

{/* Filter pills */}

<div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
<div className="hist-filter active" id="hf-all" onClick={(event) => runInline(event, "filterTransactions('all')")}>All</div>
<div className="hist-filter" id="hf-sales" onClick={(event) => runInline(event, "filterTransactions('sales')")}>Sales</div>
<div className="hist-filter" id="hf-payout" onClick={(event) => runInline(event, "filterTransactions('payout')")}>Payouts</div>
<div className="hist-filter" id="hf-refund" onClick={(event) => runInline(event, "filterTransactions('refund')")}>Refunds</div>
</div>

{/* Summary strip (filled by JS) */}

<div id="htxn-summary" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
</div>

{/* Transaction rows (filled by JS) */}

<div id="htxn-list" style={{ display: "flex", flexDirection: "column", gap: "8px" }}></div>

</div>

{/* ══════════════════════════════════
TAB 2 — WITHDRAW REQUESTS
═══════════════════════════════════ */}

<div id="hpanel-requests" style={{ display: "none" }}>

{/* Status filter pills */}

<div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
<div className="hist-filter active" id="hreq-all" onClick={(event) => runInline(event, "filterRequests('all')")}>All</div>
<div className="hist-filter" id="hreq-pending" onClick={(event) => runInline(event, "filterRequests('pending')")}>Pending</div>
<div className="hist-filter" id="hreq-approved" onClick={(event) => runInline(event, "filterRequests('approved')")}>Approved</div>
<div className="hist-filter" id="hreq-rejected" onClick={(event) => runInline(event, "filterRequests('rejected')")}>Rejected</div>
</div>

{/* Request cards (filled by JS) */}

<div id="hreq-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}></div>

</div>

{/* ══════════════════════════════════
TAB 3 — SUPPORT
═══════════════════════════════════ */}

<div id="hpanel-support" style={{ display: "none" }}>

{/* Compose card */}

<div style={{ background: "var(--purple-ghost)", border: "1.5px solid var(--purple-pale)", borderRadius: "14px", padding: "18px", marginBottom: "18px" }}>

<div style={{ fontSize: "14px", fontWeight: "700", color: "var(--purple-deep)", marginBottom: "14px" }}>
<i className="fas fa-pen-to-square" style={{ marginRight: "7px" }}></i>New Message
</div>

{/* Type selector */}

<div style={{ marginBottom: "12px" }}>
<div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".6px", color: "var(--gray-500)", marginBottom: "7px" }}>Type</div>
<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
<div className="supp-type active" id="stype-complaint" onClick={(event) => runInline(event, "setSuppType('complaint')")}>
<i className="fas fa-triangle-exclamation" style={{ marginRight: "4px", fontSize: "11px" }}></i>Complaint
</div>
<div className="supp-type" id="stype-report" onClick={(event) => runInline(event, "setSuppType('report')")}>
<i className="fas fa-flag" style={{ marginRight: "4px", fontSize: "11px" }}></i>Report
</div>
<div className="supp-type" id="stype-notification" onClick={(event) => runInline(event, "setSuppType('notification')")}>
<i className="fas fa-bell" style={{ marginRight: "4px", fontSize: "11px" }}></i>Notification
</div>
<div className="supp-type" id="stype-inquiry" onClick={(event) => runInline(event, "setSuppType('inquiry')")}>
<i className="fas fa-circle-question" style={{ marginRight: "4px", fontSize: "11px" }}></i>Inquiry
</div>
</div>
<input type="hidden" id="suppType" value="complaint" />
</div>

{/* Subject */}

<div style={{ marginBottom: "10px" }}>
<div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".6px", color: "var(--gray-500)", marginBottom: "6px" }}>Subject</div>
<input type="text" id="suppSubject" className="earn-input" placeholder="e.g. Payment not received for withdrawal on 20 Apr" />
</div>

{/* Related Transaction ID */}

<div style={{ marginBottom: "10px" }}>
<div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".6px", color: "var(--gray-500)", marginBottom: "6px" }}>
Related Transaction ID
<span style={{ fontWeight: "400", textTransform: "none", fontSize: "11px", color: "var(--gray-400)", letterSpacing: "0" }}> (optional)</span>
</div>
<input type="text" id="suppTxnId" className="earn-input" placeholder="e.g. WD-20240420-001" />
</div>

{/* Amount involved */}

<div style={{ marginBottom: "10px" }}>
<div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".6px", color: "var(--gray-500)", marginBottom: "6px" }}>
Amount Involved
<span style={{ fontWeight: "400", textTransform: "none", fontSize: "11px", color: "var(--gray-400)", letterSpacing: "0" }}> (optional)</span>
</div>
<input type="text" id="suppAmount" className="earn-input" placeholder="e.g. \u20a625,000" />
</div>

{/* Message */}

<div style={{ marginBottom: "14px" }}>
<div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".6px", color: "var(--gray-500)", marginBottom: "6px" }}>
Message <span style={{ color: "var(--red)", fontSize: "13px" }}>*</span>
</div>
<textarea id="suppMessage" className="earn-input" style={{ minHeight: "90px", resize: "vertical", lineHeight: "1.5" }} placeholder="Describe your issue, complaint, or inquiry in detail\u2026"></textarea>
</div>

<button id="suppSubmitBtn" onClick={(event) => runInline(event, "submitSupportMessage()")} className="earn-primary-btn">
<i className="fas fa-paper-plane" style={{ marginRight: "7px" }}></i>Send Message
</button>

{/* Success badge */}

<div id="suppSuccessBadge" style={{ display: "none", marginTop: "12px", textAlign: "center" }}>
<span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ECFDF5", color: "#059669", fontSize: "12px", fontWeight: "600", padding: "7px 16px", borderRadius: "20px", border: "1px solid #A7F3D0" }}>
<i className="fas fa-check-circle"></i> Message sent — we'll reply within 24 hours
</span>
</div>
</div>

{/* Inbox */}

<div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
<span>
<i className="fas fa-inbox" style={{ marginRight: "7px", color: "var(--purple-main)" }}></i>Inbox
</span>
<span id="hsupp-unread-badge" style={{ display: "none", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", background: "var(--red)", color: "white" }}>
</span>
</div>

{/* Inbox messages (filled by JS) */}

<div id="hsupp-inbox" style={{ display: "flex", flexDirection: "column", gap: "8px" }}></div>

</div>

</div>
</div>
