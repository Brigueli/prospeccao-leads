export const css = `
      /* ===== PALETA: troque só aqui (acento em RGB para os brilhos) ===== */
      :root {
        --accent: #19d3e6;
        --accent-rgb: 25, 211, 230;
        --accent-deep: #1e6fe0;
        --on-accent: #04121f;
        --alert: #ff4d5e;
        --alert-rgb: 255, 77, 94;
        --ground: #060d1c;
        --ink: #ffffff;
        --dim: #8da2c0;
        --ok: #25d366;
        --glass: rgba(13, 26, 48, 0.9);
        --font-display: "Inter", "Helvetica Neue", Arial, sans-serif;
        --font-mono: "JetBrains Mono", "Courier New", monospace;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: var(--ground); font-family: var(--font-display); color: var(--ink); }
      #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; }

      /* ===== fundo vivo ===== */
      .bg { position: absolute; inset: 0; z-index: 0; }
      .streak { position: absolute; width: 1900px; height: 230px; background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb),0.5), transparent); filter: blur(42px); transform: rotate(-35deg); }
      .s1 { left: -300px; top: 250px; } .s2 { left: -250px; top: 1350px; opacity: .8; } .s3 { left: 200px; top: 700px; opacity: .35; height: 120px; }
      .grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.035) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.035) 2px, transparent 2px); background-size: 90px 90px; }
      .dots { position: absolute; left: 40px; top: 90px; width: 240px; height: 180px; background-image: radial-gradient(rgba(255,255,255,0.25) 2px, transparent 2px); background-size: 26px 26px; }
      .ptc { position: absolute; border-radius: 50%; background: rgba(var(--accent-rgb), 0.8); box-shadow: 0 0 18px rgba(var(--accent-rgb), 0.9); }

      /* barra de progresso do reel */
      #topbar { position: absolute; z-index: 20; top: 54px; left: 60px; width: 960px; height: 10px; border-radius: 999px; background: rgba(255,255,255,0.14); overflow: hidden; }
      #topfill { height: 100%; width: 0; background: var(--accent); box-shadow: 0 0 20px rgba(var(--accent-rgb),1); border-radius: 999px; }

      /* wipe entre cenas */
      #wipe { position: absolute; z-index: 15; top: -200px; left: -1500px; width: 1300px; height: 2400px; background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb),0.9) 50%, transparent); transform: skewX(-18deg); filter: blur(10px); }

      .clip { position: absolute; inset: 0; z-index: 1; }
      .scene > * { position: absolute; }

      .num { top: 98px; left: 70px; font-family: var(--font-mono); font-size: 30px; letter-spacing: .15em; color: var(--dim); }
      .tag { top: 150px; left: 70px; font-family: var(--font-mono); font-size: 32px; letter-spacing: .18em; color: var(--accent); border: 3px solid var(--accent); border-radius: 999px; padding: 12px 36px; text-transform: uppercase; box-shadow: 0 0 24px rgba(var(--accent-rgb),.35); }
      .float { font-size: 96px; filter: drop-shadow(0 0 24px rgba(var(--accent-rgb),.7)); }
      .card { top: 270px; left: 60px; width: 840px; background: var(--glass); border: 2px solid rgba(255,255,255,.09); border-radius: 48px; padding: 44px 48px; box-shadow: 0 30px 80px rgba(0,0,0,.65), inset 0 2px 0 rgba(255,255,255,.07), 0 0 60px rgba(var(--accent-rgb),.15); }
      .title { top: 1130px; left: 0; width: 100%; text-align: center; font-size: 180px; font-weight: 800; letter-spacing: -.05em; color: #fff; text-shadow: 0 0 30px rgba(var(--accent-rgb),.95), 0 0 90px rgba(var(--accent-rgb),.6); white-space: nowrap; }
      .sub { top: 1370px; left: 0; width: 100%; text-align: center; font-size: 54px; font-weight: 600; color: #ececec; padding: 0 130px; line-height: 1.2; }

      .label { font-family: var(--font-mono); font-size: 28px; letter-spacing: .12em; color: var(--dim); text-transform: uppercase; }
      .big { font-size: 140px; font-weight: 800; letter-spacing: -.04em; line-height: 1.05; margin-top: 12px; }
      .search { background: #fff; color: #111; border-radius: 999px; padding: 26px 40px; font-size: 42px; font-weight: 600; margin-top: 24px; display: flex; align-items: center; gap: 16px; height: 96px; }
      .caret { display: inline-block; width: 4px; height: 48px; background: #111; }
      .row { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding: 22px 28px; border-radius: 24px; background: rgba(255,255,255,.07); font-size: 38px; font-weight: 600; }
      .row small { font-family: var(--font-mono); font-size: 26px; color: var(--dim); }
      .row.miss { background: rgba(var(--accent-rgb),.16); color: var(--accent); border: 2px dashed var(--accent); }
      .bars { display: flex; align-items: flex-end; gap: 14px; height: 170px; margin-top: 24px; }
      .bar { flex: 1; border-radius: 14px; background: rgba(255,255,255,.13); }
      .bar.hot { background: linear-gradient(#35e0f0, var(--accent-deep)); box-shadow: 0 0 30px rgba(var(--accent-rgb),.7); }
      .prog { height: 30px; border-radius: 999px; background: rgba(255,255,255,.1); margin-top: 22px; overflow: hidden; }
      .prog i { display: block; height: 100%; width: 0; border-radius: 999px; background: linear-gradient(90deg, var(--accent-deep), var(--accent)); box-shadow: 0 0 24px rgba(var(--accent-rgb),.9); }
      .pct { font-size: 110px; font-weight: 800; color: var(--accent); text-shadow: 0 0 30px rgba(var(--accent-rgb),.6); }
      .badge { position: absolute !important; top: -26px; right: 30px; background: var(--accent); color: var(--on-accent); font-weight: 800; font-size: 30px; padding: 12px 26px; border-radius: 999px; box-shadow: 0 0 30px rgba(var(--accent-rgb),.8); }
      .chips { display: flex; gap: 16px; margin-top: 26px; flex-wrap: wrap; }
      .chip { padding: 16px 30px; border-radius: 999px; font-size: 34px; font-weight: 700; background: rgba(255,255,255,.1); }
      .chip.on { color: var(--on-accent); background: var(--accent); box-shadow: 0 0 28px rgba(var(--accent-rgb),.6); }

      /* navegador */
      .browser { margin-top: 20px; border-radius: 28px; overflow: hidden; background: #121212; border: 2px solid rgba(255,255,255,.12); }
      .bhead { display: flex; align-items: center; gap: 12px; padding: 20px 24px; background: #1d1d1d; }
      .dot { width: 18px; height: 18px; border-radius: 50%; background: #444; } .dot:nth-child(1){background:#ff5f57} .dot:nth-child(2){background:#febc2e} .dot:nth-child(3){background:#28c840}
      .url { flex: 1; margin-left: 12px; font-family: var(--font-mono); font-size: 28px; background: #0c0c0c; border-radius: 999px; padding: 12px 26px; }
      .url b { color: #4ade80; }
      .bbody { padding: 26px; }
      .blk { border-radius: 18px; background: rgba(255,255,255,.1); }
      .stars { font-size: 52px; letter-spacing: 6px; margin-top: 20px; }

      /* whatsapp */
      .chat { margin-top: 14px; display: flex; flex-direction: column; gap: 12px; }
      .bub { max-width: 600px; padding: 16px 28px; border-radius: 32px; font-size: 38px; font-weight: 600; line-height: 1.2; }
      .bub.in { background: #2a2a2a; align-self: flex-start; border-bottom-left-radius: 8px; }
      .bub.out { background: #075e54; align-self: flex-end; border-bottom-right-radius: 8px; }
      .bub small { display: block; font-size: 28px; opacity: .6; margin-top: 8px; text-align: right; }
      .notif { background: var(--ok); color: #052b12; font-weight: 800; font-size: 38px; padding: 14px 30px; border-radius: 999px; display: inline-block; margin-top: 18px; }

      /* checklist */
      .step { display: flex; align-items: center; gap: 24px; margin-top: 18px; padding: 22px 28px; border-radius: 24px; background: rgba(255,255,255,.07); font-size: 40px; font-weight: 700; }
      .ck { width: 56px; height: 56px; border-radius: 50%; border: 4px solid var(--dim); display: flex; align-items: center; justify-content: center; font-size: 34px; color: transparent; }
      .ck.done { background: var(--ok); border-color: var(--ok); color: #052b12; }
      .days { display: flex; gap: 16px; margin-top: 22px; }
      .day { flex: 1; text-align: center; padding: 20px 0; border-radius: 20px; background: rgba(255,255,255,.08); font-family: var(--font-mono); font-size: 28px; color: var(--dim); }
      .day b { display: block; font-size: 56px; color: #fff; font-family: var(--font-display); }
      .day.hot { background: var(--accent); color: var(--on-accent); box-shadow: 0 0 30px rgba(var(--accent-rgb),.7); }

      /* cta */
      .cta { top: 300px; left: 60px; width: 840px; text-align: center; font-size: 66px; font-weight: 800; line-height: 1.2; }
      .kw { top: 640px; left: 60px; width: 840px; text-align: center; font-size: 104px; font-weight: 800; letter-spacing: .04em; padding: 44px 0; color: var(--on-accent); background: linear-gradient(90deg, var(--accent), #35a8ff); border-radius: 60px; box-shadow: 0 0 90px rgba(var(--accent-rgb),.85); }
      .arrow { top: 960px; left: 0; width: 960px; text-align: center; font-size: 150px; }
      .site7 { top: 1340px; left: 110px; width: 740px; text-align: center; font-family: var(--font-mono); font-size: 44px; font-weight: 700; color: var(--accent); border: 3px solid var(--accent); border-radius: 999px; padding: 24px 0; background: rgba(var(--accent-rgb),.1); box-shadow: 0 0 40px rgba(var(--accent-rgb),.4); }
      .cf { position: absolute; width: 18px; height: 34px; border-radius: 4px; z-index: 3; }
    `;
