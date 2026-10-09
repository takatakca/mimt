# MIMT: regulatory research brief (Canada / Quebec)

Prepared: **2026-10-09** by the MIMT agent (agent 2). Sources: official pages (crtc.gc.ca, laws-lois.justice.gc.ca, legisquebec.gouv.qc.ca, cai.gouv.qc.ca, oqlf.gouv.qc.ca, ccts-cprst.ca, canada.ca, revenuquebec.ca, ised-isde.canada.ca, cnac.ca), consulted 2026-10-09.

> **This is research, not legal advice.** It is a map of the rules to put in front of a Canadian telecom lawyer and an accountant. Nothing here replaces their opinion. Items marked **[VERIFY]** were only partly confirmed (several CRTC pages blocked automated full-text reading, so some points rely on the official page summary). Items marked **[LAWYER]** need a legal opinion before launch.

Companion docs: [MIMT.md](MIMT.md) · [MIMT-STACK.md](MIMT-STACK.md) · [MIMT-MVP.md](MIMT-MVP.md)

## Summary: what applies to MIMT phase 1 (app with Canadian numbers, calls to/from the PSTN, SMS)

| Obligation | Applies? | When | Cost |
| --- | --- | --- | --- |
| CRTC reseller registration | **Yes** | Before selling service | Free |
| Nomadic VoIP 9-1-1 (third-party call centre) + customer notice and acknowledgement | **Yes** | Before launch | Provider fee per number (see STACK) |
| NG9-1-1 readiness | Yes, through providers | Legacy 9-1-1 decommissioned **31 Mar 2027** | Via provider |
| CCTS participation | **Yes** | Join at launch (mandatory) | Small annual + per-complaint fees |
| BITS licence (international) | Probably, if international calling is sold **[LAWYER]** | Before selling international | Free, notarized affidavit |
| CASL | Yes, for MIMT's own marketing SMS/emails | Always | Compliance work |
| STIR/SHAKEN, call blocking, traceback | Yes, mostly met through upstream provider **[LAWYER]** | Now | Via provider |
| Customer confidentiality rules (CRTC) | **Yes** | Always | Compliance work |
| PIPEDA + Quebec Law 25 | **Yes** | Before collecting data | PIA work |
| Charter of the French language (Bill 96) | **Yes** | Always | Translation |
| Accessibility (CRTC reporting regs) | Yes, small-company class | Attestation | Low |
| GST/QST + **Quebec 9-1-1 municipal tax** | Yes | From first paid sale / above threshold | Collected from customers |
| Contribution regime / CRTC telecom fees | **No** (below revenue threshold) | Re-check when revenue grows | 0 |
| Wireless Code | Only if mobile service is sold (phase 3) | Later | — |
| Internet Code | Large ISPs only today **[VERIFY]** | Later | — |

## 1. CRTC registration (reseller / non-carrier)

- **Who:** any non-carrier (reseller) that provides telecom services must register with the CRTC before obtaining services from a Canadian carrier for resale. Local VoIP, long distance, wireless and internet resale are all covered. — Telecom Regulatory Policy CRTC **2017-11** (17 Jan 2017) and 2017-11-1. https://crtc.gc.ca/eng/archive/2017/2017-11.htm · registration: https://crtc.gc.ca/eng/comm/telecom/registr2.htm
- **VoIP specifically:** local VoIP providers that are not carriers must register as resellers. — Telecom Decision CRTC **2005-28**. https://crtc.gc.ca/eng/archive/2005/dt2005-28.htm
- **No exemption fits MIMT:** the exemptions (no explicit charge, temporary on-premises service, or no ability to make two-way calls / reach the internet) do not cover an app that makes and receives PSTN calls. — TRP CRTC **2019-354**. https://crtc.gc.ca/eng/archive/2019/2019-354.htm
- **Ongoing duties for non-facilities-based providers:** 9-1-1, BITS licence if international traffic, annual Data Collection System (DCS) filings, keep registration current. https://crtc.gc.ca/eng/comm/telecom/respnon.htm
- **"Non-dominant":** resellers are not tariffed; no separate "non-dominant" filing was found. **[VERIFY]**
- **Contribution regime and telecom fees:** apply only above a revenue threshold ($10M of Canadian telecom revenue historically; Telecom Decision CRTC **2026-32** raises it to **$25M**, regulatory amendment expected in force 1 Jan 2027 **[VERIFY]**). Below it MIMT pays neither, but still files DCS data. https://www.crtc.gc.ca/eng/archive/2026/2026-32.htm · https://laws-lois.justice.gc.ca/eng/regulations/SOR-2010-65/FullText.html
- **BITS licence (Basic International Telecommunications Services):** required to carry traffic between Canada and another country (Telecommunications Act s. 16.1; Telecom Decision 2008-70). Form 503 + notarized affidavit, up to 10 years, changes reported within 30 days. The CRTC actively revokes non-compliant licences (Telecom Decision **2025-160**). https://crtc.gc.ca/eng/comm/telecom/international.htm **[LAWYER]** whether MIMT needs its own BITS licence when international calls are carried by a licensed upstream (Twilio's Canadian entity). Practical answer: apply anyway before selling international (it is free).

