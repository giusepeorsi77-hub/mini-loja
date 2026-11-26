const jogos = [
    { id: 1, nome: "Corrida Neon", categoria: "corrida", preco: 49.90, desconto: 0, img: "img/corrida.svg" },
    { id: 2, nome: "Reino Perdido", categoria: "acao", preco: 129.90, desconto: 30, img: "img/reino.svg" },
    { id: 3, nome: "Futebol Total", categoria: "esporte", preco: 199.90, desconto: 0, img: "img/futebol.svg" },
    { id: 4, nome: "Galáxia X", categoria: "acao", preco: 159.90, desconto: 10, img: "img/galaxia.svg" },
    { id: 5, nome: "Zumbi City", categoria: "acao", preco: 89.90, desconto: 50, img: "img/zumbi.svg" },
    { id: 6, nome: "Puzzle Mania", categoria: "casual", preco: 19.90, desconto: 0, img: "img/puzzle.svg" },
    { id: 7, nome: "Arena de Luta", categoria: "acao", preco: 79.90, desconto: 0, img: "img/luta.svg" },
    { id: 8, nome: "Fazendinha", categoria: "casual", preco: 29.90, desconto: 20, img: "img/fazenda.svg" }
];

const cupons = {
    GAMER10: 10,
    PIXEL15: 15,
    ZONE25: 25
};

const nomesCategoria = {
    acao: "Ação",
    corrida: "Corrida",
    esporte: "Esporte",
    casual: "Casual"
};

let carrinho = [];
let cupomAtivo = null;
let filtroAtual = "todos";

function dinheiro(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function precoFinal(jogo) {
    return jogo.preco - (jogo.preco * jogo.desconto / 100);
}

function mostrarJogos() {
    const vitrine = document.getElementById("vitrine");
    let html = "";

    for (let i = 0; i < jogos.length; i++) {
        const jogo = jogos[i];

        if (filtroAtual !== "todos" && jogo.categoria !== filtroAtual) {
            continue;
        }

        let precoHtml = dinheiro(jogo.preco);
        let tag = "";

        if (jogo.desconto > 0) {
            precoHtml = "<s>" + dinheiro(jogo.preco) + "</s> " + dinheiro(precoFinal(jogo));
            tag = '<span class="tag-off">-' + jogo.desconto + '%</span>';
        }

        html += `
            <div class="card">
                ${tag}
                <img src="${jogo.img}" alt="${jogo.nome}">
                <div class="info">
                    <span class="categoria">${nomesCategoria[jogo.categoria]}</span>
                    <h3>${jogo.nome}</h3>
                    <p class="preco">${precoHtml}</p>
                    <button class="btn" onclick="adicionar(${jogo.id})">Adicionar</button>
                </div>
            </div>`;
    }

    vitrine.innerHTML = html;
}

function adicionar(id) {
    const jogo = jogos.find(j => j.id === id);
    const item = carrinho.find(c => c.id === id);

    if (item) {
        item.qtd++;
    } else {
        carrinho.push({ id: jogo.id, nome: jogo.nome, preco: precoFinal(jogo), qtd: 1 });
    }

    document.getElementById("aviso-compra").innerHTML = "";
    atualizar();
}

function alterarQtd(id, valor) {
    const item = carrinho.find(c => c.id === id);
    item.qtd += valor;

    if (item.qtd < 1) {
        remover(id);
        return;
    }

    atualizar();
}

function remover(id) {
    carrinho = carrinho.filter(c => c.id !== id);
    atualizar();
}

function calcularSubtotal() {
    let soma = 0;
    carrinho.forEach(item => {
        soma += item.preco * item.qtd;
    });
    return soma;
}

function atualizar() {
    const corpo = document.getElementById("itens");
    const vazio = document.getElementById("vazio");
    const tabela = document.getElementById("tabela-carrinho");
    let linhas = "";
    let quantidade = 0;

    carrinho.forEach(item => {
        quantidade += item.qtd;
        linhas += `
            <tr>
                <td>${item.nome}</td>
                <td>${dinheiro(item.preco)}</td>
                <td>
                    <button class="qtd-btn" onclick="alterarQtd(${item.id}, -1)">-</button>
                    ${item.qtd}
                    <button class="qtd-btn" onclick="alterarQtd(${item.id}, 1)">+</button>
                </td>
                <td>${dinheiro(item.preco * item.qtd)}</td>
                <td><button class="remover" onclick="remover(${item.id})">&times;</button></td>
            </tr>`;
    });

    corpo.innerHTML = linhas;

    if (carrinho.length === 0) {
        tabela.style.display = "none";
        vazio.style.display = "block";
    } else {
        tabela.style.display = "table";
        vazio.style.display = "none";
    }

    const subtotal = calcularSubtotal();
    let desconto = 0;

    if (cupomAtivo && subtotal < 50) {
        cupomAtivo = null;
        document.getElementById("aviso-cupom").textContent = "";
    }

    if (cupomAtivo) {
        desconto = subtotal * cupons[cupomAtivo] / 100;
    }

    const total = subtotal - desconto;

    document.getElementById("contador").textContent = quantidade;
    document.getElementById("valor-subtotal").textContent = dinheiro(subtotal);
    document.getElementById("valor-desconto").textContent = "- " + dinheiro(desconto);
    document.getElementById("valor-total").textContent = dinheiro(total);
    document.getElementById("btn-comprar").disabled = carrinho.length === 0;

    return total;
}

function usarCupom() {
    const campo = document.getElementById("campo-cupom");
    const aviso = document.getElementById("aviso-cupom");
    const codigo = campo.value.trim().toUpperCase();

    if (codigo === "") {
        aviso.textContent = "Digite um cupom.";
        aviso.className = "erro";
    } else if (cupons[codigo] === undefined) {
        aviso.textContent = "Cupom inválido.";
        aviso.className = "erro";
        cupomAtivo = null;
    } else if (calcularSubtotal() < 50) {
        aviso.textContent = "Cupom válido só para compras a partir de R$ 50,00.";
        aviso.className = "erro";
        cupomAtivo = null;
    } else {
        cupomAtivo = codigo;
        aviso.textContent = "Cupom " + codigo + " aplicado: " + cupons[codigo] + "% off.";
        aviso.className = "ok";
    }

    atualizar();
}

function gerarCodigo() {
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";

    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) {
            codigo += "-";
        }
        codigo += letras[Math.floor(Math.random() * letras.length)];
    }

    return codigo;
}

