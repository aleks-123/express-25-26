let text = "image/jpeg";
image = uuid.v4();
let primer = text.split("/");
const ext = text.split("/")[1];
const novoImeNaSlika = `movie-jsdng21f-${Date.now()}.${ext}`;
console.log(novoImeNaSlika);