## 2. VoIP local service rules

- **Classification:** Telecom Decision CRTC **2005-21** defines fixed/native, fixed/non-native and **nomadic** VoIP. An app usable anywhere with a Canadian number is **nomadic**. https://crtc.gc.ca/eng/archive/2005/dt2005-21.htm
- **Non-carriers are bound directly** by all 9-1-1 obligations for local VoIP — TRP CRTC **2016-12**. https://crtc.gc.ca/eng/archive/2016/2016-12.htm
- **One-way services:** no source found that exempts outbound-only or inbound-only apps. The CRTC consumer page says VoIP providers must give access to 9-1-1. https://crtc.gc.ca/eng/phone/911/can.htm **[LAWYER]** confirm that MIMT (two-way, Canadian number) is "local VoIP" — assume yes.
- **Number portability:** VoIP providers **must port numbers out** on request; porting in is optional — Telecom Decision **2008-11**. https://crtc.gc.ca/eng/archive/2008/dt2008-11.htm
- **Relay services (accessibility):** TTY relay and IP Relay obligations were extended to VoIP providers (Broadcasting and Telecom Regulatory Policy **2009-430**); may be outsourced; subscribers must be told about 9-1-1 limits via IP Relay at signup and yearly. Video relay is funded by the national contribution fund (no cost below threshold). https://crtc.gc.ca/eng/archive/2009/2009-430.htm **[VERIFY]** current scope for resellers (see TRP 2018-466).

## 3. 9-1-1, NG9-1-1 and customer notice

- **Nomadic VoIP 9-1-1:** calls go to a **third-party emergency call centre** that confirms the caller's location and transfers to the right PSAP (Decision 2005-21). MIMT must collect and keep a **registered civic address** per number and let the user update it.
- **Customer notification and acceptance** (Decisions **2005-21**, **2005-61**; confirmed for nomadic in **2011-619**):
  - inform customers of 9-1-1 limitations **before** sign-up and throughout the service: marketing material, terms of service, website, customer service, billing inserts, alternative formats on request; warning labels for devices;
  - obtain the customer's **express acknowledgement** of the limitations (MIMT: blocking screen at onboarding, versioned, stored in `e911_acknowledgements`);
  - minimum notice content is set by the Emergency Services Working Group report adopted in 2005-61.
  - https://crtc.gc.ca/eng/phone/911/voip.htm · https://crtc.gc.ca/eng/archive/2011/2011-619.htm
- **NG9-1-1:** framework TRP **2017-182**; originating providers to support NG9-1-1 Voice (Decision **2021-199**); legacy E9-1-1 decommissioning and NG9-1-1 readiness deadline moved to **31 March 2027** (Decision **2025-67**, upheld by **2025-291**). https://crtc.gc.ca/eng/archive/2025/2025-67.htm · https://crtc.gc.ca/eng/phone/911/gen.htm **[VERIFY]** no later change before launch. **[LAWYER]** confirm that using an NG9-1-1-capable third-party call centre/provider fully meets MIMT's duty.
- **Text / RTT to 9-1-1:** real-time text for NG9-1-1 not yet scheduled for the public; text-to-9-1-1 is a wireless-carrier service. No RTT duty found for OTT VoIP apps **[VERIFY]**.
- **If MIMT later sells mobile:** wireless handset-based location (Decisions **2023-235**, 2023-339) applies to facilities-based providers; through an MVNO host.
- **Product rule for MIMT:** no outbound PSTN calling until a 9-1-1 address is registered **and** the notice is accepted; 9-1-1 always allowed, never blocked by caps, credit or plan.

## 4. CCTS (mandatory)

