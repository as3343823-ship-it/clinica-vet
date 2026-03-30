/**
 * Organizador de Documentos - Sistema multi-família
 * Cadastro, Login, documentos por usuário
 * Armazenamento em LocalStorage
 */

const STORAGE_KEYS = {
    USUARIOS: 'organizador_usuarios',
    DOCUMENTOS: 'organizador_documentos',
    PASTAS: 'organizador_pastas',
    CONFIG: 'organizador_config',
    SESSION: 'organizador_session',
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Estado
let usuarios = [];
let documentos = [];
let pastas = [];
let config = { tema: 'claro', corFundo: 'azul', corSidebar: 'azul' };
let usuarioLogado = null;
let familiaAtual = null;
let itemParaExcluir = null;
let tipoExclusao = '';

const CORES_FUNDO = { azul: '#f0f4f8', preto: '#1a1a1a', rosa: '#fdf2f8', verde: '#f0fff4', branco: '#ffffff', cinza: '#f7fafc' };
const CORES_SIDEBAR = { azul: '#2c5282', preto: '#1a1a1a', verde: '#276749', roxo: '#553c9a', cinza: '#4a5568' };
const CORES_FUNDO_ESCURO = { azul: '#0d1117', preto: '#0a0a0a', rosa: '#1a0f14', verde: '#0f1a14', branco: '#1a202c', cinza: '#1a1d21' };

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session) {
        try {
            const { usuarioId, familiaId } = JSON.parse(session);
            const usuario = usuarios.find(u => u.id === usuarioId);
            if (usuario && usuario.familias?.includes(familiaId)) {
                usuarioLogado = usuario;
                familiaAtual = familiaId;
                aplicarConfiguracoes();
                mostrarApp();
                inicializarEventos();
                renderizarFamiliaTabs();
                atualizarSidebarUsuario();
                atualizarSelectCategorias();
                renderizarDocumentos();
                return;
            }
        } catch (e) {}
    }
    mostrarAuth();
    inicializarAuth();
});

function carregarDados() {
    try {
        usuarios = JSON.parse(localStorage.getItem(STORAGE_KEYS.USUARIOS) || '[]');
        documentos = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTOS) || '[]');
        pastas = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASTAS) || '[]');
        const cfg = localStorage.getItem(STORAGE_KEYS.CONFIG);
        if (cfg) config = { ...config, ...JSON.parse(cfg) };
    } catch (e) {
        usuarios = [];
        documentos = [];
        pastas = [];
    }
}

function salvarDados() {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTOS, JSON.stringify(documentos));
    localStorage.setItem(STORAGE_KEYS.PASTAS, JSON.stringify(pastas));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

function salvarSession() {
    if (usuarioLogado && familiaAtual) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
            usuarioId: usuarioLogado.id,
            familiaId: familiaAtual,
        }));
    } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
}

function mostrarAuth() {
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
}

function mostrarApp() {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
}

// ===== Autenticação =====
function inicializarAuth() {
    document.getElementById('formLogin').addEventListener('submit', fazerLogin);
    document.getElementById('formCadastro').addEventListener('submit', fazerCadastro);
    document.getElementById('goToCadastro').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('cadastroScreen').classList.remove('hidden');
    });
    document.getElementById('goToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('cadastroScreen').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');
    });
}

function fazerLogin(e) {
    e.preventDefault();
    const nome = document.getElementById('loginNome').value.trim();
    const familiaId = document.getElementById('loginFamilia').value.trim();

    const usuario = usuarios.find(u => {
        const primeiroNome = u.nome.split(' ')[0];
        return primeiroNome.toLowerCase() === nome.toLowerCase() && u.familias?.includes(familiaId);
    });

    if (!usuario) {
        alert('Usuário não encontrado. Verifique o nome e o ID da família.');
        return;
    }

    usuarioLogado = usuario;
    familiaAtual = familiaId;
    salvarSession();
    aplicarConfiguracoes();
    mostrarApp();
    inicializarEventos();
    renderizarFamiliaTabs();
    atualizarSidebarUsuario();
    atualizarSelectCategorias();
    renderizarDocumentos();
}

