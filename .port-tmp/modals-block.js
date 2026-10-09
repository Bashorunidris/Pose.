      const modals = {
        editProfileModal: `
          <h3 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:20px;">Edit Profile</h3>
          <div style="margin-bottom:14px;">
            <label style="font-size:12px;font-weight:600;color:var(--gray-500);display:block;margin-bottom:5px;">CHANNEL NAME</label>
            <input id="editName" value="${d.name || ''}"
              style="width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--gray-200);font-size:14px;color:var(--text-main);outline:none;"
              onfocus="this.style.borderColor='var(--purple-main)'"
              onblur="this.style.borderColor='var(--gray-200)'" />
          </div>
          <div style="margin-bottom:14px;">
            <label style="font-size:12px;font-weight:600;color:var(--gray-500);display:block;margin-bottom:5px;">DESCRIPTION</label>
            <textarea id="editDesc"
              style="width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--gray-200);font-size:14px;color:var(--text-main);outline:none;resize:none;height:80px;font-family:'DM Sans',sans-serif;"
              onfocus="this.style.borderColor='var(--purple-main)'"
              onblur="this.style.borderColor='var(--gray-200)'">${d.description || ''}</textarea>
          </div>
          <div style="display:flex;gap:10px;">
            <button onclick="saveProfile()" style="flex:1;padding:11px;border-radius:10px;background:var(--purple-main);color:white;font-size:14px;font-weight:600;cursor:pointer;border:none;">Save Changes</button>
            <button onclick="closeModal()" style="padding:11px 18px;border-radius:10px;background:var(--gray-100);color:var(--gray-700);font-size:14px;font-weight:600;cursor:pointer;border:1.5px solid var(--gray-200);">Cancel</button>
          </div>`,

        passwordModal: `
          <h3 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:20px;">Change Password</h3>
          <div style="margin-bottom:14px;">
            <label style="font-size:12px;font-weight:600;color:var(--gray-500);display:block;margin-bottom:5px;">NEW PASSWORD</label>
            <input id="newPwd" type="password" placeholder="Min. 6 characters"
              style="width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--gray-200);font-size:14px;outline:none;"
              onfocus="this.style.borderColor='var(--purple-main)'"
              onblur="this.style.borderColor='var(--gray-200)'" />
          </div>
          <div style="display:flex;gap:10px;margin-top:6px;">
            <button onclick="changePassword()" style="flex:1;padding:11px;border-radius:10px;background:var(--purple-main);color:white;font-size:14px;font-weight:600;cursor:pointer;border:none;">Update Password</button>
            <button onclick="closeModal()" style="padding:11px 18px;border-radius:10px;background:var(--gray-100);color:var(--gray-700);font-size:14px;font-weight:600;cursor:pointer;border:1.5px solid var(--gray-200);">Cancel</button>
          </div>`,

        photoModal: `
          <h3 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:16px;">Change Channel Photo</h3>
          <p style="font-size:12.5px;color:var(--gray-500);margin-bottom:16px;">Upload a new profile image for your channel.</p>
          <input type="file" id="newPhotoFile" accept="image/*" style="display:none" onchange="uploadNewPhoto(this)" />
          <button onclick="document.getElementById('newPhotoFile').click()"
            style="width:100%;padding:11px;border-radius:10px;background:var(--purple-main);color:white;font-size:14px;font-weight:600;cursor:pointer;border:none;margin-bottom:8px;">
            <i class="fa-solid fa-camera" style="margin-right:6px;"></i>Choose Photo
          </button>
          <button onclick="closeModal()" style="width:100%;padding:11px;border-radius:10px;background:var(--gray-100);color:var(--gray-700);font-size:14px;font-weight:600;cursor:pointer;border:1.5px solid var(--gray-200);">Cancel</button>`,

        bannerModal: `
          <h3 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:16px;">Change Channel Banner</h3>
          <p style="font-size:12.5px;color:var(--gray-500);margin-bottom:16px;">Upload a new background/banner image for your channel.</p>
          <input type="file" id="newBannerFile" accept="image/*" style="display:none" onchange="uploadNewBanner(this)" />
          <button onclick="document.getElementById('newBannerFile').click()"
            style="width:100%;padding:11px;border-radius:10px;background:var(--purple-main);color:white;font-size:14px;font-weight:600;cursor:pointer;border:none;margin-bottom:8px;">
            <i class="fa-solid fa-image" style="margin-right:6px;"></i>Choose Banner Image
          </button>
          <button onclick="closeModal()" style="width:100%;padding:11px;border-radius:10px;background:var(--gray-100);color:var(--gray-700);font-size:14px;font-weight:600;cursor:pointer;border:1.5px solid var(--gray-200);">Cancel</button>`,

        boostModal: `
          <h3 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:6px;">Boost a Video</h3>
          <p style="font-size:12.5px;color:var(--gray-500);margin-bottom:18px;">Select a promotion stage to amplify your video's reach.</p>
          ${[
            { stage:'Stage 1', price:'₦50,000',  coins:'🪙 2,000',  reach:'Up to 100,000 views',   col:'#D97706' },
            { stage:'Stage 2', price:'₦100,000', coins:'🪙 4,000',  reach:'Up to 250,000 views',   col:'#B45309' },
            { stage:'Stage 3', price:'₦250,000', coins:'🪙 10,000', reach:'Up to 1,000,000 views', col:'#92400E' },
          ].map(s => `
            <div onclick="document.querySelectorAll('.boost-opt').forEach(x=>x.style.border='1.5px solid #FDE68A');this.style.border='2.5px solid #D97706';window._selectedBoost='${s.stage}';"
              class="boost-opt"
              style="display:flex;justify-content:space-between;align-items:center;
              background:#FFFBEB;border:1.5px solid #FDE68A;border-radius:12px;
              padding:13px 15px;margin-bottom:8px;cursor:pointer;">
              <div>
                <div style="font-size:13.5px;font-weight:700;color:var(--text-main);">${s.stage}</div>
                <div style="font-size:12px;color:#B45309;">${s.coins} · ${s.reach}</div>
              </div>
              <div style="font-size:14px;font-weight:700;color:${s.col};">${s.price}</div>
            </div>`).join('')}
          <div style="display:flex;gap:10px;margin-top:16px;">
            <button onclick="if(!window._selectedBoost){showToast('Please select a stage');return;}showToast(window._selectedBoost+' boost activated!');closeModal();"
              style="flex:1;padding:11px;border-radius:10px;background:linear-gradient(135deg,#92400E,#D97706);color:white;font-size:14px;font-weight:600;cursor:pointer;border:none;">
              <i class="fa-solid fa-rocket" style="margin-right:6px;"></i>Boost Now
            </button>
            <button onclick="closeModal()" style="padding:11px 18px;border-radius:10px;background:var(--gray-100);color:var(--gray-700);font-size:14px;font-weight:600;cursor:pointer;border:1.5px solid var(--gray-200);">Cancel</button>
          </div>`,
      };