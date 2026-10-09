<div id="page-legibility" className="page">

{/* TOP BAR */}

<div className="studio-topbar">
<button className="back-btn" onClick={(event) => runInline(event, "goBackFromLegibility()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M19 12H5M12 5l-7 7 7 7">
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
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z">
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
<circle cx="12" cy="12" r="10"><path d="M12 6v6l4 2">
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
<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z">
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
<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
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
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z">
<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
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
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z">
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

<div className="leg-rating-card" style={{ "--delay": ".05s" }}>
<div className="leg-rating-icon" style={{ background: "#D1FAE5", color: "#059669", borderColor: "#A7F3D0" }}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="12" cy="12" r="10"><path d="M8 12l2.5 2.5L16 9">
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

<div className="leg-rating-card" style={{ "--delay": ".1s" }}>
<div className="leg-rating-icon" style={{ background: "#DBEAFE", color: "#2563EB", borderColor: "#BFDBFE" }}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M12 2a10 10 0 100 20A10 10 0 0012 2z">
<path d="M12 8v4">
<circle cx="12" cy="16" r="1" fill="currentColor">
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

<div className="leg-rating-card" style={{ "--delay": ".15s" }}>
<div className="leg-rating-icon" style={{ background: "#FEF3C7", color: "#D97706", borderColor: "#FDE68A" }}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z">
<line x1="12" y1="9" x2="12" y2="13">
<line x1="12" y1="17" x2="12.01" y2="17">
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

<div className="leg-rating-card" style={{ "--delay": ".2s" }}>
<div className="leg-rating-icon" style={{ background: "#FEE2E2", color: "#DC2626", borderColor: "#FECACA" }}>
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="12" cy="12" r="10">
<line x1="15" y1="9" x2="9" y2="15">
<line x1="9" y1="9" x2="15" y2="15">
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
<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.084-.134-2.135-.382-3.016z">
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

<div className="leg-rule-item" style={{ "--delay": ".04s" }}>
<div className="leg-rule-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z">
</svg>
</div>
<div className="leg-rule-body">
<div className="leg-rule-title">Inappropriate Language</div>
<div className="leg-rule-desc">Frequent profanity — especially in the first 30 seconds — disqualifies a video from monetization.</div>
</div>
<div className="leg-rule-status danger">✖ Policy Risk</div>
</div>

{/* Violence & Sensitive Events */}

<div className="leg-rule-item" style={{ "--delay": ".08s" }}>
<div className="leg-rule-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z">
</svg>
</div>
<div className="leg-rule-body">
<div className="leg-rule-title">Violence & Sensitive Events</div>
<div className="leg-rule-desc">Graphic violence, self-harm encouragement, or exploitation of tragedies is strictly prohibited.</div>
</div>
<div className="leg-rule-status danger">✖ Banned</div>
</div>

{/* Harmful or Dangerous Acts */}

<div className="leg-rule-item" style={{ "--delay": ".12s" }}>
<div className="leg-rule-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
</svg>
</div>
<div className="leg-rule-body">
<div className="leg-rule-title">Harmful or Dangerous Acts</div>
<div className="leg-rule-desc">Videos that show or encourage acts leading to serious physical injury are not eligible for Pose Coin pricing.</div>
</div>
<div className="leg-rule-status danger">✖ Banned</div>
</div>

{/* Shocking Content */}

<div className="leg-rule-item" style={{ "--delay": ".16s" }}>
<div className="leg-rule-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="12" cy="12" r="10"><path d="M12 8v4m0 4h.01">
</svg>
</div>
<div className="leg-rule-body">
<div className="leg-rule-title">Shocking Content</div>
<div className="leg-rule-desc">Content designed to disgust or petrify (e.g. graphic medical procedures without educational context) is banned.</div>
</div>
<div className="leg-rule-status warn">⚠ Review</div>
</div>

{/* Intellectual Property */}

<div className="leg-rule-item" style={{ "--delay": ".20s" }}>
<div className="leg-rule-icon" style={{ background: "#EDE9FE", color: "#7C3AED" }}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z">
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
<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2">
<circle cx="9" cy="7" r="4">
<path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75">
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

<div className="leg-conduct-card" style={{ "--delay": ".05s" }}>
<div className="leg-conduct-icon" style={{ background: "linear-gradient(135deg,#EDE9FE,#DDD6FE)", color: "#6D28D9" }}>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z">
</svg>
</div>
<div className="leg-conduct-title">User Safety</div>
<div className="leg-conduct-body">Content that promotes bullying, harassment, or doxing of other users will result in a <strong>permanent ban</strong>.</div>
<div className="leg-conduct-footer danger-footer">
<i className="fas fa-bolt"></i> Permanent Ban
</div>
</div>

{/* Zero Hate Tolerance */}

<div className="leg-conduct-card" style={{ "--delay": ".1s" }}>
<div className="leg-conduct-icon" style={{ background: "linear-gradient(135deg,#FEE2E2,#FECACA)", color: "#DC2626" }}>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="12" cy="12" r="10">
<line x1="15" y1="9" x2="9" y2="15">
<line x1="9" y1="9" x2="15" y2="15">
</svg>
</div>
<div className="leg-conduct-title">Zero Hate Tolerance</div>
<div className="leg-conduct-body">No content promoting hatred or discrimination based on race, religion, gender, or orientation.</div>
<div className="leg-conduct-footer danger-footer">
<i className="fas fa-ban"></i> Zero Tolerance
</div>
</div>

{/* No Deceptive Behaviour */}

<div className="leg-conduct-card" style={{ "--delay": ".15s" }}>
<div className="leg-conduct-icon" style={{ background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", color: "#D97706" }}>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<rect x="3" y="3" width="18" height="18" rx="2">
<path d="M9 9h6M9 12h6M9 15h4">
</svg>
</div>
<div className="leg-conduct-title">No Deceptive Behaviour</div>
<div className="leg-conduct-body">Clickbait thumbnails are prohibited. Titles, metadata, and tags must accurately represent the video content.</div>
<div className="leg-conduct-footer warn-footer">
<i className="fas fa-triangle-exclamation"></i> Policy Violation
</div>
</div>

{/* Interactive Safety */}

<div className="leg-conduct-card" style={{ "--delay": ".2s" }}>
<div className="leg-conduct-icon" style={{ background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", color: "#059669" }}>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z">
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
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
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