- Participation in the **Commission for Complaints for Telecom-television Services** is mandatory for all telecom service providers, resellers included (Broadcasting and Telecom Regulatory Policy **2016-102**). Join at launch rather than waiting for a first complaint. https://www.ccts-cprst.ca/about-ccts/governance/regulatory-and-corporate-history/
- **Fees:** small providers pay a modest annual fee plus per-complaint fees. Old published figures: $100/yr and ~$121–$303 per complaint stage **[VERIFY current]**; CRTC is reviewing the model (Notice 2026-31). https://www.ccts-cprst.ca/about-ccts/governance/structure-and-funding/
- **Customer awareness duties:** CCTS info on a complaints page ≤ 2 clicks from home page, on bills at least 4 times a year (prepaid: another channel), and when a complaint is escalated. https://www.ccts-cprst.ca/industry/public-awareness/

## 5. CASL, telemarketing, caller ID

- **CASL (anti-spam):** commercial SMS and emails need express or implied consent, sender identification, and a free unsubscribe honoured within **10 business days**. Penalties up to $10M per violation for organizations. https://crtc.gc.ca/eng/com500/faq500.htm · https://ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email
  - MIMT applies it to its own marketing (store consent in `consents`). In-app ads are not CEMs sent to an address but still need privacy consent (Law 25).
  - **[LAWYER]** MIMT's exposure for spam that users send through the platform (CASL intermediary provisions).
- **Unsolicited Telecommunications Rules / National DNCL:** only if MIMT does telemarketing calls; automated dialing-announcing devices need express consent. https://www.crtc.gc.ca/eng/trules-reglest.htm
- **STIR/SHAKEN:** providers must authenticate/verify IP calls (Decision **2021-123**); providers whose numbers come from a number provider often cannot sign themselves (**2021-267**); annual reporting (**2025-343**). https://crtc.gc.ca/eng/archive/2021/2021-123.htm
- **Call blocking:** block calls with malformed caller ID (CETRP **2018-484**). **Traceback:** all voice providers participate since 25 Jun 2026 (Decision **2026-52**). https://crtc.gc.ca/eng/archive/2026/2026-52.htm
- **[LAWYER]** how far Twilio (or the CLEC partner) satisfies STIR/SHAKEN, traceback and port-out on MIMT's behalf, and what MIMT must contract for.

## 6. Privacy: PIPEDA, Quebec Law 25, CRTC confidentiality

- **PIPEDA:** report breaches with a real risk of significant harm to the federal Privacy Commissioner and affected people; keep a breach record. https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches-and-safeguards/privacy-breaches-at-your-business/gd_pb_201810/
- **Quebec Law 25** (Act respecting the protection of personal information in the private sector, P-39.1):
  - **Person in charge of personal information** (default: the CEO; can be delegated in writing); title and contact on the website.
  - **Privacy impact assessment (PIA) + written agreement before communicating data outside Quebec** (s. 17): applies to Twilio, Stripe, Google/AdMob, Apple, Supabase, etc.
  - **Confidentiality incidents:** notify the CAI and affected people when there is a risk of serious injury; keep an incident register.
  - Consent must be specific, in clear terms, separate for each purpose; privacy-by-default settings (ads personalization **off** by default); **data portability** in force since 22 Sep 2024.
  - Penalties up to $10M or 2% of worldwide turnover.
  - https://www.legisquebec.gouv.qc.ca/fr/document/lc/p-39.1 · https://www.cai.gouv.qc.ca/protection-renseignements-personnels/sujets-et-domaines-dinteret/principaux-changements-loi-25
- **CRTC customer confidentiality rules:** no disclosure of confidential customer information without express consent (listed exceptions); apply directly to resellers via 2017-11. https://crtc.gc.ca/eng/archive/2009/2009-723.htm
- **Lawful access:** Bill **C-22** (Lawful Access Act, 2026) would require designated electronic service providers to build lawful-access capabilities; passed the House 18 Jun 2026, Senate stage unclear **[VERIFY]**. https://www.parl.ca/legisinfo/en/bill/45-1/c-22
- **Call recording (phase 2):** both-party notification prompt ("cet appel peut être enregistré") and retention policy; **[LAWYER]** confirm wording.

## 7. Numbers: assignment and portability

