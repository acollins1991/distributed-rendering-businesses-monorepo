FROM oven/bun:1.1.9-debian

RUN apt update && apt install git curl unzip zip -y

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install