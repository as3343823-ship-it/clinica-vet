# Relatório Técnico — Estrutura de Pastas, Classes e Responsabilidades

## 1) Função de cada pasta (visão prática)

### `backend/`
Contém toda a lógica de servidor (Node + Express):
- **`routes/`**: define endpoints HTTP.
- **`controllers/`**: valida perfil/permissão e orquestra fluxo de request/response.
- **`services/`**: concentra regras de negócio e queries SQL.
- **`models/`**: classes de domínio (estrutura de dados do sistema).
- **`middleware/`**: autenticação e verificação JWT.
- **`utils/`**: funções utilitárias (ex.: classificação Manchester e pontuário).
- **`config/`**: conexão com base de dados.

### `frontend/`
Contém interface de usuário:
- **`views/`**: páginas EJS renderizadas no servidor.
- **`public/js/`**: JavaScript do lado do cliente.
- **`public/css/`**: estilos.
- **`public/images/`**: imagens e uploads dos animais.

---

## 2) Função de cada classe do projeto

Foram identificadas classes em `backend/models/`:

1. **`Animal`** (`backend/models/Animal.js`)
   - Representa um animal no domínio da clínica.
   - Mantém dados clínicos e vínculo com tutor.

2. **`Tutor`** (`backend/models/Tutor.js`)
   - Representa o responsável pelo(s) animal(is).
   - Armazena dados de contato e identificação do cliente.

3. **`Tratamento`** (`backend/models/Tratamento.js`)
   - Representa um tratamento agendado/realizado para um animal.

4. **`Exame`** (`backend/models/Exame.js`)
   - Representa exames vinculados a um animal, incluindo resultados.

---

## 3) Código completo de todas as classes presentes

### 3.1 `backend/models/Animal.js`
```js
class Animal {
  constructor(id, nome, idade, especie, raca, sexo, peso, sintomas, vacinas, historico, classif, tutorId, imagemPath) {
    this.id = id;
    this.nome = nome;
    this.idade = idade;
    this.especie = especie;
    this.raca = raca;
    this.sexo = sexo;
    this.peso = peso;
    this.sintomas = sintomas;
    this.vacinas = vacinas;
    this.historico = historico;
    this.classif = classif;
    this.tutorId = tutorId;
    this.imagemPath = imagemPath;
  }
}
module.exports = Animal;
```

### 3.2 `backend/models/Tutor.js`
```js
class Tutor {
  constructor(id, nome, email, telefone, genero, morada) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
    this.genero = genero;
    this.morada = morada;
  }
}
module.exports = Tutor;
```

### 3.3 `backend/models/Tratamento.js`
```js
class Tratamento {
  constructor(id, tipo, descricao, data, realizado, animalId) {
    this.id = id;
    this.tipo = tipo;
    this.descricao = descricao;
    this.data = data;
    this.realizado = realizado;
    this.animalId = animalId;
  }
}
module.exports = Tratamento;
```

### 3.4 `backend/models/Exame.js`
```js
class Exame {
  constructor(id, tipo, resultados, data, realizado, animalId) {
    this.id = id;
    this.tipo = tipo;
    this.resultados = resultados;
    this.data = data;
    this.realizado = realizado;
    this.animalId = animalId;
  }
}

module.exports = Exame;
```

---

## 4) Pontuário funcional por animal (estado atual)

Além da classificação Manchester (`A/B/C/D`), o projeto agora possui pontuação numérica para priorização imediata:
- `D = 100`
- `C = 75`
- `B = 50`
- `A = 25`

A pontuação é:
- calculada no backend,
- retornada nas listagens de animais (funcionário e tutor),
- exibida em ficha detalhada,
- disponível em endpoint dedicado (`/animais/pontuarios`).
