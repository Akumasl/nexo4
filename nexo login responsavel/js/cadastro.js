const tipo=nexoSelectedRole();
document.getElementById('role-title').textContent=tipo==='adolescente'?'Cadastro do filho(a)':'Cadastro do responsável';
document.getElementById('role-subtitle').textContent=tipo==='adolescente'?'Vincule sua conta ao responsável pelo código NEXO.':'Crie sua conta para acompanhar sua família.';
document.getElementById('back-login').href='login.html?tipo='+tipo;
document.getElementById('codigo-box').hidden=tipo!=='adolescente';document.getElementById('code-hint').hidden=tipo!=='adolescente';
document.getElementById('cadastroForm').addEventListener('submit',async event=>{
 event.preventDefault();const nome=document.getElementById('nome').value.trim(),email=document.getElementById('email').value.trim().toLowerCase(),senha=document.getElementById('senha').value,confirmacao=document.getElementById('confirmacao').value;
 if(!nome||!email||!senha||!confirmacao){alert('Preencha todos os campos.');return}
 if(senha.length<6){alert('A senha deve ter pelo menos 6 caracteres.');return}
 if(senha!==confirmacao){alert('As senhas não são iguais.');return}
 const users=nexoGetUsers();if(users.some(u=>u.email===email)){alert('Esta conta já existe.');return}
 let linked=null;
 if(tipo==='adolescente'){
   linked=nexoFindChildCode(document.getElementById('codigo').value);
   if(!linked){alert('Código inválido. Peça ao responsável para adicionar você em Meus filhos e compartilhar seu ID NX-.');return}
   if(users.some(u=>u.tipo==='adolescente'&&(u.perfis||[]).some(p=>p.ownerId===linked.owner.id&&p.id===linked.profile.id))){alert('Este código já está vinculado a outra conta.');return}
 }
 try{const password=await nexoHashPassword(senha);
 const profiles=tipo==='adolescente'?[{...linked.profile,ownerId:linked.owner.id}]:[{id:nexoCreateId(),nome,avatar:'avatar5',tipo:'responsavel',criadoEm:new Date().toISOString()}];
 const user={id:nexoCreateId(),nome,email,tipo,passwordSalt:password.salt,passwordHash:password.hash,perfis:profiles,criadoEm:new Date().toISOString()};
 users.push(user);nexoSaveUsers(users);sessionStorage.setItem(NEXO_SESSION_KEY,user.id);nexoEnterAccount(user);
 }catch(error){alert(error.message||'Não foi possível criar a conta.');console.error(error)}
});
