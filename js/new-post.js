/* ═══ NEW POST COMPONENT ═══ */

let newPostType = 'normal';

function openNewPost(){
  document.getElementById('newpostOverlay').classList.add('open');
  document.getElementById('newpostText').focus();
}

function closeNewPost(){
  document.getElementById('newpostOverlay').classList.remove('open');
  document.getElementById('newpostText').value = '';
  selectPostType('normal');
}

function selectPostType(type){
  newPostType = type;
  document.querySelectorAll('.newpost-type').forEach(t=>{
    t.classList.toggle('active', t.dataset.type===type);
  });
  const hint = document.getElementById('newpostAskHint');
  if(hint) hint.style.display = type==='ask' ? 'flex' : 'none';
  const ta = document.getElementById('newpostText');
  if(type==='ask') ta.placeholder = 'Ne konuda yardıma ihtiyacın var?';
  else if(type==='recipe') ta.placeholder = 'Tarif hakkında bir şeyler yaz...';
  else ta.placeholder = 'Ne düşünüyorsun?';
}

function publishPost(){
  const text = document.getElementById('newpostText').value.trim();
  if(!text) return;
  const newPost = {
    id: Date.now(),
    postType: newPostType,
    user: { name:'Furkan', avatar:'https://i.pravatar.cc/80?img=11', handle:'@furkan', isChef:false },
    time: 'Az önce',
    text: text,
    img: null,
    likes:0, comments:0, shares:0,
    liked:false, saved:false,
    tags: [],
    filter: 'discover',
  };
  if(newPostType==='ask'){
    newPost.askStatus='open';
    newPost.askReplies=0;
  }
  COMMUNITY_FEED.unshift(newPost);
  closeNewPost();
  renderCommFeed();
  document.getElementById('communityFeed').scrollTop = 0;
}

function showFavorites(){
  console.log('Show favorites');
}
