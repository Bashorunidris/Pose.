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
<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
<circle cx="12" cy="12" r="3">
</svg>
Settings
</button>
<button className="btn btn-purple" onClick={(event) => runInline(event, "goBackToPose()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M19 12H5M12 5l-7 7 7 7">
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
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12">
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
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12">
</svg>
Upload Video
</button>
<button className="btn btn-outline-purple btn-lg" onClick={(event) => runInline(event, "openAllVideos()")}>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
</svg>
See All Videos
</button>
</div>

</div>{/* /page-home */}


