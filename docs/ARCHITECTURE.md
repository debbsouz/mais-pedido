# Arquitetura do +Pedido

## 1. Visão geral

O +Pedido é uma plataforma SaaS voltada para estabelecimentos que trabalham
com pedidos e delivery.

O sistema permitirá que diversos estabelecimentos utilizem a mesma aplicação,
mantendo seus dados completamente separados.

Cada estabelecimento poderá gerenciar:

- cardápio;
- categorias;
- produtos;
- adicionais;
- pedidos;
- clientes;
- entregadores;
- cupons;
- formas de pagamento;
- horários de funcionamento;
- taxas e áreas de entrega;
- usuários e funcionários;
- configurações da loja.

A Next Code terá um painel administrativo separado para gerenciar todos os
estabelecimentos, planos, assinaturas e situação das contas.

---

## 2. Objetivo da arquitetura

A arquitetura do +Pedido deve permitir:

- crescimento para vários estabelecimentos;
- separação segura dos dados de cada cliente;
- manutenção simples;
- desenvolvimento colaborativo;
- criação de novas funcionalidades sem comprometer o sistema;
- integração com WhatsApp, impressão e pagamentos;
- aplicativo para Windows;
- controle de planos e assinaturas.

---

## 3. Modelo SaaS

O +Pedido será uma aplicação multiempresa, também conhecida como multi-tenant.

Isso significa que todos os estabelecimentos utilizarão a mesma aplicação,
mas cada um visualizará somente os próprios dados.

Toda informação pertencente a um estabelecimento deverá estar vinculada a um
identificador de estabelecimento.

Exemplo:

```text
establishment_id