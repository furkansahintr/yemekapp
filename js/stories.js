/* ═══ STORIES COMPONENT ═══ */

let storyViewerIdx = 0;
let storyTimer = null;

function renderStories(){
  renderCommStories();
}

function viewStory(idx){
  if(STORIES[idx].isOwn && !STORIES[idx].hasNew) return;
  storyViewerIdx = idx;
  const s = STORIES[idx];
  document.getElementById('storyViewerAvatar').src = s.avatar;
  document.getElementById('storyViewerName').textContent = s.name;

  const storyImgs = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=900&fit=crop',
  ];
  document.getElementById('storyViewerImg').src = storyImgs[idx % storyImgs.length];

  const progEl = document.getElementById('storyViewerProgress');
  const totalStories = STORIES.filter(st=>!st.isOwn || st.hasNew).length;
  progEl.innerHTML = '<div class="sv-bar active"><div class="sv-fill"></div></div>';

  document.getElementById('storyViewer').classList.add('open');

  clearTimeout(storyTimer);
  storyTimer = setTimeout(()=>nextStory(), 5000);
}

function nextStory(){
  clearTimeout(storyTimer);
  let next = storyViewerIdx + 1;
  while(next < STORIES.length && STORIES[next].isOwn && !STORIES[next].hasNew) next++;
  if(next >= STORIES.length){
    closeStoryViewer();
    return;
  }
  viewStory(next);
}

function prevStory(){
  clearTimeout(storyTimer);
  let prev = storyViewerIdx - 1;
  while(prev >= 0 && STORIES[prev].isOwn && !STORIES[prev].hasNew) prev--;
  if(prev < 0) return;
  viewStory(prev);
}

function closeStoryViewer(){
  clearTimeout(storyTimer);
  document.getElementById('storyViewer').classList.remove('open');
}
