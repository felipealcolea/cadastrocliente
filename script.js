
const APPS_SCRIPT_URL = 'COLE_AQUI_URL_APPS_SCRIPT';

const form = document.getElementById('cadastroForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');

const vendedor = document.body.dataset.vendedor;
const telefoneVendedor = document.body.dataset.fone;

let isSubmitting = false;

const cpfCnpj = document.getElementById('cpfCnpj');
const cep = document.getElementById('cep');
const telefone1 = document.getElementById('telefone1');
const telefone2 = document.getElementById('telefone2');
const atividade = document.getElementById('atividade');
const outroField = document.getElementById('outroField');
const isento = document.getElementById('isento');
const ie = document.getElementById('ie');

atividade.addEventListener('change',()=>{
  outroField.classList.toggle('hidden',atividade.value!=='Outro');
});

isento.addEventListener('change',()=>{
  ie.disabled=isento.checked;
  ie.value=isento.checked?'ISENTO':'';
});

function onlyNumbers(v){return v.replace(/\D/g,'');}

function formatCpfCnpj(v){
 v=onlyNumbers(v);
 if(v.length<=11){
  v=v.replace(/(\d{3})(\d)/,'$1.$2');
  v=v.replace(/(\d{3})(\d)/,'$1.$2');
  v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');
 }else{
  v=v.replace(/^(\d{2})(\d)/,'$1.$2');
  v=v.replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3');
  v=v.replace(/\.(\d{3})(\d)/,'.$1/$2');
  v=v.replace(/(\d{4})(\d)/,'$1-$2');
 }
 return v;
}

cpfCnpj.addEventListener('input',e=>{
 e.target.value=formatCpfCnpj(e.target.value);
});

function formatPhone(v){
 v=onlyNumbers(v);
 v=v.replace(/^(\d{2})(\d)/g,'($1) $2');
 v=v.replace(/(\d{5})(\d)/,'$1-$2');
 return v;
}

telefone1.addEventListener('input',e=>{
 e.target.value=formatPhone(e.target.value);
});

telefone2.addEventListener('input',e=>{
 e.target.value=formatPhone(e.target.value);
});

cep.addEventListener('input',e=>{
 let v=onlyNumbers(e.target.value);
 v=v.replace(/(\d{5})(\d)/,'$1-$2');
 e.target.value=v;
});

cep.addEventListener('blur',async()=>{
 const cepValue=onlyNumbers(cep.value);
 if(cepValue.length!==8)return;

 document.getElementById('cepStatus').innerText='Buscando endereço...';

 try{
   const response=await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
   const data=await response.json();

   if(data.erro){
     document.getElementById('cepStatus').innerText='CEP inválido';
     return;
   }

   document.getElementById('rua').value=data.logradouro||'';
   document.getElementById('bairro').value=data.bairro||'';
   document.getElementById('cidade').value=data.localidade||'';
   document.getElementById('estado').value=data.uf||'';
   document.getElementById('cepStatus').innerText='';
 }catch{
   document.getElementById('cepStatus').innerText='Erro ao consultar CEP';
 }
});

form.addEventListener('submit',async(e)=>{
 e.preventDefault();

 if(isSubmitting)return;

 isSubmitting=true;
 submitBtn.disabled=true;
 submitBtn.innerText='ENVIANDO...';

 const now=new Date();

 const payload={
   DataHora:now.toLocaleString('pt-BR'),
   Vendedor:vendedor,
   CPFCNPJ:cpfCnpj.value,
   RazaoSocial:document.getElementById('razaoSocial').value,
   NomeFantasia:document.getElementById('nomeFantasia').value,
   InscricaoEstadual:ie.value,
   CEP:cep.value,
   Rua:document.getElementById('rua').value,
   Numero:document.getElementById('numero').value,
   Complemento:document.getElementById('complemento').value,
   Bairro:document.getElementById('bairro').value,
   Cidade:document.getElementById('cidade').value,
   Estado:document.getElementById('estado').value,
   Telefone1:telefone1.value,
   Telefone2:telefone2.value,
   NomeContato:document.getElementById('nomeContato').value,
   Email:document.getElementById('email').value,
   TipoAtividade:atividade.value==='Outro'?document.getElementById('atividadeOutro').value:atividade.value,
   DataInicioEmpresa:document.getElementById('dataInicio').value,
   HorarioRecebimento:document.getElementById('horarioRecebimento').value
 };

 try{

   if(APPS_SCRIPT_URL!=='COLE_AQUI_URL_APPS_SCRIPT'){
     await fetch(APPS_SCRIPT_URL,{
       method:'POST',
       mode:'no-cors',
       headers:{'Content-Type':'application/json'},
       body:JSON.stringify(payload)
     });
   }

   const mensagem=`📋 *NOVO CADASTRO DE CLIENTE – FBF*

👤 *Nome Contato:* ${payload.NomeContato}

🏢 *Razão Social:* ${payload.RazaoSocial}
🏷 *Nome Fantasia:* ${payload.NomeFantasia}

📄 *CPF/CNPJ:* ${payload.CPFCNPJ}

📞 *Telefone:* ${payload.Telefone1}

👨‍💼 *Vendedor:* ${payload.Vendedor}

⏰ ${payload.DataHora}`;

   successMessage.innerHTML=`Cadastro enviado com sucesso para ${vendedor}<br>${payload.DataHora}`;

   form.reset();

   setTimeout(()=>{
     window.location.href=`https://wa.me/${telefoneVendedor}?text=${encodeURIComponent(mensagem)}`;
   },1000);

 }catch{
   alert('Erro ao enviar cadastro.');
 }

 isSubmitting=false;
 submitBtn.disabled=false;
 submitBtn.innerText='Enviar Cadastro';
});