async function fazerCadastro(e) {
    e.preventDefault();
    const nome = document.getElementById('cadNome').value.trim();
    const sobrenome = document.getElementById('cadSobrenome').value.trim();
    const email = document.getElementById('cadEmail').value.trim();
    const telefone = document.getElementById('cadTelefone').value.trim();
    const familiaId = document.getElementById('cadFamilia').value.trim();
    const fotoInput = document.getElementById('cadFoto');

    let foto = null;
    if (fotoInput?.files?.length) {
        const file = fotoInput.files[0];
        if (file.size > MAX_FILE_SIZE) {
            alert('A foto não pode ter mais de 2MB.');
            return;
        }
        foto = await lerArquivoBase64(file);
    }

    const id = Date.now().toString();
    const usuario = {
        id,
        nome: `${nome} ${sobrenome}`.trim(),
        sobrenome,
        email,
        telefone,
        familias: [familiaId],
        foto,
    };

    usuarios.push(usuario);
    salvarDados();

    usuarioLogado = usuario;
    familiaAtual = familiaId;
    salvarSession();

    document.getElementById('formCadastro').reset();
    alert('Cadastro realizado com sucesso!');
    aplicarConfiguracoes();
    mostrarApp();
    inicializarEventos();
    renderizarFamiliaTabs();
    atualizarSidebarUsuario();
    atualizarSelectCategorias();
    renderizarDocumentos();
}

function lerArquivoBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ===== Aplicação principal =====
function aplicarConfiguracoes() {
    document.body.classList.toggle('tema-escuro', config.tema === 'escuro');
    document.body.style.backgroundColor = config.tema === 'escuro'
        ? (CORES_FUNDO_ESCURO[config.corFundo] || CORES_FUNDO_ESCURO.azul)
        : (CORES_FUNDO[config.corFundo] || CORES_FUNDO.azul);
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.backgroundColor = CORES_SIDEBAR[config.corSidebar] || CORES_SIDEBAR.azul;
    }
    const btnExpand = document.getElementById('expandSidebar');
    if (btnExpand) btnExpand.style.backgroundColor = CORES_SIDEBAR[config.corSidebar] || CORES_SIDEBAR.azul;
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === config.tema);
    });
    document.querySelectorAll('#colorOptions .color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === config.corFundo);
    });
    document.querySelectorAll('#sidebarColorOptions .color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sidebar === config.corSidebar);
    });
}

function inicializarEventos() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const expandBtn = document.getElementById('expandSidebar');
    if (toggleBtn) toggleBtn.addEventListener('click', () => sidebar?.classList.add('collapsed'));
    if (expandBtn) expandBtn.addEventListener('click', () => sidebar?.classList.remove('collapsed'));

    document.querySelector('[data-action="documentos"]')?.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('[data-action="documentos"]')?.classList.add('active');
    });
    document.querySelector('[data-action="configuracoes"]')?.addEventListener('click', abrirModalConfig);
    document.querySelector('[data-action="adicionar-familia"]')?.addEventListener('click', abrirModalAddFamilia);

    document.getElementById('addDocument')?.addEventListener('click', abrirModalAdd);
    document.getElementById('closeModalAdd')?.addEventListener('click', fecharModalAdd);
    document.getElementById('cancelAdd')?.addEventListener('click', fecharModalAdd);
    document.getElementById('formAddDocument')?.addEventListener('submit', salvarDocumento);
    document.getElementById('closeModalView')?.addEventListener('click', fecharModalView);

    document.getElementById('closeModalConfig')?.addEventListener('click', fecharModalConfig);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            config.tema = btn.dataset.theme;
            salvarDados();
            aplicarConfiguracoes();
        });
    });
    document.querySelectorAll('#colorOptions .color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            config.corFundo = btn.dataset.color;
            salvarDados();
            aplicarConfiguracoes();
        });
    });
    document.querySelectorAll('#sidebarColorOptions .color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            config.corSidebar = btn.dataset.sidebar;
            salvarDados();
            aplicarConfiguracoes();
        });
    });

    document.getElementById('btnLogout')?.addEventListener('click', fazerLogout);
    document.getElementById('btnChangePhoto')?.addEventListener('click', () => document.getElementById('sidebarPhotoInput').click());
    document.getElementById('sidebarPhotoInput')?.addEventListener('change', alterarFotoSidebar);
    document.getElementById('btnUploadPhoto')?.addEventListener('click', () => document.getElementById('configPhotoInput').click());
    document.getElementById('configPhotoInput')?.addEventListener('change', alterarFotoConfig);

    document.getElementById('closeModalAddFamilia')?.addEventListener('click', fecharModalAddFamilia);
    document.getElementById('cancelAddFamilia')?.addEventListener('click', fecharModalAddFamilia);
    document.getElementById('formAddFamilia')?.addEventListener('submit', adicionarFamilia);

    document.getElementById('closeModalConfirm')?.addEventListener('click', fecharModalConfirm);
    document.getElementById('cancelConfirm')?.addEventListener('click', fecharModalConfirm);
    document.getElementById('confirmDelete')?.addEventListener('click', executarExclusao);

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });
}

function fazerLogout() {
    usuarioLogado = null;
    familiaAtual = null;
    salvarSession();
    fecharModalConfig();
    mostrarAuth();
    inicializarAuth();
}

