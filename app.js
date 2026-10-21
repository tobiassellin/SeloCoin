document.addEventListener('DOMContentLoaded', () => {
  // 1. Live CO2 Counter in Top Bar
  const liveCo2El = document.getElementById('live-co2-counter');
  let currentCo2 = 34892.4;
  setInterval(() => {
    currentCo2 += 0.1;
    if (liveCo2El) {
      liveCo2El.textContent = currentCo2.toLocaleString('sv-SE', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
    }
  }, 3200);

  // 2. Presale Countdown Timer
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  let totalSeconds = 2 * 86400 + 14 * 3600 + 38 * 60 + 49;
  setInterval(() => {
    if (totalSeconds > 0) totalSeconds--;
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (cdDays) cdDays.textContent = String(d).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(h).padStart(2, '0');
    if (cdMins) cdMins.textContent = String(m).padStart(2, '0');
    if (cdSecs) cdSecs.textContent = String(s).padStart(2, '0');
  }, 1000);

  // 3. Presale Swap Widget Logic
  const payTabs = document.querySelectorAll('.pay-tab');
  const payAmountInput = document.getElementById('payAmount');
  const payCurrencyTag = document.getElementById('payCurrencyTag');
  const receiveAmountInput = document.getElementById('receiveAmount');
  const buyTreesCount = document.getElementById('buyTreesCount');
  const buyCo2Count = document.getElementById('buyCo2Count');
  const bonusBadge = document.getElementById('bonusBadge');
  const quickBtns = document.querySelectorAll('.quick-btn');

  let currentCurrency = 'SEK';
  // Rates converted to SEK equivalent so calculations stay consistent
  const currencyToSek = {
    SEK: 1,
    ETH: 28500,
    USDT: 10.65
  };
  const seloPriceSek = 0.45; // Presale Phase 3 price

  function updateSwapCalculation() {
    const rawVal = parseFloat(payAmountInput.value) || 0;
    const sekEquivalent = rawVal * currencyToSek[currentCurrency];

    // Bonus tier: +10% bonus for >= 3000 SEK, +15% for >= 15000 SEK
    let bonusMultiplier = 1.05;
    let bonusPctText = '+5% Miljöbonus inkluderad!';
    if (sekEquivalent >= 15000) {
      bonusMultiplier = 1.15;
      bonusPctText = '🔥 +15% VIP Miljöbonus inkluderad!';
    } else if (sekEquivalent >= 3000) {
      bonusMultiplier = 1.10;
      bonusPctText = '+10% Miljöbonus inkluderad!';
    }
    if (bonusBadge) bonusBadge.textContent = bonusPctText;

    const totalSelo = Math.round((sekEquivalent / seloPriceSek) * bonusMultiplier);
    if (receiveAmountInput) {
      receiveAmountInput.value = totalSelo.toLocaleString('sv-SE');
    }

    // 1 tree planted per 100 SEK invested (minimum 1 if > 0)
    const trees = sekEquivalent > 0 ? Math.max(1, Math.round(sekEquivalent / 100)) : 0;
    const co2Kg = trees * 25; // 25 kg CO2 per tree/year

    if (buyTreesCount) buyTreesCount.textContent = `${trees.toLocaleString('sv-SE')} träd`;
    if (buyCo2Count) buyCo2Count.textContent = `${co2Kg.toLocaleString('sv-SE')} kg CO₂`;
  }

  payTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      payTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCurrency = tab.getAttribute('data-currency');
      if (payCurrencyTag) payCurrencyTag.textContent = currentCurrency;

      if (currentCurrency === 'SEK') {
        payAmountInput.value = 5000;
        payAmountInput.step = 100;
      } else if (currentCurrency === 'ETH') {
        payAmountInput.value = 0.2;
        payAmountInput.step = 0.05;
      } else if (currentCurrency === 'USDT') {
        payAmountInput.value = 500;
        payAmountInput.step = 50;
      }
      updateSwapCalculation();
    });
  });

  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Switch to SEK if clicking SEK quick amounts
      if (currentCurrency !== 'SEK') {
        payTabs[0].click();
      }
      payAmountInput.value = btn.getAttribute('data-val');
      updateSwapCalculation();
    });
  });

  if (payAmountInput) {
    payAmountInput.addEventListener('input', updateSwapCalculation);
    updateSwapCalculation();
  }

  // 4. Interactive Profit & Environmental Calculator
  const calcInvestRange = document.getElementById('calcInvestRange');
  const calcMonthsRange = document.getElementById('calcMonthsRange');
  const calcInvestDisplay = document.getElementById('calcInvestDisplay');
  const calcMonthsDisplay = document.getElementById('calcMonthsDisplay');
  const scenarioBtns = document.querySelectorAll('.scenario-btn');

  const calcTotalValue = document.getElementById('calcTotalValue');
  const calcProfitPct = document.getElementById('calcProfitPct');
  const calcInitTokens = document.getElementById('calcInitTokens');
  const calcStakedTokens = document.getElementById('calcStakedTokens');
  const calcTrees = document.getElementById('calcTrees');
  const calcCo2 = document.getElementById('calcCo2');
  const applyCalcToBuyBtn = document.getElementById('applyCalcToBuyBtn');

  let targetPriceSek = 3.20;
  const apy = 0.185; // 18.5% APY

  function updateCalculator() {
    const investSek = parseFloat(calcInvestRange.value) || 10000;
    const months = parseInt(calcMonthsRange.value, 10) || 12;

    if (calcInvestDisplay) calcInvestDisplay.textContent = `${investSek.toLocaleString('sv-SE')} kr`;
    if (calcMonthsDisplay) calcMonthsDisplay.textContent = `${months} ${months === 1 ? 'månad' : 'månader'}`;

    const initialTokens = Math.round(investSek / seloPriceSek);
    const stakedReward = Math.round(initialTokens * (apy * (months / 12)));
    const totalTokens = initialTokens + stakedReward;
    const futureValueSek = Math.round(totalTokens * targetPriceSek);
    const profitSek = futureValueSek - investSek;
    const profitPct = Math.round((profitSek / investSek) * 100);

    const plantedTrees = Math.max(1, Math.round(investSek / 100));
    const co2Ton = ((plantedTrees * 25) / 1000).toFixed(1);

    if (calcTotalValue) calcTotalValue.textContent = `${futureValueSek.toLocaleString('sv-SE')} kr`;
    if (calcProfitPct) {
      calcProfitPct.textContent = `+${profitPct.toLocaleString('sv-SE')}% Total Avkastning (+${profitSek.toLocaleString('sv-SE')} kr)`;
    }
    if (calcInitTokens) calcInitTokens.textContent = `${initialTokens.toLocaleString('sv-SE')} SELO`;
    if (calcStakedTokens) calcStakedTokens.textContent = `+${stakedReward.toLocaleString('sv-SE')} SELO`;
    if (calcTrees) calcTrees.textContent = `${plantedTrees.toLocaleString('sv-SE')} Träd`;
    if (calcCo2) calcCo2.textContent = `${co2Ton.replace('.', ',')} Ton CO₂/år`;
  }

  if (calcInvestRange && calcMonthsRange) {
    calcInvestRange.addEventListener('input', updateCalculator);
    calcMonthsRange.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scenarioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      targetPriceSek = parseFloat(btn.getAttribute('data-price'));
      updateCalculator();
    });
  });

  if (applyCalcToBuyBtn) {
    applyCalcToBuyBtn.addEventListener('click', () => {
      if (currentCurrency !== 'SEK') {
        payTabs[0].click();
      }
      payAmountInput.value = calcInvestRange.value;
      updateSwapCalculation();
    });
  }

  // 5. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const toggle = item.querySelector('.faq-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(i => {
          i.classList.remove('active');
          const t = i.querySelector('.faq-toggle');
          if (t) t.textContent = '+';
        });
        if (!isOpen) {
          item.classList.add('active');
          if (toggle) toggle.textContent = '−';
        }
      });
    }
  });

  // 6. Connect Wallet Button & Purchase Modal
  const connectWalletBtn = document.getElementById('connectWalletBtn');
  let walletConnected = false;
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', () => {
      walletConnected = !walletConnected;
      if (walletConnected) {
        connectWalletBtn.innerHTML = '<span class="wallet-icon">🟢</span> 0x71C...9A4E';
      } else {
        connectWalletBtn.innerHTML = '<span class="wallet-icon">◈</span> Anslut Plånbok';
      }
    });
  }

  const buySeloBtn = document.getElementById('buySeloBtn');
  const purchaseModal = document.getElementById('purchaseModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const confirmPurchaseBtn = document.getElementById('confirmPurchaseBtn');
  const modalSuccessMsg = document.getElementById('modalSuccessMsg');

  const modalSummaryText = document.getElementById('modalSummaryText');
  const modalTokens = document.getElementById('modalTokens');
  const modalTrees = document.getElementById('modalTrees');
  const modalCo2 = document.getElementById('modalCo2');
  const modalStaking = document.getElementById('modalStaking');
  const modalCertId = document.getElementById('modalCertId');
  const autoStakeCheck = document.getElementById('autoStakeCheck');

  if (buySeloBtn && purchaseModal) {
    buySeloBtn.addEventListener('click', () => {
      const amount = payAmountInput.value;
      const tokens = receiveAmountInput.value;
      const trees = buyTreesCount.textContent;
      const co2 = buyCo2Count.textContent;
      const staked = autoStakeCheck && autoStakeCheck.checked;

      if (modalSummaryText) {
        modalSummaryText.innerHTML = `Du är på väg att investera <strong>${amount} ${currentCurrency}</strong> och säkra <strong>${tokens} $SELO</strong>.`;
      }
      if (modalTokens) modalTokens.textContent = `${tokens} $SELO`;
      if (modalTrees) modalTrees.textContent = `${trees} (GPS-verifierade)`;
      if (modalCo2) modalCo2.textContent = `${co2}/år`;
      if (modalStaking) {
        modalStaking.textContent = staked ? '18.5% APY Aktiverad' : 'Ej aktiverad';
      }
      if (modalCertId) {
        modalCertId.textContent = `#SELO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      if (modalSuccessMsg) modalSuccessMsg.style.display = 'none';

      purchaseModal.classList.add('open');
    });
  }

  if (closeModalBtn && purchaseModal) {
    closeModalBtn.addEventListener('click', () => {
      purchaseModal.classList.remove('open');
    });
    purchaseModal.addEventListener('click', (e) => {
      if (e.target === purchaseModal) purchaseModal.classList.remove('open');
    });
  }

  if (confirmPurchaseBtn && modalSuccessMsg) {
    confirmPurchaseBtn.addEventListener('click', () => {
      modalSuccessMsg.style.display = 'block';
      confirmPurchaseBtn.textContent = 'Investering Registrerad ✓';
      setTimeout(() => {
        confirmPurchaseBtn.textContent = 'Slutför Investering & Hämta Certifikat ✓';
      }, 4000);
    });
  }
});

