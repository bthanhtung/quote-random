<div align="center">

# “ quotes.

A calm, beautiful random quote generator.

**[quote.tungdadev.com](https://quote.tungdadev.com/)**

<a href="https://quote.tungdadev.com/"><img src="docs/preview.jpg" alt="A quote in large serif type on a soft purple aurora background, with controls below" width="760"></a>

</div>

## What's inside

- **1,680 hand-picked quotes**, deduplicated from [Database-Quotes-JSON](https://github.com/JamesFT/Database-Quotes-JSON) (in `quotes.js`)
- Word-by-word reveal and an aurora background whose mood changes with every quote
- History (back / forward), save favourites, copy, share (Web Share API or X)
- **Deep links:** `?q=421` opens a specific quote — e.g. [quote.tungdadev.com/?q=421](https://quote.tungdadev.com/?q=421)
- Light / dark theme; respects `prefers-reduced-motion`

## Keyboard

| Key | Action |
|---|---|
| `Space` | New quote |
| `←` | Back |
| `L` | Save to favourites |
| `C` | Copy |
| `S` | Share |
| `F` | Show saved |
| `T` | Toggle theme |

On phones, swipe to get a new quote.

## Run it locally

Plain HTML, CSS and JavaScript — no build step, no framework.

```sh
git clone https://github.com/bthanhtung/quote-random.git
cd quote-random
npx serve .        # or simply open index.html
```

To add your own quotes, append `{ quote, author }` entries to `quotes.js`.

## License

[MIT](LICENSE) © 2024–2026 TungDaDev. Quotes are from [Database-Quotes-JSON](https://github.com/JamesFT/Database-Quotes-JSON) and belong to their authors.