function comprar() {
    const aviso = document.getElementById("aviso-compra");

    if (carrinho.length === 0) {
        aviso.textContent = "Adicione um jogo antes de comprar.";
        aviso.className = "erro";
        return;
    }

    const total = atualizar();
    let html = "Compra aprovada! Total: " + dinheiro(total) + "<br>";

    carrinho.forEach(item => {
        for (let i = 0; i < item.qtd; i++) {
            html += item.nome + '<span class="codigo">' + gerarCodigo() + "</span>";
        }
    });

    carrinho = [];
    cupomAtivo = null;
    document.getElementById("campo-cupom").value = "";
    document.getElementById("aviso-cupom").textContent = "";

    atualizar();
    aviso.innerHTML = html;
    aviso.className = "ok";
}

function cadastrar(evento) {
    evento.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const email = document.getElementById("email").value.trim();
    const idade = Number(document.getElementById("idade").value);
    const plataforma = document.getElementById("plataforma").value;
    const aceito = document.getElementById("aceito").checked;
    const aviso = document.getElementById("aviso-form");

    if (usuario.length < 3) {
        aviso.textContent = "O nome de usuário precisa ter pelo menos 3 letras.";
        aviso.className = "erro";
    } else if (!email.includes("@") || !email.includes(".")) {
        aviso.textContent = "Digite um e-mail válido.";
        aviso.className = "erro";
    } else if (isNaN(idade) || idade <= 0) {
        aviso.textContent = "Digite sua idade.";
        aviso.className = "erro";
    } else if (plataforma === "") {
        aviso.textContent = "Escolha uma plataforma.";
        aviso.className = "erro";
    } else if (!aceito) {
        aviso.textContent = "Marque a opção para receber e-mails.";
        aviso.className = "erro";
    } else {
        let mensagem = "Cadastro feito, " + usuario + "!";
        if (idade < 18) {
            mensagem += " Vamos mostrar só jogos para a sua idade.";
        }
        aviso.textContent = mensagem;
        aviso.className = "ok";
        evento.target.reset();
    }
}

const botoesFiltro = document.querySelectorAll(".filtro");

botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
        botoesFiltro.forEach(b => b.classList.remove("ativo"));
        botao.classList.add("ativo");
        filtroAtual = botao.dataset.cat;
        mostrarJogos();
    });
});

document.getElementById("btn-cupom").addEventListener("click", usarCupom);
document.getElementById("campo-cupom").addEventListener("keydown", e => {
    if (e.key === "Enter") {
        usarCupom();
    }
});
document.getElementById("btn-comprar").addEventListener("click", comprar);
document.getElementById("form-cadastro").addEventListener("submit", cadastrar);

mostrarJogos();
atualizar();
