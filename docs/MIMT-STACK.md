# MIMT: cost-efficient stack

Prepared: **2026-10-09** by the MIMT agent (agent 2). All prices were read on public pricing pages on 2026-10-09. **Nothing has been bought or signed up for.**

- Exchange rate assumed: **1 USD = 1.39 CAD**. Twilio, Plivo, Apple, Google, Supabase, Expo and Sentry bill in USD. A card in CAD usually adds about 2.5% in foreign-exchange fees.
- Prices are before GST/QST.
- **[VERIFY]** marks a figure that could not be confirmed on the official page.

Companion docs: [MIMT-REGULATORY.md](MIMT-REGULATORY.md) · [MIMT-MVP.md](MIMT-MVP.md)

## 1. Stack table

| Service | Why it's needed | Monthly cost estimate (CAD) | Cheaper alternative |
| --- | --- | --- | --- |
| **Twilio Programmable Voice** | Calls between the app and the phone network | Outbound CA/US US$0.014/min (C$0.0195). Inbound local US$0.0085/min (C$0.0118). Voice SDK leg US$0.004/min (C$0.0056) added to every app call. Recording US$0.0025/min. Transcription US$0.05/min, or Conversation Intelligence US$0.024/min. Source: twilio.com/en-us/voice/pricing/ca | **Plivo**: out US$0.012, in US$0.0075, SDK US$0.0033, free recording. **SignalWire**: out US$0.008, in US$0.0066, WebRTC US$0.003 (currency not stated). **Telnyx**: from US$0.005 out (Canada-specific rate **[VERIFY]**). |
| **Twilio Numbers** | One Canadian number per user | Local US$1.15/mo (**C$1.60**). Toll-free US$2.15/mo (C$2.99). | Plivo US$0.75 (C$1.04). SignalWire US$0.50. VoIP.ms US$0.85–1.10. Telnyx US$1.00. |
| **Twilio Programmable Messaging** | SMS/MMS to and from the number | SMS US$0.0083 per segment in or out. Outbound carrier fee about US$0.0067–0.0087 (Bell, Rogers, Telus, Vidéotron) **[VERIFY CSV]**. Outbound SMS ≈ **C$0.023**. MMS out US$0.022 plus carrier fee. Source: twilio.com/en-us/sms/pricing/ca | Plivo US$0.0077 plus carrier fee. SignalWire US$0.00415 plus carrier fee. |
| **SMS rules in Canada** | Deliverability | **10DLC is a US-only system and does not apply in Canada.** Person-to-person SMS on local numbers needs no registration. **Toll-free numbers must be verified** before sending any SMS (free; TrustHub profile). Canadian short code: US$1,000 per quarter, 12–16 weeks to get. | Use local numbers for person-to-person messages. Toll-free (verified) only for business notifications. |
| **Voice SDK (in-app calling)** | Calls inside the iOS/Android app, with CallKit / ConnectionService | Included in the SDK leg price above. The official React Native SDK supports Expo since v1.8.0 (development build required). | Plivo and Telnyx SDKs are cheaper, but their React Native support is less mature. |
| **9-1-1 (nomadic VoIP)** | Required by the CRTC | **Twilio Emergency Calling:** US$0.75/number/mo (**C$1.04**) for numbers with a validated address. **A 9-1-1 call from a number without an address costs US$75.** **[VERIFY with Twilio]** whether app-originated (Voice SDK) 9-1-1 meets the CRTC nomadic rules and uses an NG9-1-1-ready call centre. | Telnyx Dynamic E911, US/Canada, with GPS: US$1.50/number. VoIP.ms: US$1.50/DID plus US$1.50 setup. **Northern 911** and Bell VoIP 9-1-1 sell to carriers only, quote only. Bandwidth: quote only. |
| **Quebec municipal 9-1-1 tax** | Required by law; collected from customers | C$0.55/number/mo in 2026 (C$0.57 announced for 2027 **[VERIFY]**). Passed through to paying customers. | Whether it applies to free numbers is an open question for the lawyer. |
| **Number porting** | Customers bring their existing numbers (vital for business) | Twilio supports Canadian port-in (LOA, recent bill, the carrier's approval SMS). Takes up to 4 weeks. One-time fee for Canada **[VERIFY]**. | VoIP.ms and Telnyx also port in Canada. |
| **Apple Developer Program** | Publishing on iOS; VoIP push certificate; CallKit | US$99/yr (≈ C$138/yr, **C$11.50/mo**). Exact CAD price **[VERIFY]**. Small Business Program: 15% commission. | None. Enrol as an organisation (D-U-N-S number, free). |
| **Google Play Console** | Publishing on Android | US$25 once (≈ C$35). 15% commission on subscriptions. | None. |
| **Ads: Google AdMob + UMP consent + Apple ATT** | Revenue from the free tier | Free; Google takes a revenue share. Canadian eCPM benchmarks (multi-network, directional only): interstitial about US$7–9, banner about US$2, rewarded video higher. Personalised ads need consent (Law 25) and the ATT prompt on iOS. | AppLovin MAX or Unity for mediation later. Start with AdMob only. |
| **Push and calls: APNs, PushKit, FCM, CallKit, ConnectionService** | Incoming-call ringing when the app is closed | **0 $** | n/a |
| **Expo EAS** | Cloud builds and store submissions | Free tier: 15 iOS + 15 Android builds per month. **0 $** at the start. Starter US$19/mo if needed. | Local builds on a Mac (free). |
| **Stripe** (Billing + Tax) | Web subscriptions (business plans, credits) | 2.9% + C$0.30 per card payment, plus 0.7% Billing, plus 0.5% Tax. **No fixed fee.** | Apple/Google billing in the app (15%). Stripe Tax can be skipped at first: GST/QST are fixed rates for Quebec customers. |
| **Hosting: MIMT API on the existing Coolify / MochaHost** | API, webhooks, workers | **0 $ extra** if the server has room. Otherwise a small VPS at about C$7–15/mo. | Coolify Cloud US$5/mo to manage your own servers. |
| **Database: Supabase** (separate MIMT project) | Accounts, numbers, call/message logs, voicemail storage | Free during development. **Pro US$25/mo (≈ C$35)** at beta (backups, no pausing). | Postgres self-hosted on Coolify: 0 $, but you handle backups yourself. |
| **Monitoring** | Errors, uptime, fraud alerts | Sentry Developer (free), Better Stack free (10 monitors), Twilio usage triggers (free). **0 $** | Grafana Cloud free tier. |
| **Fraud tools** | Toll fraud and SMS pumping | Twilio Voice and Messaging geo-permissions: free. SMS pumping protection (US/Canada): free. Verify US$0.05 per success, includes Fraud Guard. | Supabase Phone Auth, already used by TAKATAK. |
| **Business PBX** (phase 2) | Auto-attendant, ring groups, extensions, recording | See §4 | See §4 |
| **CCTS** | Mandatory | Small annual fee plus a fee per complaint. Amount not published **[VERIFY]**. Budget about C$10/mo. | None (mandatory). |
| **CRTC registration, BITS licence** | Mandatory | Free | n/a |

**Calls to Cuba:** Twilio's outbound price list has **no Cuba destination**. If international calling to Cuba matters (CCC / Havana projects), a second carrier is needed for that route; quotes from Telnyx, VoIP.ms or a wholesale carrier would be needed **[VERIFY]**. Twilio examples: France landline US$0.0187, France mobile US$0.16 (rate for calls from outside Europe), Mexico landline US$0.016, Mexico mobile US$0.047, Haiti US$0.65–0.88.

## 2. Unit cost per user (Twilio prices, CAD)

| Cost item | Free user (caps in MVP §6) | Premium user (typical) |
| --- | --- | --- |
| Number | 1.60 | 1.60 |
| 9-1-1 (Twilio) | 1.04 | 1.04 |
| Outbound calls via app (C$0.0251/min = PSTN + SDK) | 30 min → 0.75 | 150 min → 3.77 |
| Inbound calls via app (C$0.0174/min) | 60 min → 1.04 | 150 min → 2.61 |
| SMS (≈ C$0.023 out, C$0.0115 in) | 50 out + 50 in → 1.73 | 200 + 200 → 6.90 |
| Voicemail transcription | — | 10 min → 0.33 |
| **Total cost per month** | **≈ C$6.16** | **≈ C$16.25** |

At the full Premium caps (500 min out, 500 SMS out, 1,000 min in) the cost rises to about C$45. Few users reach the caps, but some will, so caps and overage packs are needed.

Business line (500 min out + 500 min in, no SMS): about C$24/month.

**What this means:**

1. **A Twilio-only free tier with generous minutes loses money.** One free user costs about C$6/mo. Ads bring in roughly C$1–3 per active user per month in Canada (directional benchmarks). TextNow and Fongo survive on their own carrier networks and wholesale rates. MIMT does not have those at the start.
2. **Smart path:** launch phase 1 with **paid plans first** (number lock, Premium, Business). Keep the free tier as a **limited, earned tier**:
   - 30 outbound minutes per month;
   - 50 SMS per month;
   - more minutes earned by watching rewarded ads;
   - numbers reclaimed after 30 days without activity.

   Open it widely only once real ad revenue per user is measured.
3. **Price on what usage really costs.** At Twilio retail rates a typical Premium user costs about C$16/month, so TextNow-style prices (about 10 $) would lose money. I recommend:
   - **Premium 19.99 $/mo**: 500 outbound min and 500 SMS in Canada/US, plus overage packs;
   - unlimited calls and texts between MIMT apps (these cost only the SDK legs);
   - **Affaires 34.99 $/line**.

   Sell on the web (Stripe, ≈ 3–4% fees) where the store rules allow it, instead of in-app (15%).
4. **Biggest saving later:** move numbers and phone-network minutes from Twilio to a cheaper carrier (SignalWire, Telnyx or Plivo), using Twilio "bring your own carrier" or a SIP trunk. Numbers would cost 35–55% less and minutes 40–60% less. Do it once volume justifies the migration work (around 500+ paying users), not before.

## 3. Phase-1 minimum budget

**One-time, before launch**

| Item | Cost (CAD) |
| --- | --- |
| Apple Developer (1 year) | ≈ 138 |
| Google Play | ≈ 35 |
| Telecom lawyer review: the regulatory brief, terms, privacy policy, 9-1-1 notice (estimate; get 2 quotes) | 3,000 – 8,000 |
| CRTC registration, CCTS enrolment, Revenu Québec registrations | 0 (plus your time) |
| **Total one-time** | **≈ 3,200 – 8,200** |

**Monthly, during development** (2 test numbers)

| Item | Cost (CAD) |
| --- | --- |
| Twilio: 2 numbers + 9-1-1 + test usage | ≈ 30 |
| Supabase (free during dev) | 0 |
| Hosting on existing Coolify, EAS free, Sentry free, Better Stack free | 0 |
| **Total** | **≈ 30/mo** |

**Monthly, closed beta** (100 users, mostly free tier with caps)

| Item | Cost (CAD) |
| --- | --- |
| Twilio usage (100 × ≈ C$6) | ≈ 600 |
| Supabase Pro | ≈ 35 |
| CCTS (estimate) | ≈ 10 |
| **Total** | **≈ 650/mo** |

Cap the beta at 100 users and set a Twilio usage trigger at C$25/day.

**Spending order:**
1. Lawyer quote.
2. Apple and Google accounts, only when the app is ready to test on real phones.
3. Twilio upgrade (if still a trial), with a usage trigger.
4. Supabase Pro at beta.

## 4. Business PBX (phase 2): build on Twilio vs white-label

| Option | Cost | Time to market | Pros | Cons |
| --- | --- | --- | --- | --- |
| **A. Build on Twilio Programmable Voice** (TwiML/Studio IVR, `<Dial>` ring groups, Conference transfers, Recording) | No per-seat fee; usage only. Cost per line ≈ C$2.64 (number + 9-1-1) plus usage. A 500-min-out / 500-min-in line ≈ C$24. | 10–12 weeks **after** phase 1 (reuses its numbers, SDK, voicemail and billing) | Fully branded MIMT; one app for consumers and businesses; admin in the TAKATAK ecosystem; full control of margins | Engineering effort; desk phones need SIP work; you carry support |
| **B. Twilio Flex** | US$35 per active user per month (or US$150 per named user under contract), plus usage | 4–8 weeks | Contact-centre grade | Too expensive for small businesses; overkill |
| **C. 3CX** (hosted, on your own SIP trunk) | ≈ US$295–350 per year **per system** (licensed by simultaneous calls, not per user) **[VERIFY: price, and whether a free edition still exists]** | 1–3 weeks per customer | Cheap, mature, desk phones and apps included | 3CX branding, not MIMT; one system per customer to run; mixed vendor |
| **D. VoIP.ms cloud PBX** | Features included with numbers (≈ US$0.85–1.10 per number plus minutes) | Days | Cheapest; Canadian | Not white-label; not mobile-first; weak business story |
| **E. White-label platform** (NetSapiens/Crexendo, SkySwitch, Intermedia, Wazo hosted) | Quote only; usually a wholesale price per seat plus minimums. Resellers cite 50–70% margins. | 2–6 weeks | MIMT brand on a proven platform, with desk phones and apps | Minimum commitments; little control; a second vendor to pay |

**Recommendation:**

- Use **A, building on Twilio**, because phase 1 already builds most of the pieces.
- Price **Affaires at 34.99 $/line/mo**, with 1,000 pooled outbound minutes per line. A typical line costs about C$24, which leaves about C$10 of margin. **Affaires Pro at 44.99 $** adds recording and transcription.
- Rogers Unison sits in the same price range **[VERIFY]**.
- If a business customer wants desk phones **before** phase 2 is ready, serve that one customer with **C (3CX)** on a Twilio Elastic SIP Trunk, at no fixed cost to MIMT beyond that customer's licence.
- Do not sign a white-label minimum commitment yet.

## 5. Twilio account: what to check (not verified from here)

The TAKATAK code uses Twilio only for Verify OTP and outbound SMS (see MVP §0), and phone login has moved to Supabase Phone Auth. In console.twilio.com, the owner checks:

1. The account is upgraded (not a trial), and the card on file is the one intended.
2. **Voice geo permissions:** Canada and US only.
3. **Messaging geo permissions:** Canada and US only.
4. **SMS pumping protection** is on.
5. **A usage trigger** (daily, e.g. C$25) emails the owner.
6. Whether a regulatory bundle or address is needed for Canadian local numbers **[VERIFY]**.
7. **Create a separate MIMT subaccount.** Do not reuse TAKATAK's OTP credentials. Create an API key for it, and put it in the cloud environment's secrets, never in chat.
