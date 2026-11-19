/* Vínculo local entre responsável e adolescente, sem API externa. */
(function(){
  const prefix='nexo_responsavel_';
  const uid=()=>crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const code=()=> 'NX-'+Array.from(crypto.getRandomValues(new Uint8Array(4)),v=>(v%36).toString(36).toUpperCase()).join('').padEnd(6,'0').slice(0,6);
  function uniqueCode(users){let c;do{c=code()}while(users.some(u=>(u.perfis||[]).some(p=>p.codigo===c)));return c;}
  function bindChild(accountId,parentId,child){
    const users=nexoGetUsers(),idx=users.findIndex(u=>u.id===accountId);if(idx<0)return child;
    const user=users[idx];user.perfis=user.perfis||[];
    let profile=user.perfis.find(p=>p.id===child.profileId);
    if(!profile){
      profile={id:uid(),tipo:'adolescente',nome:child.name,avatar:'avatar5',codigo:uniqueCode(users),parentId,childId:child.id,criadoEm:new Date().toISOString()};
      user.perfis.push(profile);
    }else{
      profile.nome=child.name;profile.tipo='adolescente';profile.parentId=parentId;profile.childId=child.id;
      if(!profile.codigo)profile.codigo=uniqueCode(users);
    }
    child.profileId=profile.id;child.codigo=profile.codigo;nexoSaveUsers(users);return child;
  }
  function syncChildren(accountId,parentId,data){let changed=false;for(const c of data.children||[]){const before=c.profileId+'|'+c.codigo;bindChild(accountId,parentId,c);if(before!==c.profileId+'|'+c.codigo)changed=true;}return changed;}
  function getParentData(accountId,parentId){try{return JSON.parse(localStorage.getItem(`${prefix}${accountId}_${parentId}`)||'null')}catch{return null}}
  function saveParentData(accountId,parentId,data){localStorage.setItem(`${prefix}${accountId}_${parentId}`,JSON.stringify(data));}
  window.NexoFamilia={bindChild,syncChildren,getParentData,saveParentData};
})();
