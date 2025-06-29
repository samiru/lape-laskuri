# Lape Laskuri

Tämä on yksinkertainen web-sovellus, joka laskee katon lape-elementin pituuden annettujen mittojen perusteella ja visualisoi katon rakenteen.

## Käyttö

Avaa `index.html`-tiedosto selaimessasi. Sovellus toimii ilman erillistä palvelinohjelmistoa.

## Toiminnallisuudet

### Syöttökentät
- **Katon kulma (°):** Katon jyrkkyys asteina.
- **Rakennuksen leveys (cm):** Koko rakennuksen leveys senttimetreinä.
- **Räystään pituus (cm):** Räystään ulkonema seinälinjasta senttimetreinä.

### Laskenta
- **Lapepituus:** Lasketaan automaattisesti kaavalla: `(Leveys / 2) / cos(Kulma) + Räystäs`.
- Tulos näytetään senttimetreinä.

### 2D-visualisointi
- Oikealla puolella näkyy dynaaminen kuva katosta, joka päivittyy syötteiden muuttuessa.
- Kuva näyttää rakennuksen leveyden, katon kulman ja räystään pituuden.
- Laskettu lape on korostettu punaisella.
- **Mittakaava:** Voit säätää visualisoinnin mittakaavaa liukusäätimellä.

### Lisätoiminnot
- **Lataa kuva (PNG):** Lataa nykyisestä visualisoinnista PNG-kuvan.
- **Nollaa:** Palauttaa kaikki syöttökentät oletusarvoihin.

## Teknologiat
- HTML5
- CSS3
- JavaScript (Canvas API)
