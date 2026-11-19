const tipo=nexoSelectedRole();
document.getElementById('role-title').textContent=tipo==='adolescente'?'Entrar como filho(a)':'Entrar como responsável';
document.getElementById('role-subtitle').textContent=tipo==='adolescente'?'Acesse suas tarefas e conquistas.':'Acompanhe tarefas, metas e sua família.';
document.getElementById('signup-link').href='cadastro.html?tipo='+tipo;
document.getElementById('togglePassword').onclick=()=>{const el=document.getElementById('senha');el.type=el.type==='password'?'text':'password'};
document.getElementById('loginForm').addEventListener('submit',async e=>{
 e.preventDefault();const email=document.getElementById('email').value.trim().toLowerCase(),senha=document.getElementById('senha').value;
 if(!email||!senha){alert('Preencha todos os campos.');return}
 try{const user=nexoGetUsers().find(u=>u.email===email);
 if(!user){alert('E-mail/usuário ou senha incorretos.');return}
 const hash=await nexoHashPassword(senha,user.passwordSalt);
 if(hash.hash!==user.passwordHash){alert('E-mail/usuário ou senha incorretos.');return}
 if(nexoAccountRole(user)!==tipo){alert('Esta conta foi cadastrada como '+(nexoAccountRole(user)==='adolescente'?'filho(a)':'responsável')+'. Volte e selecione a opção correta.');return}
 sessionStorage.setItem(NEXO_SESSION_KEY,user.id);nexoEnterAccount(user);
 }catch(err){alert(err.message||'Não foi possível entrar.');console.error(err)}
});