- **Assignment:** the Canadian Numbering Administrator assigns central office codes only to eligible carriers (LECs/CLECs). **MIMT will get numbers from a carrier, CLEC or number provider (Twilio, Telnyx, VoIP.ms, etc.)**, not from the CNA. https://cnac.ca/about/mandate.htm
- **Scarcity:** CO code assignments are capped (see 2025-224); **thousand-block pooling** rolls out 28 Jul 2026 – 29 Jul 2027 (TRP **2024-26**, Decisions **2025-321**, **2026-167**). Practical effect: local numbers in 514/438/450/579 may be less available; reserve inventory carefully. https://crtc.gc.ca/eng/archive/2026/2026-167.htm
- **Porting timelines:** wireline and wireline-wireless ports: 2 business days (Decision **2005-72**); simple wireless: 2.5 business hours. VoIP must port out (2008-11).
- **Twilio:** supports porting Canadian local and toll-free numbers in (letter of authorization, recent bill, Canadian service address); timing 5 business days to several weeks. https://www.twilio.com/en-us/guidelines/ca/porting
- **Number recycling:** follow the aging rules of the number provider and industry guidelines; MIMT policy is a 90-day quarantine (see MVP §7). **[LAWYER/partner]** confirm minimum aging.

## 8. French language (Charter of the French language, as amended by Bill 96)

- **Software and apps:** must be available in French, on terms at least as favourable as any other language (s. 52.1). https://www.legisquebec.gouv.qc.ca/fr/version/lc/C-11?code=se%3A52_1
- **Websites, catalogues, invoices, customer service:** in French; customers have the right to be informed and served in French. https://www.oqlf.gouv.qc.ca/francisation/droits_linguistiques/droits/langue-du-commerce-et-des-affaires.html
- **Contracts of adhesion** (app terms, plans): French version given **first**; another language only at the customer's express choice after that (since 1 Jun 2023). https://www.oqlf.gouv.qc.ca/francisation/entreprises/Contrats-adhesion.pdf
- **Trademarks and signage** (since 1 Jun 2025): a non-French trademark can stay only if registered and no French version is registered; generic/descriptive words in French ("Appels", "Messagerie vocale"). "MIMT" is an acronym; tagline and plan names in French. https://www.oqlf.gouv.qc.ca/francisation/entreprises/affichage-marques-noms.html
- **Product rule for MIMT:** `fr-CA` default locale, French store listings first, French terms/privacy/9-1-1 notice first, French voicemail greetings and IVR prompts by default, French support.
- Francization registration with the OQLF only from 25 employees.

## 9. Consumer codes (later phases)

- **Wireless Code** (TRP **2013-271**, revised **2017-200**): applies to mobile resellers and MVNOs; contract summaries, cancellation without fees after 24 months max, bill-shock caps, unlocked devices, trial period. Applies **if MIMT ever sells mobile service** (phase 3). https://crtc.gc.ca/eng/archive/2017/2017-200.htm
- **Internet Code** (TRP **2019-269**): today applies to large facilities-based ISPs; amendments TRP 2026-238 (effective 10 Mar 2027) and a harmonization proceeding (2026-134) may extend it **[VERIFY]**. Plan for compliance anyway in phase 3. https://crtc.gc.ca/eng/archive/2019/2019-269.htm
- **Quebec Consumer Protection Act** also applies to distance contracts and telecom contracts with consumers in Quebec (cancellation, contract content). **[LAWYER]** check plan terms against it.

## 10. Accessibility

- **Federal:** CRTC Accessibility Reporting Regulations (SOR/2021-160, Accessible Canada Act). Providers with fewer than 10 employees fall in the small class and file an attestation rather than full plans **[VERIFY class and deadline]**. https://laws-lois.justice.gc.ca/eng/regulations/SOR-2021-160/FullText.html · https://crtc.gc.ca/eng/industr/acces/
- **Quebec:** no private-sector plan obligation (E-20.1 targets public bodies); Quebec Charter of human rights s. 10 (non-discrimination) applies.
- **Product rule:** WCAG 2.1 AA in app and web, screen-reader labels, large text, TTY/IP Relay info, voicemail transcription as an accessibility aid.

## 11. Taxes

