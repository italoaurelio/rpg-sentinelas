# As Pontes do Rio Pomba — RPG Sentinelas

Sistema web estilo **Kahoot-RPG** para reunião de grupo de jovens católicos (Cataguases, MG), pronto para deploy estático na **Vercel** sem necessidade de banco de dados.

## Como funciona
- **Notebook / Telão (`/`):** Cria sala com PIN de 4 dígitos e **QR Code**, conduz a leitura dos **16 capítulos + Epílogo** e exibe o pódio final.
- **Celular dos Jovens (`/jogar`):** Escaneia o QR Code, batiza o personagem, escolhe entre **A ou B** (sem revelar qual é "do mundo" ou "de Deus") e gira o **dado viciado** animado.
- **Sincronização sem banco de dados:** Usa **MQTT sobre WebSocket Seguro (`wss://`)** para comunicação em tempo real entre dispositivos (4G/Wi-Fi) + `BroadcastChannel` para testes locais em abas do mesmo navegador.

## Rodar localmente
```bash
npm install
npm test
npm run dev
```

## Subir na Vercel
Importe o repositório GitHub na Vercel com as configurações padrão do **Vite** (`npm run build` / diretório `dist`). Nenhuma variável de ambiente é necessária.
