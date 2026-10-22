const STORAGE_KEY = 'shop-post-preview-v1';
const composer = document.querySelector('#composer');
const form = document.querySelector('#postForm');
const queue = document.querySelector('#queue');
const captionField = document.querySelector('#caption');
const photoField = document.querySelector('#photo');
const channels = [...form.querySelectorAll('input[name="channel"]')];

function toast(message) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.setAttribute('role', 'status');
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 3600);
}

function loadPosts() {
  try {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(posts) ? posts.filter(post => post && typeof post.caption === 'string') : [];
  } catch {
    return [];
  }
}

function savePosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  } catch {
    toast('This browser could not save the draft. Check available storage, then try again.');
    return false;
  }
}

function getTimeLabel(value) {
  if (!value) return 'Draft';
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}).format(date);
}

function renderPosts() {
  document.querySelectorAll('.queued-post').forEach(row => row.remove());
  const posts = loadPosts().sort((a,b) => (a.publishAt || '9999').localeCompare(b.publishAt || '9999'));
  const empty = document.querySelector('#emptyState');
  empty.hidden = posts.length > 0;
  document.querySelector('#queueCount').textContent = `${posts.length} ${posts.length === 1 ? 'draft' : 'drafts'}`;
  document.querySelector('#queueSummary').textContent = posts.length ? `${posts.length} ${posts.length === 1 ? 'draft is' : 'drafts are'} saved in this browser.` : 'No drafts saved in this browser.';

  for (const post of posts) {
    const row = document.createElement('article');
    row.className = 'planner-title queued-post';
    const text = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = post.listing?.title || post.caption;
    const subline = document.createElement('small');
    const channelText = (post.channels || []).join(' · ') || 'No channel';
    subline.textContent = `${channelText} · ${post.photoName ? `Photo: ${post.photoName} · ` : ''}${getTimeLabel(post.publishAt)}`;
    text.append(title, subline);
    const status = document.createElement('span');
    status.className = 'queue-count';
    status.textContent = post.publishAt ? 'Time noted' : 'Draft';
    const remove = document.createElement('button');
    remove.className = 'remove-draft';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove draft: ${post.listing?.title || post.caption.slice(0, 48)}`);
    remove.addEventListener('click', () => {
      const remaining = loadPosts().filter(item => item.id !== post.id);
      if (savePosts(remaining)) {
        renderPosts();
        toast('Draft removed from this browser.');
      }
    });
    row.append(text, status, remove);
    queue.append(row);
  }
}

function openComposer(event) {
  event?.preventDefault();
  composer.showModal();
  captionField.focus();
}

document.querySelectorAll('#newPost,#emptyCreate,#navCompose').forEach(button => button.addEventListener('click', openComposer));
document.querySelector('#dismissNotice').addEventListener('click', () => document.querySelector('.notice').remove());
document.querySelector('#manageChannels').addEventListener('click', () => document.querySelector('#channels').scrollIntoView({behavior:'smooth',block:'center'}));

document.querySelectorAll('.connect').forEach(button => button.addEventListener('click', () => {
  toast(`${button.dataset.platform} account connection is not enabled in this preview yet.`);
}));
document.querySelectorAll('.draft').forEach(button => button.addEventListener('click', event => {
  event.preventDefault();
  channels.forEach(input => { input.checked = input.value === 'Carousell'; });
  updateListingFields();
  openComposer();
}));

function updateListingFields() {
  document.querySelector('#listingFields').hidden = !channels.some(input => input.value === 'Carousell' && input.checked);
}
channels.forEach(input => input.addEventListener('change', updateListingFields));

photoField.addEventListener('change', () => {
  const file = photoField.files?.[0];
  document.querySelector('.upload b').textContent = file ? file.name : 'Add product photos';
});

form.addEventListener('submit', event => {
  if (event.submitter?.id !== 'schedulePost') return;
  event.preventDefault();
  const caption = captionField.value.trim();
  const selected = channels.filter(input => input.checked).map(input => input.value);
  const publishAt = document.querySelector('#publishAt').value;
  const isListing = selected.includes('Carousell');
  const listingTitle = document.querySelector('#listingTitle').value.trim();

  if (!caption && !listingTitle) { toast('Add a caption or listing title before saving.'); captionField.focus(); return; }
  if (!selected.length) { toast('Choose at least one channel.'); return; }
  if (publishAt && new Date(publishAt).getTime() <= Date.now()) { toast('Choose a future time, or leave the schedule blank to save a draft.'); return; }
  if (isListing && !listingTitle) { toast('Add a title for your Carousell listing.'); document.querySelector('#listingTitle').focus(); return; }

  const priceValue = document.querySelector('#listingPrice').value;
  const condition = document.querySelector('#listingCondition').value;
  const listing = isListing ? {title:listingTitle, price:priceValue ? Number(priceValue) : null, condition} : null;
  const post = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    caption, channels:selected, publishAt, photoName:photoField.files?.[0]?.name || '', listing,
    createdAt: new Date().toISOString()
  };
  const posts = loadPosts();
  posts.push(post);
  if (!savePosts(posts)) return;
  renderPosts();
  composer.close();
  toast('Draft saved in this browser. Nothing was published.');
  form.reset();
  document.querySelector('.upload b').textContent = 'Add product photos';
  updateListingFields();
});

document.querySelector('.today').textContent = new Intl.DateTimeFormat(undefined, {weekday:'short', month:'short', day:'numeric'}).format(new Date());
renderPosts();
composer.addEventListener('close', () => {
  form.reset();
  document.querySelector('.upload b').textContent = 'Add product photos';
  updateListingFields();
});