- **GST/QST registration:** mandatory above **$30,000** of taxable supplies in a calendar quarter or four consecutive quarters (ad revenue counts). Register voluntarily from day one to recover input tax credits on Twilio, Apple, etc. https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/2-2/small-suppliers.html · https://www.revenuquebec.ca/en/citizens/consumption-taxes/taxable-zero-rated-or-tax-exempt-goods-and-services/gst-and-qst/other-situations/details-concerning-small-suppliers/
- **Place of supply for telecom:** special GST/HST rules (GST/HST Memorandum 3-3-6-1) based on where facilities are ordinarily located / billing location. **[ACCOUNTANT]** how to tax nomadic numbers used outside Quebec, and QST equivalent. https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/3-3-6-1/plc-spply-prvnc-prsnl-srvcs-srvcs-rltn-prprty-nd-tlcmmnctn-srvcs.html
- **Quebec municipal 9-1-1 tax:** **$0.55 per month per number in 2026** (announced $0.57 for 2027 **[VERIFY]**), on services that can call 9-1-1 to a Quebec centre with a Quebec area-code number; register with Revenu Québec before collecting, remit with QST returns; GST/QST apply on top. Technology-neutral wording suggests VoIP is covered **[VERIFY]**. https://www.revenuquebec.ca/en/businesses/consumption-taxes/municipal-tax-for-9-1-1-service/collecting-the-municipal-tax-for-9-1-1-service/
  - **[LAWYER/ACCOUNTANT]** does it apply to **free-tier** numbers (no bill to add it to)? This affects free-tier cost.
- Apple and Google collect and remit GST/QST on in-app purchases in Canada; Stripe sales are MIMT's to collect.

## 12. Vidéotron: wholesale internet and MVNO (phase 3, planning only)

- **Mandated MVNO access** (TRP **2021-130**) is only for **facilities-based regional carriers** with spectrum and their own network; hosts are Bell, Rogers, TELUS, SaskTel. **Vidéotron is a beneficiary of that regime, not a host**, and **TAKATAK would not qualify** for mandated access. Any mobile deal with Vidéotron/Freedom is therefore a **commercial** agreement (branded reseller or "light" MVNO). https://crtc.gc.ca/eng/archive/2021/2021-130.htm · https://crtc.gc.ca/eng/comm/telecom/respmobvir.htm
- **Internet resale:** Vidéotron cable third-party internet access (TPIA) tariffs remain available to registered resellers; aggregated fibre access on Bell and TELUS in Quebec/Ontario (TRP **2024-180**, final rates Telecom Order **2026-77**). https://crtc.gc.ca/eng/archive/2024/2024-180.htm · https://crtc.gc.ca/eng/archive/2026/2026-77.htm
- **What a deal would require of TAKATAK/MIMT:** CRTC reseller registration (already from phase 1), CCTS, Wireless Code (mobile) and Internet Code readiness, credit check/deposit or letter of credit, minimum volume commitments, interconnection (layer 2/3 at wholesale points of interconnection) or a reseller portal/API, provisioning/billing integration, customer support and collections, SIM/eSIM logistics, 9-1-1 and lawful-access cooperation, brand rules.
- Ask Vidéotron for: product (TPIA vs commercial reseller), technical interface, minimums, deposit, rates, term, exclusivity, and who handles 9-1-1/porting for mobile.

## What a telecom lawyer must confirm (checklist)

1. MIMT is "local VoIP" (nomadic) under PN 2004-2 / 2005-21, including the free tier.
2. 9-1-1: that the chosen third-party call centre/provider satisfies nomadic 9-1-1 and NG9-1-1 (31 Mar 2027); exact notice and acknowledgement wording (FR/EN).
3. BITS licence needed or not when international is carried by Twilio.
4. Which of STIR/SHAKEN, traceback, port-out and call-blocking duties MIMT meets itself vs through Twilio/CLEC; contract clauses needed.
5. Terms of service, privacy policy and plan contracts vs Quebec Consumer Protection Act, Bill 96 and CRTC confidentiality rules.
6. CASL intermediary exposure for user-sent SMS.
7. Law 25 PIAs and transfer agreements for Twilio, Stripe, Google, Apple, Supabase.
8. Quebec 9-1-1 tax on free numbers; GST/QST place of supply for nomadic numbers (with an accountant).
9. Call-recording consent wording (phase 2).
10. Number aging/quarantine minimum.
11. Structure of a Vidéotron agreement (phase 3).

## What to file with the CRTC / CCTS / governments (in order)

1. CRTC reseller registration (free) — before launch.
2. CCTS participation — at launch.
3. Revenu Québec: 9-1-1 municipal tax registration; GST/QST registration (voluntary early).
4. BITS licence — before selling international calling (if the lawyer says it is needed).
5. CRTC accessibility attestation (small-provider class).
6. DCS annual filing — each year when the CRTC asks.
