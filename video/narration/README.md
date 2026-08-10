# Narration

One text file per beat in `beats/`. Paste each into the Fish Audio console,
synthesise, and save the result here as `<beat-id>.mp3` — the id **without**
the numeric prefix.

    beats/09-cni.txt   ->   narration/cni.mp3

Voices already wired into herdr-executive:

| Voice | Fish reference id |
| --- | --- |
| Olivia | `311bf5222d874b1b849baf6a4886bc07` |
| Sandra | `0baad0571f04479c9b5459620d69db38` |
| Veronica | `af3100196fcd4cb382193827a901cfa2` |

Use **one voice for every beat**. Model `s2.1-pro-free`, matching the
Executive's default.

Once the files are here:

    node scripts/measure-narration.mjs     # writes durations.json
    npx remotion render                    # timing follows the real audio

Any beat without audio falls back to its `estSeconds` estimate, so partial
narration renders fine — useful for checking one beat before doing all 18.

## Beats

| File | Words | Estimate | Title |
| --- | --- | --- | --- |
| `00-cold-open` | 97 | ~52s | Six things have to go right |
| `01-three-lanes` | 112 | ~58s | Three lanes |
| `02-apply` | 111 | ~55s | Stage 1 — The request |
| `03-gates` | 122 | ~68s | Stage 2 — Five gates |
| `04-etcd` | 113 | ~54s | Stage 3 — Durable, and only then |
| `05-controllers` | 109 | ~62s | Stage 4 — Controllers, plural |
| `06-scheduler` | 120 | ~66s | Stage 5 — Filter, then score |
| `07-binding` | 92 | ~48s | Stage 6 — A name, written down |
| `08-kubelet-picks-up` | 86 | ~52s | Stage 7 — The node notices |
| `09-sandbox` | 100 | ~60s | Stage 8 — The sandbox |
| `10-cni` | 147 | ~72s | Stage 9 — CNI wires it up |
| `11-images-containers` | 97 | ~50s | Stage 10 — Images and processes |
| `12-running-not-ready` | 89 | ~58s | Stage 11 — Running is not ready |
| `13-endpointslice` | 107 | ~56s | Stage 12 — Becoming an endpoint |
| `14-dataplane` | 113 | ~64s | Stage 13 — The data plane |
| `15-packet` | 97 | ~54s | Stage 14 — The packet |
| `16-what-breaks` | 134 | ~70s | Where each failure actually lives |
| `17-recap` | 80 | ~56s | The spine |
