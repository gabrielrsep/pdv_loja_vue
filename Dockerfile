# Usamos a imagem slim para manter o tamanho reduzido, 
# mas baseada em Debian para compatibilidade com dpkg/fakeroot
FROM node:20-bookworm-slim

# Evita prompts de interface durante a instalação
ENV DEBIAN_FRONTEND=noninteractive
# Instala dependências do sistema necessárias para o Electron e para gerar .deb
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Ferramentas de construção de pacotes Debian
    fakeroot \
    dpkg \
    binutils \
    # Dependências comuns para build do Electron e bibliotecas nativas
    python3 \
    make \
    g++ \
    # Dependências que o Electron exige para rodar (necessárias para alguns makers)
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências primeiro (otimização de cache)
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código-fonte
COPY . .

ENTRYPOINT [ "npm" ]
CMD [ "run", "make" ]