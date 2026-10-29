(() => {
  const hd = document.getElementById('hd');
  const top = document.querySelector('.fv, .ph');
  const menu = document.getElementById('menu');
  const menuBtn = document.getElementById('menuBtn');

  /* ヘッダー：最初の帯を抜けたら紙色に */
  const setHeader = () => {
    const edge = top ? top.offsetHeight - 90 : 10;
    hd.classList.toggle('is-solid', !menu.hidden || window.scrollY > edge);
  };

  /* メニュー */
  const closeMenu = () => { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'メニューを開く'); document.documentElement.style.overflow = ''; setHeader(); };
  menuBtn.addEventListener('click', () => {
    if (menu.hidden) { menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'メニューを閉じる'); document.documentElement.style.overflow = 'hidden'; setHeader(); }
    else closeMenu();
  });
  menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) closeMenu(); });

  /* 水面：涙のひとしずくが落ち、波紋が広がる（Work＋Cry） */
  const SKY = [30, 155, 212], HARU = [240, 140, 25];
  /* メンバーが「青春とは？」に挙げた言葉。苦しい瞬間は青、報われる瞬間は春（オレンジ）、涙と甘酸っぱいは青から春へ */
  const WORDS = [['涙', 'both'], ['挑戦', 'ao'], ['笑顔', 'haru'], ['未熟', 'ao'], ['リベンジ', 'haru'], ['失敗', 'ao'],
    ['チーム', 'haru'], ['徹夜', 'ao'], ['輝き', 'haru'], ['喧嘩', 'ao'], ['甘酸っぱい', 'both'], ['心の叫び', 'ao'], ['大人子供', 'haru']];
  let wordAt = 0;
  const mix = (a, b, t) => a.map((c, i) => Math.round(c + (b[i] - c) * t));
  const water = cv => {
    const host = cv.parentElement;
    const ctx = cv.getContext('2d');
    const calm = cv.dataset.calm === '1';
    let W = 0, H = 0, n = 0, running = true, last = 0, nextAt = calm ? 300 : 600, lastPointer = 0, first = true;
    const drops = [];
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (x, y, scale = 1) => {
      const [word, tone] = WORDS[wordAt++ % WORDS.length]; n++;
      drops.push({ x, y, t: 0, word, tone, fall: 900, life: 9000 + Math.random() * 2500, fs: (calm ? 22 : 24 + Math.random() * 12) * (W < 600 ? 0.55 : W < 900 ? 0.75 : 1),  /* スマホは小さく：小さいから味がある */
        maxR: Math.max(W, H) * (calm ? 0.26 : 0.32 + Math.random() * 0.18) * scale });
    };
    const frame = now => {
      if (!running) return;
      const dt = Math.min(64, now - (last || now)); last = now;
      if (now > nextAt) {
        if (first) spawn(calm ? W * 0.78 : W * 0.5, calm ? H * 0.62 : H * 0.76, calm ? 1 : 1.25);
        else if (calm) spawn(W * (0.55 + Math.random() * 0.38), H * (0.45 + Math.random() * 0.45));
        else {
          const side = Math.random() < 0.5;   /* 上下どちらかの余白へ。中央のコピーには重ねない */
          spawn(W * (0.12 + Math.random() * 0.76), side ? H * (0.16 + Math.random() * 0.12) : H * (0.7 + Math.random() * 0.2));
        }
        first = false;
        nextAt = now + (calm ? 4200 : 2800) + Math.random() * 1600;
      }
      ctx.clearRect(0, 0, W, H);
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.t += dt;
        const life = Math.max(0, Math.min(1, (d.t - d.fall) / d.life));
        const [r, g, b] = d.tone === 'ao' ? SKY : d.tone === 'haru' ? HARU : mix(SKY, HARU, Math.min(1, life * 2.2));
        if (d.t < d.fall) {
          const p = d.t / d.fall, y = d.y - 160 * (1 - p * p);
          const grd = ctx.createLinearGradient(d.x, y - 22, d.x, y);
          grd.addColorStop(0, `rgba(${r},${g},${b},0)`); grd.addColorStop(1, `rgba(${r},${g},${b},${0.55 * Math.min(1, p * 3)})`);
          ctx.strokeStyle = grd; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(d.x, y - 22); ctx.lineTo(d.x, y); ctx.stroke();
          continue;
        }
        const t = (d.t - d.fall) / d.life;
        if (t >= 1) { drops.splice(i, 1); continue; }
        const ease = 1 - Math.pow(1 - t, 2.2);
        const R = d.maxR * ease;
        for (let k = 0; k < 4; k++) {
          const rk = R - k * 26 * (0.6 + ease);
          if (rk <= 2) continue;
          const a = Math.pow(1 - t, 1.6) * (0.5 - k * 0.1);
          if (a <= 0.01) continue;
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.lineWidth = k === 0 ? 1.4 : 1;
          ctx.beginPath(); ctx.ellipse(d.x, d.y, rk, rk * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
        }
        /* 言葉：波紋の中心にふわっと浮かび、波紋が広がるにつれて消える */
        const wa = t < 0.08 ? t / 0.08 : Math.max(0, 1 - (t - 0.08) / 0.55);
        if (wa > 0.01) {
          ctx.save();
          ctx.globalAlpha = wa * 0.9;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.font = `500 ${d.fs}px "Shippori Mincho B1","Hiragino Mincho ProN","Yu Mincho",serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
          if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0.2em';
          ctx.fillText(d.word, d.x, d.y - 14 - t * 26);
          ctx.restore();
        }
        if (t < 0.12) {
          const a = (1 - t / 0.12) * 0.35, rr = 10 + t * 120;
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.beginPath(); ctx.ellipse(d.x, d.y, rr, rr * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
      requestAnimationFrame(frame);
    };
    const start = () => { if (running) return; running = true; last = 0; requestAnimationFrame(frame); };
    const stop = () => { running = false; };
    size(); requestAnimationFrame(frame);
    window.addEventListener('resize', size);
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting && !document.hidden ? start() : stop())).observe(host);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : (host.getBoundingClientRect().bottom > 0 && start()));
    host.addEventListener('pointermove', e => {
      const now = performance.now();
      if (now - lastPointer < 1400 || e.pointerType !== 'mouse') return;
      lastPointer = now; const r = host.getBoundingClientRect();
      spawn(e.clientX - r.left, e.clientY - r.top, 0.55);
    });
    host.addEventListener('pointerdown', e => {
      if (e.target.closest('a,button,input,textarea,select,label')) return;
      const r = host.getBoundingClientRect(); spawn(e.clientX - r.left, e.clientY - r.top, 0.8);
    });
  };
  document.querySelectorAll('canvas.water').forEach(water);

  /* 1本の線：各セクションの余白をつたって描く */
  const flow = document.getElementById('flow');
  let len = 0, flowH = 0, path = null;
  const build = () => {
    if (!flow) return;
    const svg = document.getElementById('thread');
    path = svg.querySelector('path');
    const grad = document.getElementById('threadGrad');
    const W = flow.clientWidth;
    if (W < 1100) { svg.style.display = 'none'; len = 0; return; }
    svg.style.display = '';
    flowH = flow.offsetHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', flowH);
    svg.setAttribute('viewBox', `0 0 ${W} ${flowH}`);
    grad.setAttribute('y2', flowH);
    const margin = Math.max(0, (W - 1160) / 2);
    const L = Math.max(22, margin * 0.42), R = W - L;
    const fr = flow.getBoundingClientRect();
    const secs = [...flow.querySelectorAll(':scope > .sec')];
    let px = W / 2, py = 0, d = `M ${px} ${py}`, side = 0;
    secs.forEach(s => {
      const r = s.getBoundingClientRect();
      const t = r.top - fr.top, b = r.bottom - fr.top;
      const x = side % 2 === 0 ? L : R; side++;
      const y1 = t + Math.min(140, (b - t) * 0.12);
      const y2 = b - Math.min(60, (b - t) * 0.06);
      const k = (y1 - py) * 0.62;
      d += ` C ${px} ${py + k}, ${x} ${y1 - k}, ${x} ${y1} L ${x} ${y2}`;
      px = x; py = y2;
    });
    path.setAttribute('d', d);
    len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    draw();
  };
  const draw = () => {
    if (!len) return;
    const t = flow.getBoundingClientRect().top;
    const prog = Math.min(1, Math.max(0, (window.innerHeight * 0.78 - t) / flowH));
    path.style.strokeDashoffset = len * (1 - prog);
  };

  /* 写真の視差（ゆっくり） */
  const para = [...document.querySelectorAll('[data-parallax]')];
  const depth = [...document.querySelectorAll('[data-depth]')];
  const parallax = () => {
    depth.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      const c = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-c * parseFloat(el.dataset.depth)).toFixed(1)}px, 0)`;
    });
    para.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      const c = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = `translate3d(0, ${(-c * 5).toFixed(2)}%, 0)`;
    });
  };

  /* 表示アニメーション：画面外の要素だけ待機させる */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('rv-on'); e.target.classList.remove('rv-wait'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rv').forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('rv-wait'); io.observe(el); }
    });
  }

  /* お知らせの絞り込み */
  const tabs = document.querySelectorAll('[data-filter]');
  tabs.forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    tabs.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    document.querySelectorAll('.news-list li[data-cat]').forEach(li => { li.hidden = f !== 'all' && li.dataset.cat !== f; });
  }));

  /* お問い合わせフォーム */
  const form = document.getElementById('contactForm');
  if (form) {
    const done = document.getElementById('formDone');
    const err = document.getElementById('formError');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      err.hidden = true;
      if (!form.reportValidity()) return;
      const url = form.dataset.endpoint;
      const btn = form.querySelector('button[type="submit"]');
      if (!url) { err.textContent = '送信先が未設定です。お手数ですが saiyou@worcry.com までメールでご連絡ください。'; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = '送信しています…';
      try {
        await fetch(url, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(new FormData(form)) });
        form.hidden = true; done.hidden = false;
        done.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (_) {
        btn.disabled = false; btn.textContent = 'この内容で送信する';
        err.textContent = '送信できませんでした。通信環境をご確認のうえ、もう一度お試しください。';
        err.hidden = false;
      }
    });
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { setHeader(); draw(); parallax(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { build(); onScroll(); });
  window.addEventListener('load', build);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  if (flow) new ResizeObserver(() => build()).observe(flow);
  build(); setHeader(); parallax();
})();
