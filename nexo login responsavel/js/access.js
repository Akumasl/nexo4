// Seleção explícita do tipo de acesso. Não use isto como segurança no servidor.
function nexoSelectedRole(){return new URLSearchParams(location.search).get('tipo')==='adolescente'?'adolescente':'responsavel'}
function nexoIsChildAccount(user){return user.tipo==='adolescente'}
function nexoAccountRole(user){return nexoIsChildAccount(user)?'adolescente':'responsavel'}
function nexoEnterAccount(user){
  const role=nexoAccountRole(user);
  const profiles=(user.perfis||[]).filter(p=>p.tipo===role);
  if(profiles.length===1){sessionStorage.setItem('perfilSelecionado',JSON.stringify(profiles[0]));location.href=role==='adolescente'?'adolescente.html':'responsavel.html';}
  else {sessionStorage.removeItem('perfilSelecionado');location.href='perfis.html';}
}
function nexoFindChildCode(code){
  const normalized=String(code||'').trim().toUpperCase();
  for(const owner of nexoGetUsers())for(const profile of owner.perfis||[]){
    if(profile.tipo==='adolescente'&&profile.codigo?.toUpperCase()===normalized){
      const data=window.NexoFamilia?.getParentData(owner.id,profile.parentId);
      if(data?.children?.some(c=>c.id===profile.childId))return {owner,profile};
    }
  }
  return null;
}
