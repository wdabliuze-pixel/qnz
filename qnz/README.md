# AFTER

Site visual da coleção AFTER, feito com TypeScript, CSS e Vite.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Desenvolvimento

```sh
npm install
npm run dev
```

## Avatares

Adicione as imagens em `src/avatars` com o número da posição no nome: de `1.*` a `7.*`, na ordem dos perfis exibidos. São aceitos PNG, JPG, JPEG, WebP e GIF animado; perfis sem arquivo continuam com o círculo preto.

## Músicas dos perfis

Adicione as faixas em `src/musics` com o número da posição no nome, seguindo a ordem dos perfis exibidos (por exemplo, `1.mp3` para o primeiro perfil e `2.mp4` para o segundo). São aceitos arquivos MP3, MP4 e MOV. A música começa automaticamente ao abrir o perfil e para ao sair. Alguns navegadores podem bloquear a reprodução automática com som.

## Verificação e build

```sh
npm run typecheck
npm run build
npm run preview
```