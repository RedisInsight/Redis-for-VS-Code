# Используем официальный образ Ubuntu в качестве базового образа

FROM node:18.18-alpine as build

# update apk repository and install build dependencies
RUN apk update && apk add --no-cache --virtual .gyp \
        python3 \
        make \
        gpg \
        g++ \
        wget \
        # gnupg2 \
        # software-properties-common \
        # apt-transport-https \
        ca-certificates \
        # libx11-xcb1 \
        # libxkbfile1 \
        # libsecret-1-0 \
        # libgtk-3-0 \
        # libxss1 \
        # libnss3 \
        # libxshmfence1 \
        # libgbm1 \
        # libx11-xcb1 \
        # libxkbfile1 \
        # libsecret-1-0 \
        curl \
        gpg-agent

# # Устанавливаем зависимости
RUN apt-get update && \
    apt-get install -y \
    wget \
    gnupg2 \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    libx11-xcb1 \
    libxkbfile1 \
    libsecret-1-0 \
    libgtk-3-0 \
    libxss1 \
    libnss3 \
    libxshmfence1 \
    libgbm1 \
    libx11-xcb1 \
    libxkbfile1 \
    libsecret-1-0 \
    gpg \
    gpg-agent \
    yarn \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

RUN SKIP_POSTINSTALL=1 yarn install

# RUN snap install code --classic

# RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
# RUN install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
# RUN echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" |tee /etc/apt/sources.list.d/vscode.list > /dev/null
# RUN rm -f packages.microsoft.gpg


# nvm environment variables
# ENV NVM_DIR /usr/local/nvm
# ENV NODE_VERSION 18

# Устанавливаем Node.js и Yarn
# RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
# RUN . ~/.nvm/nvm.sh && nvm install 18

RUN ls -la
# CMD ["yarn", "install"]
# ENTRYPOINT ["yarn", "install"]


# Устанавливаем VS Code в качестве команды по умолчанию
# CMD ["yarn", ""]
