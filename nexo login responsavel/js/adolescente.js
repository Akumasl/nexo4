/* NEXO: área adolescente; lê/grava o mesmo registro familiar do responsável. */
(() => {
 const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
 const user=nexoRequireLogin();if(!user)return;
 let choice;try{choice=JSON.parse(sessionStorage.getItem('perfilSelecionado')||'null')}catch{choice=null}
 const profile=(user.perfis||[]).find(p=>p.id===choice?.id && p.tipo==='adolescente');
 if(!profile || (user.tipo && user.tipo!=='adolescente')){location.replace('index.html');return}
 const ownerId=profile.ownerId||user.id;
 const key=`nexo_responsavel_${ownerId}_${profile.parentId}`;
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let data,child,filter='today',feedFilter='family',taskSelected=null,stream=null,captured=null;
 const storage=()=>NexoFamilia.getParentData(ownerId,profile.parentId);
 function load(){data=storage();child=data?.children?.find(c=>c.id===profile.childId);return !!child}
 if(!load()){$('main').innerHTML='<div class="empty">O perfil não está vinculado a um adolescente. Peça ao responsável para verificar o cadastro.</div>';return}
 const save=()=>NexoFamilia.saveParentData(ownerId,profile.parentId,data);
 const allTasks=()=>data.tasks.filter(t=>t.childId===child.id);
 const goal=()=>data.goals.find(g=>g.childId===child.id&&g.active);
 const toast=m=>{const e=$('#toast');e.textContent=m;e.style.display='block';setTimeout(()=>e.style.display='none',2500)};
 function goalHTML(g){if(!g)return '<div class="panel empty">Nenhuma meta ativa ainda. Peça ao responsável para criar uma!</div>';const pct=Math.min(100,Math.round(child.points/g.target*100));return `<p class="eyebrow">MINHA META</p><div class="goal-inner"><span class="goal-icon">${esc(g.icon||'🎯')}</span><div><div class="goal-name">${esc(g.name)}</div><div class="goal-points">${child.points.toLocaleString('pt-BR')} / ${g.target.toLocaleString('pt-BR')} pontos</div></div></div><div class="progress"><div class="bar" style="width:${pct}%"></div></div><div class="progress-note"><span>⭐ Faltam ${Math.max(0,g.target-child.points)} pontos</span><span>${pct}%</span></div>`}
 function taskHTML(t){return `<button type="button" class="task" data-task="${esc(t.id)}"><span class="task-icon">${esc(t.icon||'⭐')}</span><span class="task-body"><strong>${esc(t.name)}</strong><small>+${Number(t.points)||0} pontos${t.status==='done'?' · Concluída':''}</small></span><span class="task-status ${t.status==='done'?'done':''}">${t.status==='done'?'✓':''}</span></button>`}
 function render(){if(!load())return;
   $('#teen-name').textContent=profile.nome.split(' ')[0];$('#profile-name').textContent=profile.nome;$('#profile-avatar').textContent=child.avatar||'👧';$('#avatar').textContent=child.avatar||'👧';$('#copy-code').textContent=profile.codigo||child.codigo||'ID indisponível';
   const tasks=allTasks(),todays=tasks.filter(t=>t.date===today());const finished=todays.filter(t=>t.status==='done').length;
   $('#progress-label').textContent=`${finished}/${todays.length} concluídas`;
   $('#home-goal').innerHTML=goalHTML(goal());
   $('#today-tasks').innerHTML=todays.length?todays.map(taskHTML).join(''):'<p class="empty">Ainda não há tarefas para hoje! ✨</p>';
   const listing=filter==='today'?todays:filter==='done'?tasks.filter(t=>t.status==='done'):tasks;
   $('#all-tasks').innerHTML=listing.length?listing.map(taskHTML).join(''):'<p class="empty">Nenhuma tarefa encontrada.</p>';
   $('#goal-detail').innerHTML=`<article class="panel goal">${goalHTML(goal())}</article>`;
   $('#badges').innerHTML=[10,50,100,200].map(x=>`<div title="${x} pontos" class="${child.points>=x?'badge-earned':'badge-locked'}">${child.points>=x?'🏅':'🔒'}</div>`).join('');
   $('#profile-points').textContent=`⭐ ${child.points} pontos acumulados`;
   $('#profile-count').textContent=`✅ ${tasks.filter(t=>t.status==='done').length} tarefas concluídas`;
   const posts=(data.posts||[]).filter(p=>feedFilter==='family'||p.childId===child.id);
   $('#feed').innerHTML=posts.length?posts.slice().reverse().map((p,i)=>`<article class="post"><div class="post-head"><span>👧</span><div>${esc(p.author)}<small>${new Date(p.created).toLocaleString('pt-BR')}</small></div></div><p>${esc(p.text)}</p>${p.image?`<img src="${p.image}" alt="Foto compartilhada">`:''}<button type="button" data-like="${esc(p.id)}">💗 ${p.likes||0}</button></article>`).join(''):'<p class="empty">Ainda não há momentos compartilhados. 💜</p>';
 }
 function stopCamera(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}$('#camera-preview').hidden=true;$('#take-photo').textContent='📸 Tirar foto'}
 function openTask(id){if(!load())return;taskSelected=data.tasks.find(t=>t.id===id&&t.childId===child.id);if(!taskSelected)return;captured=null;stopCamera();$('#task-title').textContent=taskSelected.name;$('#task-dialog-body').innerHTML=`<div class="task-reward">+${Number(taskSelected.points)} pontos</div><p class="task-description">${esc(taskSelected.description||'Faça a atividade com atenção. Depois tire uma foto para comprovar.')}</p>`;$('#captured-photo').hidden=true;$('#submit-task').disabled=true;const done=taskSelected.status==='done';$('#take-photo').hidden=done;$('#submit-task').hidden=done;$('#photo-message').textContent=done?'Esta tarefa já foi concluída.':'Tire uma foto agora para confirmar a tarefa.';$('#task-dialog').showModal()}
 async function takePhoto(){if(!stream){try{if(!navigator.mediaDevices?.getUserMedia)throw Error('Câmera indisponível neste navegador.');stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});$('#camera-preview').srcObject=stream;$('#camera-preview').hidden=false;$('#take-photo').textContent='📷 Capturar agora';$('#photo-message').textContent='Enquadre a tarefa e toque em capturar.'}catch(e){toast('Permita acesso à câmera usando localhost ou HTTPS.');$('#photo-message').textContent=e.message}return}
 const video=$('#camera-preview');if(!video.videoWidth){toast('A câmera ainda está iniciando.');return}const canvas=$('#camera-canvas'),max=700,scale=Math.min(1,max/video.videoWidth);canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);captured=canvas.toDataURL('image/jpeg',.56);$('#captured-photo').src=captured;$('#captured-photo').hidden=false;stopCamera();$('#submit-task').disabled=false;$('#take-photo').textContent='🔄 Tirar outra foto';$('#photo-message').textContent='Foto capturada! Agora confirme a tarefa.';
 }
 function submit(){if(!captured||!taskSelected)return;const fresh=storage(),t=fresh?.tasks?.find(x=>x.id===taskSelected.id&&x.childId===child.id),c=fresh?.children?.find(x=>x.id===child.id);if(!t||!c||t.status==='done'){toast('Esta tarefa já foi concluída ou removida.');$('#task-dialog').close();render();return}
 t.status='done';t.completedAt=new Date().toISOString();t.proof=captured;c.points=(Number(c.points)||0)+(Number(t.points)||0);fresh.history.push({id:crypto.randomUUID(),task:t.name,child:c.name,childId:c.id,points:Number(t.points),date:today(),proof:captured});
 try{NexoFamilia.saveParentData(ownerId,profile.parentId,fresh)}catch(e){delete t.proof;delete fresh.history[fresh.history.length-1].proof;try{NexoFamilia.saveParentData(ownerId,profile.parentId,fresh)}catch{toast('Armazenamento cheio. Não foi possível confirmar.');return}}
 const points=t.points;$('#task-dialog').close();$('#done-points').textContent=`+${points} pontos`;$('#done-preview').innerHTML=`<img alt="Foto de comprovação" src="${captured}">`;captured=null;$('#done-dialog').showModal();render();}
 $$('[data-screen]').forEach(b=>b.onclick=()=>{$$('.screen').forEach(s=>s.classList.toggle('active',s.id===`screen-${b.dataset.screen}`));$$('[data-screen]').forEach(x=>x.classList.toggle('selected',x===b));render();scrollTo(0,0)});
 $('#avatar').onclick=()=>document.querySelector('[data-screen="perfil"]').click();
 document.addEventListener('click',e=>{const t=e.target.closest('[data-task]');if(t)openTask(t.dataset.task);const l=e.target.closest('[data-like]');if(l){const fresh=storage();const post=(fresh.posts||[]).find(p=>p.id===l.dataset.like);if(post){post.likes=(post.likes||0)+1;NexoFamilia.saveParentData(ownerId,profile.parentId,fresh);render()}}});
 $$('.filter').forEach(b=>b.onclick=()=>{if(b.dataset.filter){filter=b.dataset.filter;$$('[data-filter]').forEach(x=>x.classList.toggle('active',x===b))}if(b.dataset.feed){feedFilter=b.dataset.feed;$$('[data-feed]').forEach(x=>x.classList.toggle('active',x===b))}render()});
 $('#take-photo').onclick=takePhoto;$('#submit-task').onclick=submit;
 $$('[data-close]').forEach(b=>b.onclick=()=>{const d=document.getElementById(b.dataset.close);d.close();if(d.id==='task-dialog')stopCamera()});$('#task-dialog').addEventListener('close',stopCamera);
 $('#share-moment').onclick=()=>$('#post-dialog').showModal();
 $('#save-post').onclick=()=>{const text=$('#post-text').value.trim();if(!text){toast('Escreva um momento para compartilhar.');return}const fresh=storage();fresh.posts=fresh.posts||[];fresh.posts.push({id:crypto.randomUUID(),childId:child.id,author:child.name,text,created:new Date().toISOString(),likes:0});NexoFamilia.saveParentData(ownerId,profile.parentId,fresh);$('#post-text').value='';$('#post-dialog').close();render();toast('Momento publicado!')};
 $('#copy-code').onclick=async()=>{try{await navigator.clipboard.writeText(profile.codigo||child.codigo);toast('ID copiado!')}catch{toast('Selecione e copie o ID acima.')}};
 $('#theme-button').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('nexo_theme',document.body.classList.contains('dark')?'dark':'light')};if(localStorage.getItem('nexo_theme')==='dark')document.body.classList.add('dark');
 $('#logout').onclick=nexoLogout;
 window.addEventListener('storage',e=>{if(e.key===key)render()});window.addEventListener('focus',render);
 render();
})();