function renderizarFamiliaTabs() {
    const container = document.getElementById('familiaTabs');
    if (!container) return;
    container.innerHTML = '';
    const familias = usuarioLogado?.familias || [];
    familias.forEach(fid => {
        const btn = document.createElement('button');
        btn.className = 'familia-tab' + (fid === familiaAtual ? ' active' : '');
        btn.textContent = fid;
        btn.dataset.familia = fid;
        btn.addEventListener('click', () => {
            familiaAtual = fid;
            salvarSession();
            renderizarFamiliaTabs();
            atualizarSelectCategorias();
            renderizarDocumentos();
        });
        container.appendChild(btn);
    });
}

function atualizarSidebarUsuario() {
    const nomeEl = document.getElementById('userNameSidebar');
    const photoEl = document.getElementById('userPhoto');
    const placeholder = document.getElementById('userPhotoPlaceholder');
    if (nomeEl) nomeEl.textContent = usuarioLogado?.nome || '';
    if (usuarioLogado?.foto) {
        photoEl.src = usuarioLogado.foto;
        photoEl.classList.add('visible');
        if (placeholder) placeholder.classList.add('hidden');
    } else {
        photoEl.src = '';
        photoEl.classList.remove('visible');
        if (placeholder) placeholder.classList.remove('hidden');
    }
}

async function alterarFotoSidebar(e) {
    const file = e.target.files?.[0];
    if (!file || file.size > MAX_FILE_SIZE) return;
    const base64 = await lerArquivoBase64(file);
    usuarioLogado.foto = base64;
    salvarDados();
    atualizarSidebarUsuario();
    atualizarPreviewFotoConfig();
    e.target.value = '';
}

async function alterarFotoConfig(e) {
    const file = e.target.files?.[0];
    if (!file || file.size > MAX_FILE_SIZE) return;
    const base64 = await lerArquivoBase64(file);
    usuarioLogado.foto = base64;
    salvarDados();
    atualizarSidebarUsuario();
    atualizarPreviewFotoConfig();
    e.target.value = '';
}

function atualizarPreviewFotoConfig() {
    const preview = document.getElementById('configPhotoPreview');
    if (!preview) return;
    preview.innerHTML = '';
    if (usuarioLogado?.foto) {
        const img = document.createElement('img');
        img.src = usuarioLogado.foto;
        img.alt = 'Foto';
        preview.appendChild(img);
    } else {
        const div = document.createElement('div');
        div.className = 'placeholder-icon';
        div.innerHTML = '<i class="fas fa-user"></i>';
        preview.appendChild(div);
    }
}

function abrirModalConfig() {
    atualizarPreviewFotoConfig();
    document.getElementById('modalConfig').classList.add('active');
}

function fecharModalConfig() {
    document.getElementById('modalConfig').classList.remove('active');
}

function abrirModalAddFamilia() {
    document.getElementById('modalAddFamilia').classList.add('active');
}

function fecharModalAddFamilia() {
    document.getElementById('modalAddFamilia').classList.remove('active');
}

function adicionarFamilia(e) {
    e.preventDefault();
    const id = document.getElementById('novaFamiliaId').value.trim();
    if (!id) return;
    if (usuarioLogado.familias.includes(id)) {
        alert('Você já pertence a esta família.');
        return;
    }
    usuarioLogado.familias.push(id);
    salvarDados();
    familiaAtual = id;
    salvarSession();
    document.getElementById('formAddFamilia').reset();
    fecharModalAddFamilia();
    renderizarFamiliaTabs();
    atualizarSelectCategorias();
    renderizarDocumentos();
}

function atualizarSelectCategorias() {
    const select = document.getElementById('docCategoria');
    if (!select) return;
    const base = ['Documentos pessoais', 'Documentos de trabalho', 'Documentos escolares', 'Passaporte', 'Certidões', 'Contratos', 'Outros'];
    const opts = base;
    const val = select.value;
    select.innerHTML = '<option value="">Selecione uma categoria</option>' + opts.map(c => `<option value="${c}">${c}</option>`).join('');
    select.value = val || '';
}

function obterDocumentosDoUsuario() {
    return documentos.filter(d => d.usuarioId === usuarioLogado?.id && d.familiaId === familiaAtual);
}

function renderizarDocumentos() {
    const emptyState = document.getElementById('emptyState');
    const docsList = document.getElementById('documentsList');
    const lista = obterDocumentosDoUsuario();

    if (lista.length === 0) {
        emptyState?.classList.remove('hidden');
        docsList?.classList.remove('visible');
        return;
    }
    emptyState?.classList.add('hidden');
    docsList?.classList.add('visible');
    docsList.innerHTML = '';
    lista.forEach((doc, idx) => {
        docsList.appendChild(criarCardDocumento(doc, idx));
    });
}

