/**
 * Content Viewer - GitBook-like thesis navigation
 * Dynamically loads markdown chapters from manuscript/content
 */
(function(){
  const MANUSCRIPT_BASE = '../manuscript/content';
  const CHAPTERS = [
    'Introduction.md',
    'Aims_&_Objectives.md',
    'Significance_&_prevelance.md',
    'Diagnostic_approaches_to_AUB.md',
    'nomenclature_&_classification.md',
    'Literature_review.md',
    'Methodology.md',
    'Results_&_observation.md',
    'Discussions.md',
    'Conclusions.md',
    'Recommendations.md',
    'Limitations.md',
    'Summary.md',
    'Bibliography.md'
  ];

  function initContentViewer(){
    const nav = document.getElementById('content-nav');
    const viewer = document.getElementById('content-viewer');
    if(!nav || !viewer) return;
    const initial = viewer.getAttribute('data-initial');
    buildNav(nav, initial);
    loadChapter(initial, false);
    const filterInput = document.getElementById('content-filter');
    if (filterInput) {
      filterInput.addEventListener('input', () => filterNav(filterInput.value.trim().toLowerCase(), nav));
    }
  }

  function buildNav(container, current){
    container.innerHTML = '';
    CHAPTERS.forEach(ch => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = prettify(ch);
      btn.dataset.file = ch;
      if (ch === current) btn.classList.add('active');
      btn.addEventListener('click', () => { loadChapter(ch, true); setActive(ch); });
      li.appendChild(btn); container.appendChild(li);
    });
  }

  function filterNav(query, nav){
    const buttons = nav.querySelectorAll('button');
    buttons.forEach(b => {
      const match = b.textContent.toLowerCase().includes(query);
      b.parentElement.style.display = match ? '' : 'none';
    });
  }

  async function loadChapter(file, pushHistory){
    const body = document.getElementById('content-body');
    const loading = document.getElementById('content-loading');
    const error = document.getElementById('content-error');
    if(!body) return;
    show(loading); hide(error); body.innerHTML='';
    try {
      const res = await fetch(`${MANUSCRIPT_BASE}/${file}`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const md = await res.text();
      const html = renderMarkdown(md);
      body.innerHTML = html + buildPrevNext(file);
      enhanceHeadings();
      if(pushHistory && window.history) {
        history.replaceState({chapter:file}, '', `#content-${file.replace(/\W+/g,'-')}`);
      }
      setActive(file);
      window.scrollTo({top: document.getElementById('content').offsetTop - 60, behavior:'smooth'});
    } catch (e) {
      error.textContent = 'Failed to load chapter: ' + e.message;
      show(error);
    } finally {
      hide(loading);
    }
  }

  function setActive(file){
    document.querySelectorAll('#content-nav button').forEach(b=>{
      b.classList.toggle('active', b.dataset.file === file);
    });
  }

  function prettify(name){
    return name.replace(/_/g,' ').replace(/\.md$/,'').replace(/&/g,'&').replace(/\b(md)\b/i,'').trim();
  }

  function escapeHtml(str){
    return str.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;","<":"&lt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  function renderMarkdown(md){
    let html = escapeHtml(md);
    html = html.replace(/```([\s\S]*?)```/g, (m,code)=>`<pre class="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto"><code>${code.replace(/\n/g,'<br>')}</code></pre>`);
    html = html.replace(/^###### (.*)$/gm,'<h6>$1</h6>')
               .replace(/^##### (.*)$/gm,'<h5>$1</h5>')
               .replace(/^#### (.*)$/gm,'<h4>$1</h4>')
               .replace(/^### (.*)$/gm,'<h3>$1</h3>')
               .replace(/^## (.*)$/gm,'<h2>$1</h2>')
               .replace(/^# (.*)$/gm,'<h1>$1</h1>');
    html = html.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
               .replace(/\*([^*]+)\*/g,'<em>$1</em>');
    html = html.replace(/^(?:- |\* )(.*)$/gm,'<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, m=>`<ul>${m}</ul>`);
    html = html.replace(/^(\d+)\. (.*)$/gm,'<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, m=> m.startsWith('<ul>')? m : `<ol>${m}</ol>`);
    html = html.replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank" rel="noopener" class="text-teal-600 dark:text-teal-400 hover:underline">$1<\/a>');
    html = html.replace(/(^|\n)([^\n<][^\n]*)(?=\n|$)/g,(m,prefix,line)=> /<(h\d|ul|ol|li|pre|blockquote)/.test(line)? m : `${prefix}<p>${line.trim()}</p>`);
    return html;
  }

  function enhanceHeadings(){
    const body = document.getElementById('content-body');
    const headings = body.querySelectorAll('h2,h3');
    headings.forEach(h=>{
      const id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      if(!h.id) h.id = id;
      const anchor = document.createElement('a');
      anchor.href = `#${id}`; anchor.textContent = '§';
      anchor.className = 'content-heading-anchor text-teal-500';
      h.appendChild(anchor);
    });
  }

  function buildPrevNext(current){
    const idx = CHAPTERS.indexOf(current);
    let prev = null, next = null;
    if (idx > 0) prev = CHAPTERS[idx-1];
    if (idx >=0 && idx < CHAPTERS.length-1) next = CHAPTERS[idx+1];
    if(!prev && !next) return '';
    return `<div class="content-prev-next">\n      <div>${prev? `<a href=\"#\" data-nav=\"${prev}\" class=\"prev-link\">← ${prettify(prev)}`:''}</a></div>\n      <div>${next? `<a href=\"#\" data-nav=\"${next}\" class=\"next-link\">${prettify(next)} →` : ''}</a></div>\n    </div>`;
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-nav]');
    if(link){
      e.preventDefault();
      const file = link.getAttribute('data-nav');
      loadChapter(file, true);
    }
  });

  function show(el){ if(el) el.classList.remove('hidden'); }
  function hide(el){ if(el) el.classList.add('hidden'); }

  window.initContentViewer = initContentViewer;
})();