/**
 * The four policy documents, lifted verbatim from `showPolicy()` @44353 and
 * `getPolicyDate()` @44343 in the legacy `index.html`.
 *
 * The legacy modal injected these through `innerHTML`; they are stored as HTML
 * strings for the same reason — they are long hand-written documents with
 * headings, emphasis and bullet lists, and they are the app's own static copy,
 * never user input.
 */

export type PolicyKey = 'privacy' | 'terms' | 'data' | 'community';

export const POLICY_ITEMS: { key: PolicyKey; label: string; icon: string }[] = [
  { key: 'privacy', label: 'Privacy Policy', icon: 'fa-shield-alt' },
  { key: 'terms', label: 'Terms & Conditions', icon: 'fa-file-contract' },
  { key: 'data', label: 'Data & Permissions', icon: 'fa-database' },
  { key: 'community', label: 'Community Guidelines', icon: 'fa-users' },
];

/**
 * `getPolicyDate()` — the "last updated" stamp advances one week at a time from
 * 4 June 2026, so a policy always looks freshly reviewed.
 */
export const POLICY_DATE_TOKEN = '__POLICY_DATE__';

export function getPolicyDate(): string {
  const anchor = new Date(2026, 5, 4);
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const periods = Math.floor((now.getTime() - anchor.getTime()) / weekMs);
  const current = new Date(anchor.getTime() + Math.max(0, periods) * weekMs);
  return current.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const POLICIES: Record<PolicyKey, { title: string; content: string }> = {
  privacy: {
    title: "Privacy Policy",
    content: `
                    <h3>Privacy Policy</h3>
                    <p><em>Last updated: __POLICY_DATE__</em></p>
                    <p>At Pose, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Pose application, website, and related services (the "Service").</p>

                    <h4>1. Information We Collect</h4>
                    <p><strong>Personal Data you provide:</strong></p>
                    <p>• Account details: name, username, email address, phone number, password.</p>
                    <p>• Profile information: bio, profile/cover photo, location, gender, age/date of birth, interests.</p>
                    <p>• Business account details: business name, category, and contact information.</p>
                    <p>• Content you create: videos, photos, audio/voice notes, text posts ("Buzz"), comments, stories, music uploads, captions, and hashtags.</p>
                    <p>• Payment & payout data: P-Coin purchases, wallet balance, bank account details, and transaction history (processed via our payment partners).</p>
                    <p><strong>Data collected automatically:</strong></p>
                    <p>• Usage data: content you view, like, comment on, repost, share, or save; features used; watch time; search queries.</p>
                    <p>• Device & technical data: device model, operating system, browser type, IP address, and crash/error logs.</p>
                    <p>• Cookies and similar technologies used to keep you signed in and remember preferences.</p>
                    <p><strong>Data from third parties:</strong> If you sign in with Google, we receive your basic profile information (name, email, profile photo).</p>

                    <h4>2. How We Use Your Information</h4>
                    <p>• Create and manage your account and personalize your profile.</p>
                    <p>• Operate core features: the For You feed, Buzz, Pose streaming channels, Trending, Pose Music, Stories, and the recording studio.</p>
                    <p>• Recommend content and creators you may like.</p>
                    <p>• Process P-Coin purchases, gifts/tips, creator earnings, and withdrawals.</p>
                    <p>• Send notifications (likes, comments, follows, mentions, messages, and updates from Pose).</p>
                    <p>• Detect, prevent, and address fraud, abuse, and violations of our Terms.</p>
                    <p>• Improve and develop new features, and comply with legal obligations.</p>

                    <h4>3. How We Share Your Information</h4>
                    <p>We do <strong>not</strong> sell your personal data. We may share information with:</p>
                    <p>• Service providers — cloud media hosting (Cloudinary), backend & authentication (Firebase/Google), and payment processors, who process data on our behalf.</p>
                    <p>• Other users — your public profile, posts, and interactions are visible according to your privacy settings.</p>
                    <p>• Legal & safety — when required by law, or to protect the rights, safety, and property of Pose, our users, or the public.</p>
                    <p>• Business transfers — in connection with a merger, acquisition, or sale of assets.</p>

                    <h4>4. Data Retention</h4>
                    <p>We keep your information for as long as your account is active or as needed to provide the Service. If you delete your account, we remove or anonymize your personal data within a reasonable period, except where retention is required for legal, tax, fraud-prevention, or accounting purposes.</p>

                    <h4>5. Your Rights</h4>
                    <p>Depending on your location, you may have the right to access, correct, update, download, or delete your information, and to object to or restrict certain processing. To exercise these rights, contact us at poseinfos@gmail.com or use the in-app Settings.</p>

                    <h4>6. Children's Privacy</h4>
                    <p>Pose is not intended for users under 13. We do not knowingly collect data from children below this age. If we learn we have, we will delete it.</p>

                    <h4>7. Security</h4>
                    <p>We use industry-standard safeguards to protect your data. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>

                    <h4>8. International Transfers</h4>
                    <p>Your data may be processed in countries other than your own. We take steps to ensure it remains protected in accordance with this policy.</p>

                    <h4>9. Changes to This Policy</h4>
                    <p>We may update this Privacy Policy from time to time. We will notify you of material changes via the app or email. Continued use after changes means you accept the updated policy.</p>
                    `,
  },
  terms: {
    title: "Terms & Conditions",
    content: `
                    <h3>Terms & Conditions</h3>
                    <p><em>Last updated: __POLICY_DATE__</em></p>
                    <p>Please read these Terms & Conditions ("Terms") carefully before using Pose.</p>

                    <h4>1. Acceptance of Terms</h4>
                    <p>By accessing or using the Service, you accept and agree to be bound by these Terms. If you do not agree, do not use Pose.</p>

                    <h4>2. Eligibility</h4>
                    <p>You must be at least 13 years old (or the age of digital consent in your country) to use Pose. By using the Service, you confirm you meet this requirement.</p>

                    <h4>3. Accounts</h4>
                    <p>• You are responsible for keeping your login credentials and transaction PIN confidential.</p>
                    <p>• You are responsible for all activity under your account.</p>
                    <p>• Provide accurate information and keep it up to date.</p>
                    <p>• We may suspend or terminate accounts that violate these Terms.</p>

                    <h4>4. Use License</h4>
                    <p>Permission is granted to temporarily access and use Pose for personal, non-commercial purposes, except for monetization features expressly offered within the app (creator earnings, music distribution, channel monetization). This is a license, not a transfer of title, and may not be used to copy, redistribute, or resell the Service; reverse engineer it; or use bots/scrapers to access it.</p>

                    <h4>5. User Content</h4>
                    <p>• You retain ownership of content you create and upload.</p>
                    <p>• By posting, you grant Pose a worldwide, non-exclusive, royalty-free license to host, display, reproduce, distribute, and promote your content within the Service.</p>
                    <p>• You are solely responsible for your content and confirm you have the rights to it.</p>
                    <p>• You must not upload content that is illegal, infringing, hateful, harassing, sexually explicit involving minors, or otherwise in breach of our Community Guidelines.</p>

                    <h4>6. Prohibited Conduct</h4>
                    <p>You agree not to violate any law or the rights of others; post spam, scams, or malware; impersonate others; harass or abuse users; circumvent moderation or security features; or manipulate engagement metrics, earnings, or the P-Coin system.</p>

                    <h4>7. Monetization, P-Coin & Payments</h4>
                    <p>• P-Coin is a virtual currency used within Pose for purchases, gifts/tips, and unlocking exclusive content. P-Coin has no cash value outside the Service except as expressly provided.</p>
                    <p>• Creator earnings, royalty splits, and withdrawals are subject to verification, applicable fees, minimum thresholds, and our payout partners' terms.</p>
                    <p>• Withdrawals require valid bank details and may require a transaction PIN and identity verification.</p>
                    <p>• We may withhold or reverse payments related to fraud, chargebacks, or Terms violations.</p>
                    <p>• All purchases are generally non-refundable except where required by law.</p>

                    <h4>8. Intellectual Property</h4>
                    <p>The Pose name, logo, design, and software are owned by Pose and protected by intellectual property laws. You may not use them without our written permission.</p>

                    <h4>9. Copyright (DMCA / Takedowns)</h4>
                    <p>We respect intellectual property rights. If you believe content infringes your copyright, send a notice to poseinfos@gmail.com with a description of the work, the location of the infringing content, your contact details, and a good-faith statement. We will respond to valid notices and may terminate repeat infringers.</p>

                    <h4>10. Disclaimer</h4>
                    <p>The materials and Service are provided on an 'as is' and 'as available' basis. Pose makes no warranties, express or implied, and disclaims all warranties including merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee the Service will be uninterrupted, error-free, or secure.</p>

                    <h4>11. Limitation of Liability</h4>
                    <p>To the maximum extent permitted by law, Pose is not liable for any indirect, incidental, special, consequential, or punitive damages, or loss of data, revenue, or profits, arising from your use of the Service.</p>

                    <h4>12. Termination</h4>
                    <p>We may suspend or terminate your access at any time for violation of these Terms. You may stop using and delete your account at any time.</p>

                    <h4>13. Governing Law</h4>
                    <p>These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict-of-law rules. Disputes shall be resolved in the courts of Nigeria.</p>

                    <h4>14. Changes to Terms</h4>
                    <p>We may update these Terms. Material changes will be notified in-app or by email. Continued use means you accept the updated Terms.</p>
                    `,
  },
  data: {
    title: "Data & Permissions",
    content: `
                    <h3>Data & Permissions</h3>
                    <p>Pose requires certain device permissions to function properly. You can grant or revoke these at any time in your device settings.</p>

                    <h4>Permissions We Request</h4>
                    <p>• Camera: to record and share videos and take photos.</p>
                    <p>• Microphone: to capture audio with your videos and record voice notes/voice-overs.</p>
                    <p>• Gallery/Photos: to upload images and videos from your device.</p>
                    <p>• Location (optional): to tag your content's location.</p>
                    <p>• Notifications: to alert you about likes, comments, follows, messages, and updates.</p>
                    <p>• Storage: to save drafts, downloads, and captured photos.</p>

                    <h4>Data We Collect</h4>
                    <p>We collect usage data to improve the app experience, including:</p>
                    <p>• Your interactions with content</p>
                    <p>• The features you use most</p>
                    <p>• Watch time and engagement metrics</p>
                    <p>• Crash reports and error logs</p>

                    <h4>Your Rights & Controls</h4>
                    <p>• Revoke any permission at any time via your device settings.</p>
                    <p>• Request to download a copy of your data.</p>
                    <p>• Request permanent deletion of your account and data.</p>
                    <p>• Manage privacy controls in Settings → Privacy & Security (private account, who can message you, blocked accounts, profile visibility).</p>
                    `,
  },
  community: {
    title: "Community Guidelines",
    content: `
                    <h3>Community Guidelines</h3>
                    <p>To keep Pose safe, all users must follow these guidelines. Content that violates them may be removed, and accounts may be restricted or banned.</p>

                    <h4>Not Allowed</h4>
                    <p>• Hate speech, harassment, bullying, or threats.</p>
                    <p>• Violent, graphic, or dangerous content.</p>
                    <p>• Sexual content involving minors (zero tolerance — reported to authorities).</p>
                    <p>• Nudity or sexually explicit content outside permitted contexts.</p>
                    <p>• Spam, scams, fraud, or misleading information.</p>
                    <p>• Impersonation of others.</p>
                    <p>• Copyright or trademark infringement.</p>
                    <p>• Promotion of illegal goods, services, or activities.</p>

                    <h4>Reporting</h4>
                    <p>You can report content or accounts in-app. Report reasons include copyright infringement, harassment or bullying, hate speech, spam, nudity or sexual content, violence, impersonation, and "other." Our moderation team reviews reports and takes appropriate action, including content removal, warnings, and account suspension or termination.</p>

                    <h4>Enforcement & Appeals</h4>
                    <p>• First or minor violations may result in content removal or a warning.</p>
                    <p>• Repeat or severe violations may result in permanent account termination.</p>
                    <p>• If you believe action was taken in error, you may appeal via Settings → Help & Support.</p>
                    `,
  },
};
