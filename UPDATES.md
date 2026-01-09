# Gerenciamento de Tokens para Auto-Update

## 🔐 Problema: Tokens que Expiram

GitHub Personal Access Tokens podem expirar, quebrando o sistema de auto-update.

---

## ✅ Solução 1: Fine-Grained Token SEM Expiração (Mais Simples)

### Criar Token

1. Acesse: https://github.com/settings/personal-access-tokens/new
2. Configure:
   - **Token name**: `PDV Auto-Update (No Expiration)`
   - **Expiration**: `No expiration` ⚠️
   - **Repository access**: `Only select repositories`
     - Selecione: `gabrielrsep/pdv_loja_vue`
   - **Repository permissions**:
     - `Contents`: `Read-only` (para ler releases)
     - `Metadata`: `Read-only` (automático)
3. Clique em **Generate token**
4. **COPIE E SALVE** o token imediatamente

### Configurar no App

**Para Desenvolvimento**:
```bash
export GH_TOKEN="github_pat_xxxxxxxxxxxxx"
npm start
```

**Para Produção** (distribuir para clientes):

Crie um arquivo de configuração que o app lê na primeira execução:

```javascript
// Em src/services/update.service.js
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

// Tenta ler token de múltiplas fontes
function getGitHubToken() {
    // 1. Variável de ambiente (desenvolvimento)
    if (process.env.GH_TOKEN) {
        return process.env.GH_TOKEN;
    }
    
    // 2. Arquivo de configuração local (produção)
    const configPath = path.join(app.getPath('userData'), 'update-config.json');
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            return config.githubToken;
        } catch (err) {
            log.error('Error reading update config:', err);
        }
    }
    
    // 3. Token embutido (fallback - não recomendado)
    // return 'seu_token_aqui'; // NÃO FAÇA ISSO!
    
    return null;
}

// Configure o token
const token = getGitHubToken();
if (token) {
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'gabrielrsep',
        repo: 'pdv_loja_vue',
        private: true,
        token: token
    });
}
```

---

## ✅ Solução 2: GitHub App (Corporativo)

Para ambientes profissionais, use um GitHub App que gera tokens automaticamente.

### Criar GitHub App

1. Acesse: https://github.com/settings/apps/new
2. Configure:
   - **GitHub App name**: `PDV Auto-Update App`
   - **Homepage URL**: `https://github.com/gabrielrsep/pdv_loja_vue`
   - **Webhook**: Desmarque "Active"
   - **Repository permissions**:
     - `Contents`: `Read-only`
   - **Where can this GitHub App be installed?**: `Only on this account`
3. Clique em **Create GitHub App**
4. Na página do app:
   - Gere uma **Private Key** (baixe o arquivo `.pem`)
   - Anote o **App ID**
5. Vá em **Install App** → Instale no repositório `pdv_loja_vue`

### Implementar no App

```javascript
// Você precisaria de uma biblioteca como @octokit/auth-app
// Mas isso é complexo demais para este caso de uso
```

**Conclusão**: Para este projeto, a **Solução 1** é mais adequada.

---

## ✅ Solução 3: Servidor Proxy de Updates (Avançado)

Crie um servidor intermediário que gerencia a autenticação:

```
[App Cliente] → [Seu Servidor] → [GitHub Releases]
                  (com token)
```

**Vantagens**:
- ✅ Token fica no servidor (mais seguro)
- ✅ Controle total sobre quem pode atualizar
- ✅ Pode implementar licenciamento

**Desvantagens**:
- ❌ Requer infraestrutura própria
- ❌ Mais complexo de implementar

---

## ✅ Solução 4: Releases Públicas em Repo Privado

GitHub permite que releases sejam públicas mesmo em repos privados:

### Como Fazer

1. Após criar a release via GitHub Actions
2. Manualmente, edite a release no GitHub
3. Marque como **Public release**

**Vantagens**:
- ✅ Não precisa de token
- ✅ Mais simples
- ✅ Código continua privado

**Desvantagens**:
- ❌ Qualquer um pode baixar os instaladores
- ❌ Processo manual (não automatizado)

---

## 🎯 Recomendação para PDV Rangel Modas

Para um sistema PDV comercial, recomendo:

### Curto Prazo (Agora)
1. Use **Fine-Grained Token sem expiração**
2. Implemente leitura de token de arquivo de configuração
3. Distribua o token via instalação inicial ou configuração remota

### Médio Prazo (Produção)
1. Implemente um **servidor de licenciamento**
2. Servidor valida licença E fornece updates
3. Token fica no servidor, não no cliente

### Exemplo de Servidor Simples

```javascript
// server.js (Node.js + Express)
const express = require('express');
const app = express();

app.get('/api/check-update/:version/:licenseKey', async (req, res) => {
    const { version, licenseKey } = req.params;
    
    // 1. Valida licença
    if (!isValidLicense(licenseKey)) {
        return res.status(403).json({ error: 'Invalid license' });
    }
    
    // 2. Busca release no GitHub (com token do servidor)
    const release = await fetchLatestRelease(GH_TOKEN);
    
    // 3. Compara versões
    if (release.version > version) {
        return res.json({
            available: true,
            version: release.version,
            downloadUrl: generateSignedUrl(release.assets[0].url)
        });
    }
    
    res.json({ available: false });
});
```

---

## 📝 Implementação Imediata

Vou modificar o `update.service.js` para suportar múltiplas fontes de token:

```javascript
// Ordem de prioridade:
// 1. Variável de ambiente (dev)
// 2. Arquivo de config (produção)
// 3. Sem token (falha gracefully)
```

Quer que eu implemente isso agora?
