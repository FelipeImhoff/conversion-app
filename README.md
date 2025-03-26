# Frontend - Conversion API

## 📌 Visão Geral
Este projeto é a interface frontend que consome a Conversion API. Ele fornece uma interface amigável para visualizar a evolução da taxa de conversão ao longo do tempo com base nos dados recebidos da API.

## 🚀 Como Rodar o Projeto
Para iniciar o frontend, siga os passos abaixo:

### 1️⃣ Subir os contêineres com Docker
```sh
docker-compose up --build
```

Isso irá construir a imagem e iniciar o servidor do frontend automaticamente.

---

## 🏗️ Tecnologias Utilizadas
- **React.js**: Framework moderno para construção de interfaces.
- **TypeScript**: Para maior segurança no desenvolvimento.
- **Docker & Docker Compose**: Facilita a execução do projeto sem necessidade de instalações manuais.
- **Axios**: Para requisições HTTP à API.

---

## 🔗 Comunicação com a API
A aplicação consome os dados da Conversion API através da seguinte rota:

### 🔹 `GET /api/conversion-rate?origin={origem}`
- O frontend realiza essa requisição para obter a evolução da taxa de conversão e exibi-la na interface.

---

## 📜 Licença
Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais informações.

