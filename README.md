# Nova AI — GitHub Pages -versio

Tämä paketti sisältää GitHub Pages -sivuston (`site/`) ja pienen Cloudflare Worker -rajapinnan (`worker/`).

**Tärkeä rajoitus:** GitHub Pages on staattinen hosting-palvelu. Se ei voi pitää salaista API-avainta eikä kutsua OpenAI API:a turvallisesti yksinään. Siksi oikea tekoälychat tarvitsee pienen palvelinpuolen välittäjän. Tässä paketissa se on Cloudflare Worker.

## 1. Julkaise sivusto GitHub Pagesissa

1. Luo GitHubissa uusi julkinen repository.
2. Lataa `site`-kansion SISÄLTÖ repositoryn juureen (index.html, style.css, app.js).
3. Avaa repositoryn **Settings → Pages**.
4. Valitse **Deploy from a branch**, haara `main` ja kansio `/ (root)`, ja tallenna.

## 2. Ota chat-rajapinta käyttöön (kertaluonteinen)

1. Luo Cloudflare-tili ja avaa Workers & Pages.
2. Luo Worker nimeltä `nova-ai-chat-api` ja liitä `worker/index.js` sen koodiksi.
3. Lisää Workerille salaisuus nimeltä `OPENAI_API_KEY` ja arvoksi oma OpenAI API -avaimesi. Älä koskaan laita avainta GitHubiin.
4. Julkaise Worker ja kopioi sen URL, esimerkiksi `https://nova-ai-chat-api.<tilisi>.workers.dev`.
5. Avaa `site/app.js` ja korvaa `LISAA_CLOUDFLARE_WORKER_URL_TAHAN` omalla Worker-URL:llasi. Tallenna muutos GitHubiin.

Tämän jälkeen GitHub Pages -sivun chat voi käyttää OpenAI API:a.

## API-avaimesta ja kuluista

- API-avainta ei voi luoda valmiiksi puolestasi. Luo se OpenAI Platformissa ja lisää se vain Cloudflare Worker -palvelimen salaisuudeksi.
- OpenAI API -käyttö laskutetaan erikseen; ChatGPT-tilaus ei automaattisesti sisällä API-käyttöä.
- Workerissä on perusvalidointi, mutta ennen julkista laajaa käyttöä lisää pyyntöjen nopeusrajoitus ja tarvittaessa domain-rajaus.
