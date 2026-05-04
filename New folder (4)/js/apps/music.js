/**
 * CloudsOS — Music Player App
 */
(() => {
  const PLAYLIST = [
    { id: 1, title: 'Horizon Drift', artist: 'Neon Cloud', duration: '3:45' },
    { id: 2, title: 'Lofi Rain', artist: 'Sky Echo', duration: '2:30' },
    { id: 3, title: 'Solar Flare', artist: 'Plasma', duration: '4:12' },
    { id: 4, title: 'Midnight City', artist: 'Retro Wave', duration: '3:58' },
    { id: 5, title: 'Ether', artist: 'Ambient Soul', duration: '5:20' },
  ];

  function render() {
    return `
      <div class="music-body">
        <div class="music-album-art" id="music-art">🎵</div>
        <div class="music-info">
          <div class="music-title" id="music-title">Select a track</div>
          <div class="music-artist" id="music-artist">Playlist is empty</div>
        </div>
        <div class="music-progress">
          <input type="range" class="music-bar" id="music-seek" value="0" min="0" max="100">
          <div class="music-times">
            <span id="music-curr">0:00</span>
            <span id="music-total">0:00</span>
          </div>
        </div>
        <div class="music-controls">
          <span class="music-ctrl-btn">⏮</span>
          <span class="music-ctrl-btn main" id="music-play-btn">▶</span>
          <span class="music-ctrl-btn">⏭</span>
        </div>
        <div class="music-playlist" id="music-list"></div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;

    const playBtn = win.querySelector('#music-play-btn');
    const art = win.querySelector('#music-art');
    const titleEl = win.querySelector('#music-title');
    const artistEl = win.querySelector('#music-artist');
    const seek = win.querySelector('#music-seek');
    const currTime = win.querySelector('#music-curr');
    const totalTime = win.querySelector('#music-total');
    const list = win.querySelector('#music-list');

    let isPlaying = false;
    let currentTrack = null;
    let seekInterval = null;

    function togglePlay() {
      if (!currentTrack) return;
      isPlaying = !isPlaying;
      playBtn.textContent = isPlaying ? '⏸' : '▶';
      art.classList.toggle('playing', isPlaying);
      
      if (isPlaying) {
        startProgress();
      } else {
        clearInterval(seekInterval);
      }
    }

    function startProgress() {
      clearInterval(seekInterval);
      seekInterval = setInterval(() => {
        let val = parseInt(seek.value);
        if (val < 100) {
          seek.value = val + 1;
          updateTimeStrings();
        } else {
          isPlaying = false;
          playBtn.textContent = '▶';
          art.classList.remove('playing');
          clearInterval(seekInterval);
        }
      }, 500);
    }

    function updateTimeStrings() {
        // Mock time logic
        const totalSec = 180; // 3 min
        const currentSec = Math.floor((parseInt(seek.value) / 100) * totalSec);
        
        const format = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
        currTime.textContent = format(currentSec);
        totalTime.textContent = format(totalSec);
    }

    function playTrack(track) {
      currentTrack = track;
      titleEl.textContent = track.title;
      artistEl.textContent = track.artist;
      seek.value = 0;
      updateTimeStrings();
      
      if (!isPlaying) togglePlay();
      else startProgress();

      win.querySelectorAll('.music-track').forEach(t => {
        t.classList.toggle('active', parseInt(t.dataset.id) === track.id);
      });
    }

    PLAYLIST.forEach(track => {
      const row = OSUtils.make('div', { className: 'music-track', 'data-id': track.id });
      row.innerHTML = `
        <span class="music-track-num">${track.id}</span>
        <span style="flex:1">${track.title}</span>
        <span style="opacity:0.5">${track.duration}</span>
      `;
      row.addEventListener('click', () => playTrack(track));
      list.appendChild(row);
    });

    playBtn.addEventListener('click', togglePlay);
  }

  OSAppRegistry.register({
    id: 'music',
    name: 'Music',
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 18V5l12-2v13" stroke="url(#mg1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="url(#mg1)" stroke-width="1.5"/><circle cx="18" cy="16" r="3" stroke="url(#mg1)" stroke-width="1.5"/><defs><linearGradient id="mg1" x1="6" y1="3" x2="21" y2="21"><stop stop-color="#a78bfa"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs></svg>',
    category: 'media',
    color: 'linear-gradient(135deg,rgba(167,139,250,0.25),rgba(236,72,153,0.2))',
    defaultWidth: 360, defaultHeight: 520,
    render, onOpen,
  });
})();
