/* ═══════════════════════════════════════════════════════════════
   POOLI — Landing Page Interactions
   Phone carousel · Scroll reveal · Interactive demo
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Nav scroll ─── */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('navMobile');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close mobile nav on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* ─── Scroll reveal ─── */
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => observer.observe(el));

  /* ─── Phone mockup carousel ─── */
  const scenes = document.querySelectorAll('.phone-scene');
  const dots = document.querySelectorAll('.dot');
  let currentScene = 0;
  let carouselTimer;

  function showScene(index) {
    scenes.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
    currentScene = index;
  }

  function nextScene() {
    showScene((currentScene + 1) % scenes.length);
  }

  function startCarousel() {
    carouselTimer = setInterval(nextScene, 3500);
  }

  dots.forEach(d => {
    d.addEventListener('click', () => {
      clearInterval(carouselTimer);
      showScene(parseInt(d.dataset.scene));
      startCarousel();
    });
  });

  startCarousel();

  /* ─── Waitlist forms ─── */
  function handleWaitlist(formId, successId) {
    const form = document.getElementById(formId);
    const success = document.getElementById(successId);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.querySelector('input').value = '';
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 4000);
    });
  }
  handleWaitlist('heroForm', 'heroSuccess');
  handleWaitlist('footerForm', 'footerSuccess');

  /* ─── Smooth scroll for anchor links ─── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ═══════════════════════════════════════════════════════════════
     INTERACTIVE DEMO
     ═══════════════════════════════════════════════════════════════ */

  // Pool data for seeded people per pool
  const poolPeople = {
    friends: [
      { name: 'Alex', initial: 'A', color: '#FF6B6B', what: 'Grabbing tacos near the park. Down to join?', when: 'Tonight, ~7pm', approxLoc: 'East Side \u00b7 ~1.2 mi', exactLoc: 'Taqueria El Sol, 412 E 9th St \u00b7 0.3 mi' },
      { name: 'Kai', initial: 'K', color: '#6BCB77', what: 'Working from a cafe. Company welcome.', when: 'Now \u2013 3pm', approxLoc: 'Midtown \u00b7 ~0.8 mi', exactLoc: 'Blue Bottle, 54 W 40th St \u00b7 0.2 mi' },
      { name: 'Nina', initial: 'N', color: '#C084FC', what: 'Live jazz at 9. Extra ticket. Anyone?', when: 'Tonight, 9pm', approxLoc: 'Downtown \u00b7 ~2 mi', exactLoc: 'Village Vanguard, 178 7th Ave S \u00b7 1.8 mi' },
    ],
    touring: [
      { name: 'Marcus', initial: 'M', color: '#e8a849', what: 'In London tonight. Open to a late dinner.', when: 'Tonight', approxLoc: 'Soho \u00b7 ~0.4 mi', exactLoc: 'Barrafina, 10 Adelaide St \u00b7 0.1 mi' },
      { name: 'Priya', initial: 'P', color: '#FF6B6B', what: 'Sound check done. Beers near the venue?', when: 'Now', approxLoc: 'Camden \u00b7 ~1 mi', exactLoc: 'The Hawley Arms, 2 Castlehaven Rd \u00b7 0.8 mi' },
      { name: 'Leo', initial: 'L', color: '#5eb8c9', what: 'Day off in Paris. Museum + coffee?', when: 'Tomorrow AM', approxLoc: 'Le Marais \u00b7 ~0.6 mi', exactLoc: 'Caf\u00e9 Oberkampf, 3 Rue Neuve Popincourt \u00b7 0.4 mi' },
    ],
    dads: [
      { name: 'Dan', initial: 'D', color: '#6BCB77', what: 'Kids at the zoo Saturday. Anyone want to join?', when: 'Saturday', approxLoc: 'Brooklyn \u00b7 ~2 mi', exactLoc: 'Prospect Park Zoo, 450 Flatbush Ave \u00b7 1.6 mi' },
      { name: 'Omar', initial: 'O', color: '#e8a849', what: 'Playground morning. Toddler energy to burn.', when: 'Sunday 10am', approxLoc: 'Upper West \u00b7 ~1.5 mi', exactLoc: 'Hippo Playground, Riverside Park \u00b7 1.2 mi' },
      { name: 'Ben', initial: 'B', color: '#C084FC', what: 'Bike ride with the kids — easy pace.', when: 'Sat afternoon', approxLoc: 'Williamsburg \u00b7 ~3 mi', exactLoc: 'McCarren Park trailhead \u00b7 2.8 mi' },
    ],
    'new-in-city': [
      { name: 'Jamie', initial: 'J', color: '#C084FC', what: 'Coffee + walk. Want company?', when: 'This afternoon', approxLoc: 'East Village \u00b7 ~0.8 mi', exactLoc: 'Abraço, 81 E 7th St \u00b7 0.5 mi' },
      { name: 'Riya', initial: 'R', color: '#e8a849', what: 'New here — anyone for live music tonight?', when: 'Friday eve', approxLoc: 'Williamsburg \u00b7 ~3 mi', exactLoc: 'Baby\'s All Right, 146 Broadway \u00b7 2.9 mi' },
      { name: 'Sam', initial: 'S', color: '#5eb8c9', what: 'Just moved. Exploring bookshops. Join me?', when: 'Tomorrow', approxLoc: 'SoHo \u00b7 ~1.4 mi', exactLoc: 'McNally Jackson, 52 Prince St \u00b7 1.1 mi' },
    ],
    'live-music': [
      { name: 'Zoe', initial: 'Z', color: '#FF6B6B', what: 'Indie show at 10. Need a concert buddy.', when: 'Tonight 10pm', approxLoc: 'LES \u00b7 ~1.5 mi', exactLoc: 'Mercury Lounge, 217 E Houston St \u00b7 1.2 mi' },
      { name: 'Theo', initial: 'T', color: '#6BCB77', what: 'Free jazz in the park. Bring a blanket.', when: 'Sunday 4pm', approxLoc: 'Central Park \u00b7 ~2 mi', exactLoc: 'SummerStage, Rumsey Playfield \u00b7 1.8 mi' },
      { name: 'Mia', initial: 'M', color: '#C084FC', what: 'Open mic night. Moral support needed.', when: 'Wed 8pm', approxLoc: 'Bushwick \u00b7 ~4 mi', exactLoc: 'Lot 45, 411 Troutman St \u00b7 3.7 mi' },
    ],
    pilates: [
      { name: 'Elena', initial: 'E', color: '#FFB6C1', what: 'Morning reformer class. Split it?', when: 'Tomorrow 7am', approxLoc: 'Flatiron \u00b7 ~1 mi', exactLoc: 'SLT Flatiron, 37 W 19th St \u00b7 0.7 mi' },
      { name: 'Aisha', initial: 'A', color: '#e8a849', what: 'Mat Pilates in the park — free & chill.', when: 'Saturday 9am', approxLoc: 'Hudson River \u00b7 ~1.8 mi', exactLoc: 'Pier 46 lawn, Hudson River Park \u00b7 1.5 mi' },
      { name: 'Luca', initial: 'L', color: '#5eb8c9', what: 'Trying a new studio. Partner stretch after?', when: 'Fri 6pm', approxLoc: 'Tribeca \u00b7 ~2.2 mi', exactLoc: 'Forma Pilates, 64 N Moore St \u00b7 2 mi' },
    ],
  };

  const poolNameMap = {
    friends: 'Friends',
    touring: 'Touring Musicians',
    dads: 'Dads',
    'new-in-city': 'New In City',
    'live-music': 'Live Music',
    pilates: 'Pilates',
  };

  // State
  let activePool = 'friends';
  let handRaised = false;
  let userHandData = null;
  // Track per-person interaction states: { personKey: 'visible' | 'requested' | 'matched' | 'expired' }
  let personStates = {};

  // DOM refs
  const demoPools = document.getElementById('demoPools');
  const demoStatus = document.getElementById('demoStatus');
  const demoStatusText = demoStatus.querySelector('.demo__status-text');
  const demoRaiseBtn = document.getElementById('demoRaiseBtn');
  const demoUserCard = document.getElementById('demoUserCard');
  const demoLowerBtn = document.getElementById('demoLowerBtn');
  const demoFeed = document.getElementById('demoFeed');
  const demoPoolName = document.getElementById('demoPoolName');

  // Modal refs
  const modalOverlay = document.getElementById('modalOverlay');
  const raiseForm = document.getElementById('raiseForm');
  const modalClose = document.getElementById('modalClose');

  const matchModalOverlay = document.getElementById('matchModalOverlay');
  const matchModal = document.getElementById('matchModal');
  const matchModalClose = document.getElementById('matchModalClose');
  const matchAvatar = document.getElementById('matchAvatar');
  const matchDetail = document.getElementById('matchDetail');
  const matchInfo = document.getElementById('matchInfo');
  const matchDoneBtn = document.getElementById('matchDoneBtn');

  // Pool chip clicks
  demoPools.addEventListener('click', (e) => {
    const chip = e.target.closest('.demo__chip');
    if (!chip) return;
    demoPools.querySelectorAll('.demo__chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activePool = chip.dataset.pool;
    personStates = {};
    renderFeed();
  });

  // Raise hand button
  demoRaiseBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
  });

  // Close modal
  modalClose.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
  });
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
  });

  // Submit raise form
  raiseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const what = document.getElementById('raiseWhat').value;
    const when = document.getElementById('raiseWhen').value;
    const where = document.getElementById('raiseWhere').value;
    const visibility = raiseForm.querySelector('input[name="visibility"]:checked').value;

    const visLabels = { friends: 'Friends only', pool: poolNameMap[activePool], fof: 'Friends-of-friends' };

    userHandData = { what, when, where, visibility: visLabels[visibility] };
    handRaised = true;

    modalOverlay.classList.add('hidden');
    raiseForm.reset();
    renderUserState();
  });

  // Lower hand
  demoLowerBtn.addEventListener('click', () => {
    handRaised = false;
    userHandData = null;
    renderUserState();
  });

  // Match modal close
  matchModalClose.addEventListener('click', () => {
    matchModalOverlay.classList.add('hidden');
  });
  matchModalOverlay.addEventListener('click', (e) => {
    if (e.target === matchModalOverlay) matchModalOverlay.classList.add('hidden');
  });
  matchDoneBtn.addEventListener('click', () => {
    matchModalOverlay.classList.add('hidden');
  });

  function renderUserState() {
    if (handRaised && userHandData) {
      demoStatus.classList.add('raised');
      demoStatusText.textContent = 'Your hand is up!';
      demoRaiseBtn.classList.add('hidden');

      demoUserCard.classList.remove('hidden');
      document.getElementById('demoUserWhat').textContent = userHandData.what;
      document.getElementById('demoUserMeta').textContent =
        `${userHandData.when} \u00b7 ${userHandData.where} \u00b7 ${userHandData.visibility}`;
      document.getElementById('demoExpiry').textContent = 'Expires in 4 hours';
    } else {
      demoStatus.classList.remove('raised');
      demoStatusText.textContent = "You haven\u2019t raised your hand yet.";
      demoRaiseBtn.classList.remove('hidden');
      demoUserCard.classList.add('hidden');
    }
  }

  function renderFeed() {
    const people = poolPeople[activePool] || poolPeople.friends;
    demoPoolName.textContent = poolNameMap[activePool] || 'Friends';

    // Remove old person cards
    demoFeed.querySelectorAll('.demo__person').forEach(el => el.remove());

    people.forEach((person, i) => {
      const key = `${activePool}-${person.name}`;
      const state = personStates[key] || 'visible';

      const el = document.createElement('div');
      el.className = 'demo__person' + (state === 'matched' ? ' matched' : '');
      el.dataset.person = key;
      el.dataset.state = state;
      el.style.animation = `slideUp .4s var(--ease) ${i * .08}s both`;

      const isMatched = state === 'matched';
      const isExpired = state === 'expired';

      el.innerHTML = `
        <div class="demo__person-avatar" style="background:${person.color};">${person.initial}</div>
        <div class="demo__person-info">
          <strong>${person.name}</strong>
          <p class="demo__person-what">${person.what}</p>
          <span class="demo__person-meta">
            <span class="demo__person-when">${person.when}</span>
            <span class="demo__person-loc ${isMatched ? 'demo__person-loc--exact' : 'demo__person-loc--approx'}">
              ${isMatched ? person.exactLoc : person.approxLoc}
            </span>
          </span>
        </div>
        <div class="demo__person-actions">
          ${state === 'visible' ? `<button class="btn btn--outline btn--sm demo__join-btn">Request to join</button>` : ''}
          ${state === 'requested' ? `<span class="demo__person-state sent">Request sent</span>` : ''}
          ${state === 'matched' ? `<span class="demo__person-state matched-label">Matched</span>` : ''}
          ${state === 'expired' ? `<span class="demo__person-state expired">Expired</span>` : ''}
        </div>
      `;

      // Bind actions
      const joinBtn = el.querySelector('.demo__join-btn');
      if (joinBtn) {
        joinBtn.addEventListener('click', () => {
          personStates[key] = 'requested';
          renderFeed();

          // Simulate match after delay
          setTimeout(() => {
            if (personStates[key] === 'requested') {
              personStates[key] = 'matched';
              renderFeed();
              showMatchModal(person);
            }
          }, 1800);
        });
      }

      demoFeed.appendChild(el);
    });
  }

  function showMatchModal(person) {
    matchAvatar.style.background = person.color;
    matchAvatar.textContent = person.initial;
    matchDetail.textContent = `You and ${person.name} are going!`;
    matchInfo.innerHTML = `
      <strong>${person.what}</strong><br/>
      ${person.when}<br/>
      <span style="color:var(--amber);">${person.exactLoc}</span>
    `;
    matchModalOverlay.classList.remove('hidden');
  }

  // Initial feed render
  renderFeed();

  /* ─── Expiry simulation: after 30s of being matched, expire one person ─── */
  setInterval(() => {
    const keys = Object.keys(personStates);
    const matchedKeys = keys.filter(k => personStates[k] === 'matched');
    if (matchedKeys.length > 1) {
      // Expire the oldest match if there are multiple
      personStates[matchedKeys[0]] = 'expired';
      renderFeed();
    }
  }, 30000);

})();
