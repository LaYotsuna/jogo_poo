"use strict";

/* JOGO DA FORCA */

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function pergunta(query) {
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      resolve(ans);
    })
  );
}

class Player {
  constructor(nome) {
    this.nome = nome;
    this.pontos = 0;
  }

  adicionarPontos(pontos) {
    this.pontos += pontos;
  }
}

class Match {
  constructor(playerName, palavra, dica) {
    this.player = new Player(playerName);
    this.palavra = palavra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    this.dica = dica;
    this.palavraAtual = "_".repeat(palavra.length);
    this.tentativasRestantes = 6;
  }

  tentarPalavra(palavra) {
    palavra = palavra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (palavra.toLowerCase() === this.palavra.toLowerCase()) {
      let pontos = this.palavra.length * 10;
      this.player.adicionarPontos(pontos);
      return true;
    }
    this.tentativasRestantes--;
    return false;
  }

  mostrarStatus() {
    console.log(`Palavra: ${this.palavraAtual}`);
    console.log(`Dica: ${this.dica}`);
    console.log(`Tentativas Restantes: ${this.tentativasRestantes}`);
  }

  tentarLetra(letra) {
    letra = letra
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    let acertou = false;
    let palavraNormalizada = this.palavra
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    for (let i = 0; i < this.palavra.length; i++) {
      if (palavraNormalizada[i] === letra && this.palavraAtual[i] === "_") {
        this.palavraAtual =
          this.palavraAtual.substring(0, i) +
          this.palavra[i] +
          this.palavraAtual.substring(i + 1);
        acertou = true;
      }
    }

    if (!acertou) {
      this.tentativasRestantes--;
    }

    return acertou;
  }
}

class Controlador {
  async iniciarJogo() {
    const playerName = await pergunta("Digite seu nome: ");
    const palavra = await pergunta("Digite a palavra para o jogo: ");
    const dica = await pergunta("Digite a dica para o jogo: ");

    this.match = new Match(playerName, palavra, dica);
    await this.loopDeJogo();
  }

  async loopDeJogo() {
    while (this.match.tentativasRestantes > 0) {
      this.match.mostrarStatus();
      const tentativa = await pergunta(
        "Tente adivinhar a palavra ou uma letra: "
      );

      if (tentativa.length === this.match.palavra.length) {
        // Tentativa da palavra inteira
        if (this.match.tentarPalavra(tentativa)) {
          console.log("Parabéns! Você acertou a palavra!");
          break;
        } else {
          console.log("Palavra incorreta.");
        }
      } else if (tentativa.length === 1) {
        // Tentativa de uma letra
        if (this.match.tentarLetra(tentativa)) {
          console.log("Você acertou uma letra!");
        } else {
          console.log("Letra incorreta.");
        }
      } else {
        console.log("Por favor, tente uma letra ou a palavra inteira.");
      }

      if (this.match.tentativasRestantes <= 0) {
        console.log("Você perdeu! A palavra era: " + this.match.palavra);
      }
    }

    console.log(`Pontuação: ${this.match.player.pontos}`);
    const jogarNovamente = await pergunta("Deseja jogar novamente? (sim/não) ");
    if (jogarNovamente.toLowerCase() === "sim") {
      await this.iniciarJogo();
    } else {
      rl.close();
    }
  }
}

const jogo = new Controlador();
jogo.iniciarJogo();