function criarCardDocumento(doc, index) {
    const div = document.createElement('div');
    div.className = 'document-card';
    const icone = obterIconePorTipo(doc.arquivo);
    div.innerHTML = `
        <div class="document-card-header">
            <i class="fas ${icone} document-card-icon"></i>
            <div class="document-card-actions">
                <button class="btn-icon view" title="Abrir" data-index="${index}"><i class="fas fa-external-link-alt"></i></button>
                <button class="btn-icon delete" title="Apagar" data-index="${index}"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        <h3 class="document-card-title">${escapeHtml(doc.nome)}</h3>
        <p class="document-card-category">${escapeHtml(doc.categoria)}</p>
        <p class="document-card-date">${formatarData(doc.data)}</p>
    `;
    div.querySelector('.view').addEventListener('click', () => abrirDocumento(index));
    div.querySelector('.delete').addEventListener('click', () => confirmarExclusao(index, 'documento'));
    return div;
}

function obterIconePorTipo(nome) {
    if (!nome) return 'fa-file';
    const ext = (nome.split('.').pop() || '').toLowerCase();
    if (['pdf'].includes(ext)) return 'fa-file-pdf';
    if (['jpg','jpeg','png','gif'].includes(ext)) return 'fa-file-image';
    if (['doc','docx'].includes(ext)) return 'fa-file-word';
    return 'fa-file';
}

function formatarData(s) {
    if (!s) return '-';
    return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}

function abrirModalAdd() {
    atualizarSelectCategorias();
    document.getElementById('formAddDocument').reset();
    document.getElementById('modalAdd').classList.add('active');
}

function fecharModalAdd() {
    document.getElementById('modalAdd').classList.remove('active');
}

function salvarDocumento(e) {
    e.preventDefault();
    const nome = document.getElementById('docNome').value.trim();
    const categoria = document.getElementById('docCategoria').value;
    const arquivoInput = document.getElementById('docArquivo');
    const notas = document.getElementById('docNotas').value.trim();
    if (!arquivoInput?.files?.length) { alert('Selecione um arquivo.'); return; }
    const file = arquivoInput.files[0];
    if (file.size > MAX_FILE_SIZE) { alert('Arquivo máximo 2MB.'); return; }

    const reader = new FileReader();
    reader.onload = () => {
        documentos.push({
            id: Date.now().toString(),
            nome, categoria, nota: notas,
            data: new Date().toISOString(),
            arquivo: file.name, arquivoBase64: reader.result,
            usuarioId: usuarioLogado.id, familiaId: familiaAtual,
        });
        salvarDados();
        fecharModalAdd();
        renderizarDocumentos();
    };
    reader.readAsDataURL(file);
}

function abrirDocumento(index) {
    const lista = obterDocumentosDoUsuario();
    const doc = lista[index];
    if (!doc) return;
    document.getElementById('viewDocTitle').textContent = doc.nome;
    document.getElementById('viewDocCategory').textContent = doc.categoria;
    document.getElementById('viewDocDate').textContent = formatarData(doc.data);
    document.getElementById('viewDocNotesText').textContent = doc.nota || 'Nenhuma nota.';

    const preview = document.getElementById('viewDocPreview');
    preview.innerHTML = '';
    if (doc.arquivoBase64) {
        const tipo = doc.arquivoBase64.split(';')[0];
        if (tipo.includes('image')) {
            const img = document.createElement('img');
            img.src = doc.arquivoBase64;
            img.alt = doc.nome;
            preview.appendChild(img);
        } else {
            const a = document.createElement('a');
            a.href = doc.arquivoBase64;
            a.download = doc.arquivo;
            a.innerHTML = `<i class="fas fa-download"></i> Baixar ${doc.arquivo}`;
            preview.appendChild(a);
        }
    }
    document.getElementById('modalView').classList.add('active');
}

function fecharModalView() {
    document.getElementById('modalView').classList.remove('active');
}

function confirmarExclusao(index, tipo) {
    tipoExclusao = tipo;
    itemParaExcluir = index;
    document.getElementById('confirmMessage').textContent = tipo === 'documento' ? 'Excluir este documento?' : 'Excluir?';
    document.getElementById('modalConfirm').classList.add('active');
}

function executarExclusao() {
    if (tipoExclusao === 'documento') {
        const lista = obterDocumentosDoUsuario();
        const doc = lista[itemParaExcluir];
        if (doc) documentos = documentos.filter(d => d.id !== doc.id);
    }
    salvarDados();
    document.getElementById('modalConfirm').classList.remove('active');
    itemParaExcluir = null;
    tipoExclusao = '';
    renderizarDocumentos();
}
