# Angielski Superbohater

Zbuduj aplikację edukacyjną po polsku dla dziecka (11-13 lat) do nauki angielskich czasowników nieregularnych. Nazwa: "Czasowniki". Wesoły, kolorowy styl, duże przyciski, czytelna czcionka, działa dobrze na telefonie.

DANE: stwórz plik src/data/verbs.ts z listą czasowników. Każdy czasownik ma pola: base, past (tablica, bo mogą być 2 poprawne warianty), participle (tablica), pl. Lista:

be | was/were | been | być

break | broke | broken | łamać, psuć

burn | burnt, burned | burnt, burned | oparzyć się, spalić

buy | bought | bought | kupować

come | came | come | przychodzić

cut | cut | cut | skaleczyć się, ciąć

do | did | done | robić

drink | drank | drunk | pić

eat | ate | eaten | jeść

fall | fell | fallen | spaść

feel | felt | felt | czuć

find | found | found | znaleźć

fly | flew | flown | latać

forget | forgot | forgotten | zapominać

give | gave | given | dawać

go | went | gone | iść, jechać

have | had | had | mieć

hear | heard | heard | słyszeć

hit | hit | hit | uderzyć

hurt | hurt | hurt | zranić

learn | learnt, learned | learnt, learned | uczyć się

leave | left | left | opuszczać

Dla "be" past simple poprawne odpowiedzi to: "was", "were", "was/were".

SPRAWDZANIE ODPOWIEDZI: stwórz jedną wspólną funkcję checkAnswer(userInput, correctVariants), używaną potem we wszystkich ćwiczeniach. Ignoruje wielkość liter i spacje na końcach, akceptuje każdy z wariantów (burnt i burned oba dobre).

EKRAN GŁÓWNY: kafelki z ćwiczeniami (na razie tylko "Fiszki", pozostałe dodamy później, zostaw miejsce), u góry pasek z punktami i serią dni.

ĆWICZENIE "FISZKI": karta pokazuje formę podstawową (np. "go"). Kliknięcie odwraca kartę i pokazuje: past simple, past participle, tłumaczenie. Pod kartą dwa przyciski: "Wiem" i "Jeszcze nie". Czasowniki w losowej kolejności, po przejściu wszystkich podsumowanie: ile "wiem", ile "jeszcze nie", przycisk "Powtórz te, których nie wiem" i "Wróć do menu".

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://czasowniki.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/04a0e319-5bb9-4856-aea3-2a5d205a147d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
