import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.OPENAI_API_KEY;
const PALAVRA_SECRETA = "Gabriela Giusti";

async function embedding(texto) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texto
    })
  });

  const json = await res.json();
  return json.data[0].embedding;
}

function similaridade(a, b) {
  let soma = 0;
  for (let i = 0; i < a.length; i++) {
    soma += a[i] * b[i];
  }
  return soma;
}

let embSecreta;
(async () => {
  embSecreta = await embedding(PALAVRA_SECRETA);
})();

app.post("/jogar", async (req, res) => {
  const { palavra } = req.body;

  const embUser = await embedding(palavra);
  const score = similaridade(embUser, embSecreta);

  const ranking = Math.max(1, Math.floor((1 - score) * 1000));

  res.json({
    ranking,
    acertou: ranking === 1
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});
