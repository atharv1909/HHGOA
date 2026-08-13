<div align="center">

![HH Goa 2026 banner](https://capsule-render.vercel.app/api?type=waving&color=0:20716A,50:FBE6A2,100:F4A9C7&height=220&section=header&text=HH%20Goa%202026&fontSize=60&fontColor=0B1B19&animation=fadeIn&fontAlignY=38&desc=Frame%20%2F%20Builder%20ID%20Generator&descAlignY=58&descSize=20)

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=2200&pause=900&color=20716A&center=true&vCenter=true&multiline=true&width=680&height=90&lines=Less+Noise.+More+Signal.;Get+issued.;Your+build%2C+timestamped.;28%E2%80%9331+Oct+2026+%C2%B7+Goa%2C+India" alt="typing banner" />

<br/>

[![Made for](https://img.shields.io/badge/made%20for-hhgoa.com-20716A?style=for-the-badge&labelColor=0B1B19)](https://hhgoa.com)
[![Radar](https://img.shields.io/badge/tracked%20on-%2Fradar-F4A9C7?style=for-the-badge&labelColor=0B1B19)](https://hhgoa.com/radar)
[![Hashtag](https://img.shields.io/badge/%23FrameInGoa-FFF78C?style=for-the-badge&labelColor=0B1B19&logoColor=0B1B19)](https://twitter.com/hashtag/FrameInGoa)
[![Status](https://img.shields.io/badge/status-v1%20build-FBE6A2?style=for-the-badge&labelColor=0B1B19)]()

</div>

<br/>

> **"Most hackathons are just hype and no substance... lock in and build your legacy."**
> — hhgoa.com. This tool exists to hand every builder a real, timestamped credential for showing up. Not a filter. Not a badge with a logo pasted on it. An **issuance**.

---

## ⚡ What this is

<table>
<tr>
<td width="50%" valign="top">

### 🪪 Format B — Builder ID Card
*(primary / default flow)*

Upload a photo → add name + stack/role → get a deterministic **builder title** → download a card that looks like an event credential, not a meme.

Front: photo + identity. Back: QR → public profile page.

</td>
<td width="50%" valign="top">

### 🖼️ Format A — PFP Frame
*(fast / lightweight path)*

Zero fields. Upload → frame wraps the photo in HH Goa branding → instant X profile picture. One tap faster for people who just want a PFP.

</td>
</tr>
</table>

<div align="center">
<sub>Both flows: no login wall · no signup gate · one pass, start to finish</sub>
</div>

---

## 🎬 Flow

```mermaid
flowchart LR
    A[📸 Upload photo] --> B[🎨 Pick format<br/>Builder ID / PFP]
    B --> C[✍️ Name + Stack<br/><i>Builder ID only</i>]
    C --> D[🎲 Builder title<br/>auto-generated]
    D --> E[⚙️ Generate<br/>sub-second render]
    E --> F[📥 Download]
    E --> G[🐦 Share to X<br/>#FrameInGoa]
    G --> H[📊 Show up on<br/>the Radar]

    style A fill:#FBE6A2,stroke:#20716A,color:#0B1B19
    style B fill:#FBE6A2,stroke:#20716A,color:#0B1B19
    style C fill:#FBE6A2,stroke:#20716A,color:#0B1B19
    style D fill:#F4A9C7,stroke:#20716A,color:#0B1B19
    style E fill:#FFF78C,stroke:#20716A,color:#0B1B19
    style F fill:#20716A,stroke:#0B1B19,color:#ffffff
    style G fill:#20716A,stroke:#0B1B19,color:#ffffff
    style H fill:#F4A9C7,stroke:#20716A,color:#0B1B19
```

---

## 🎨 Color system

<div align="center">

| Token | Swatch | Hex | Role |
|---|---|---|---|
| `--surface-dark` | ![#0B1B19](https://placehold.co/60x24/0B1B19/0B1B19.png) | `#0B1B19` | Primary background |
| `--surface-light` | ![#FBE6A2](https://placehold.co/60x24/FBE6A2/FBE6A2.png) | `#FBE6A2` | Paper / light-mode surface |
| `--primary` | ![#20716A](https://placehold.co/60x24/20716A/20716A.png) | `#20716A` | Official identity color |
| `--accent-signal` | ![#FFF78C](https://placehold.co/60x24/FFF78C/FFF78C.png) | `#FFF78C` | One hero action per screen |
| `--accent-warm` | ![#F4A9C7](https://placehold.co/60x24/F4A9C7/F4A9C7.png) | `#F4A9C7` | Secondary accent |

<sub>Discipline rule: never more than 2 of the 4 accents on one screen, beyond base teal/dark.</sub>

</div>

---

## 🧱 Tech stack

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20716A?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Canvas](https://img.shields.io/badge/Canvas%20API-FFF78C?style=for-the-badge&logoColor=0B1B19&labelColor=0B1B19)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

**Everything client-side by default** — upload, HEIC conversion, crop/zoom/pan, Canvas compositing, export, download. Supabase enters only when a card is made shareable: one storage bucket (composited image only, never the source photo) + one Postgres table.

```
short_id → { name, stack, title, socials?, image_url, created_at }
```

---

## 📂 Project structure

```
/assets
  /brand        → logo (SVG + transparent PNG + mono), wordmark, Hindi-script mark
  /frames       → frame-01-minimal.svg … frame-04-builder-grid.svg
  /patterns     → line-grid.svg, coordinate-marks.svg
  /icons        → custom-styled social icons
  /fonts        → display + mono .woff2
  /qr           → styling config only (QR generated at runtime)

/frames.ts       → config-driven frame registry
/app
  /                    → generator (home IS the tool)
  /builder/[id]        → public result page (SSR, OG image = generated card)
  /radar               → external link out, not rebuilt
```

---

## 🧩 Frame variants (v1)

<div align="center">

| ![](https://placehold.co/140x180/0B1B19/FBE6A2?text=Minimal) | ![](https://placehold.co/140x180/20716A/FFF78C?text=Terminal) | ![](https://placehold.co/140x180/FBE6A2/20716A?text=Goa-Motif) | ![](https://placehold.co/140x180/0B1B19/F4A9C7?text=Builder+Grid) |
|:---:|:---:|:---:|:---:|
| Minimal | Terminal / Signal | Goa-Motif | Builder Grid |

</div>

---

## 🚀 Getting started

```bash
git clone https://github.com/hhgoa/frame-generator.git
cd frame-generator
npm install
npm run dev
```

<details>
<summary><b>Environment variables</b></summary>

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

No auth provider required for v1 — public bucket + single table only.

</details>

<details>
<summary><b>Build order (recommended sequence)</b></summary>

1. Design system tokens + Figma frame set (4 variants, front + back)
2. Static component shells with mock data
3. Client-side image pipeline end-to-end for one frame
4. Wire remaining 3 frames into the config-driven system
5. Builder title generator + optional-socials form
6. Supabase table + storage + `/builder/[id]` OG page
7. Share flow: X intent + Web Share API
8. Error states, accessibility pass, real-device testing
9. Team frame *(v2)*

</details>

---

## ✅ Roadmap

**V1 — shipping**
- [x] Single-person Builder ID + PFP Frame, 4 frame variants
- [x] Live client-side editing, zero login
- [x] Deterministic builder-title generator
- [x] Optional socials, progressive disclosure
- [x] QR + public profile page + full OG share flow
- [x] Download + Share to X

**V2 — deferred**
- [ ] Team frame (1–3 people)
- [ ] Independent "show on card" vs "show on profile" toggles
- [ ] 2 additional frame variants (data-driven pick)

---

## 🔐 Privacy

Generated and previewed **entirely locally** by default. The original source photo is never uploaded — only the final composited image, and only the moment you choose to make it shareable.

---

<div align="center">

### 🐦 Share it

```
Just got issued my HH Goa 2026 builder credential 🪪
#FrameInGoa
```

<sub>Tracked live on the <a href="https://hhgoa.com/radar">W Celeb Radar</a> — ranked by tweet views.</sub>

<br/><br/>

![footer](https://capsule-render.vercel.app/api?type=waving&color=0:F4A9C7,50:FBE6A2,100:20716A&height=140&section=footer&animation=fadeIn)

**4 days. One rhythm. Everything intentional.**

</div>
