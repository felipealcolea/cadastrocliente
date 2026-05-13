
const APPS_SCRIPT_URL = 'COLE_AQUI_URL_APPS_SCRIPT';

const form = document.getElementById('cadastroForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');

const params = new URLSearchParams(window.location.search);
const vendedor = params.get('vendedor') || 'Vendedor';
const telefoneVendedor = params.get('fone') || '';

let isSubmitting = false;

const cpfCnpj = document.getElementById('cpfCnpj');
const cep = document.getElementById('cep');
const telefone1 = document.getElementById('telefone1');
const telefone2 = document.getElementById('telefone2');
const atividade = document.getElementById('atividade');
const outroField = document.getElementById('outroField');
const isento = document.getElementById('isento');
const ie = document.getElementById('ie');

atividade.addEventListener('change', () => {
  outroField.classList.toggle('hidden', atividade.value !== 'Outro');
});

isento.addEventListener('change', () => {
  ie.disabled = isento.checked;
  if (isento.checked) {
    ie.value = 'ISENTO';
  } else {
    ie.value = '';
  }
});

function onlyNumbers(value) {
  return value.replace(/\D/g, '');
}

function formatCpfCnpj(value) {
  value = onlyNumbers(value);

  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
  }

  return value;
}

cpfCnpj.addEventListener('input', (e) => {
  e.target.value = formatCpfCnpj(e.target.value);
});

function formatPhone(value) {
  value = onlyNumbers(value);
  value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  return value;
}

telefone1.addEventListener('input', (e) => {
  e.target.value = formatPhone(e.target.value);
});

telefone2.addEventListener('input', (e) => {
  e.target.value = formatPhone(e.target.value);
});

cep.addEventListener('input', (e) => {
  let value = onlyNumbers(e.target.value);
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  e.target.value = value;
});

cep.addEventListener('blur', async () => {
  const cepValue = onlyNumbers(cep.value);

  if (cepValue.length !== 8) return;

  document.getElementById('cepStatus').innerText = 'Buscando endereço...';

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
    const data = await response.json();

    if (data.erro) {
      document.getElementById('cepStatus').innerText = 'CEP inválido';
      return;
    }

    document.getElementById('rua').value = data.logradouro || '';
    document.getElementById('bairro').value = data.bairro || '';
    document.getElementById('cidade').value = data.localidade || '';
    document.getElementById('estado').value = data.uf || '';

    document.getElementById('cepStatus').innerText = '';
  } catch {
    document.getElementById('cepStatus').innerText = 'Erro ao consultar CEP';
  }
});

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (isSubmitting) return;

  const email = document.getElementById('email').value.trim();

  if (!validateEmail(email)) {
    alert('Digite um e-mail válido.');
    return;
  }

  isSubmitting = true;
  submitBtn.disabled = true;
  submitBtn.innerText = 'ENVIANDO...';

  const now = new Date();

  const payload = {
    DataHora: now.toLocaleString('pt-BR'),
    Vendedor: vendedor,
    TelefoneVendedor: telefoneVendedor,
    CPFCNPJ: cpfCnpj.value.trim(),
    RazaoSocial: document.getElementById('razaoSocial').value.trim(),
    NomeFantasia: document.getElementById('nomeFantasia').value.trim(),
    InscricaoEstadual: ie.value.trim(),
    CEP: cep.value.trim(),
    Rua: document.getElementById('rua').value.trim(),
    Numero: document.getElementById('numero').value.trim(),
    Complemento: document.getElementById('complemento').value.trim(),
    Bairro: document.getElementById('bairro').value.trim(),
    Cidade: document.getElementById('cidade').value.trim(),
    Estado: document.getElementById('estado').value.trim(),
    Telefone1: telefone1.value.trim(),
    Telefone2: telefone2.value.trim(),
    NomeContato: document.getElementById('nomeContato').value.trim(),
    Email: email,
    TipoAtividade: atividade.value === 'Outro'
      ? document.getElementById('atividadeOutro').value.trim()
      : atividade.value,
    DataInicioEmpresa: document.getElementById('dataInicio').value
  };

  try {
    if (APPS_SCRIPT_URL !== 'COLE_AQUI_URL_APPS_SCRIPT') {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    }

    const mensagem = `📋 *NOVO CADASTRO DE CLIENTE – FBF*

👤 *Nome Contato:* ${payload.NomeContato}

🏢 *Razão Social:* ${payload.RazaoSocial}
🏷 *Nome Fantasia:* ${payload.NomeFantasia}

📄 *CPF/CNPJ:* ${payload.CPFCNPJ}
🧾 *Inscrição Estadual:* ${payload.InscricaoEstadual}

📍 *Endereço:*
${payload.Rua}, ${payload.Numero}
${payload.Bairro} - ${payload.Cidade}/${payload.Estado}
CEP: ${payload.CEP}

📞 *Telefone 1:* ${payload.Telefone1}
📞 *Telefone 2:* ${payload.Telefone2}

📧 *E-mail:* ${payload.Email}

🍔 *Tipo de Atividade:* ${payload.TipoAtividade}

📅 *Início Empresa:* ${payload.DataInicioEmpresa}

👨‍💼 *Vendedor:* ${payload.Vendedor}

⏰ Cadastro enviado em:
${payload.DataHora}`;

    successMessage.innerHTML = `
      Cadastro enviado com sucesso para ${vendedor}<br>
      ${payload.DataHora}
    `;

    form.reset();

    setTimeout(() => {
      window.location.href = `https://wa.me/${telefoneVendedor}?text=${encodeURIComponent(mensagem)}`;
    }, 1200);

  } catch (error) {
    alert('Erro ao enviar cadastro. Tente novamente.');
  } finally {
    isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.innerText = 'Enviar Cadastro';
  }
});
