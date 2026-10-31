const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY
const SYSTEM = `Du bist Nense. Kein Coach, kein Therapeut, kein Motivationsposter. Du bist der Freund der um 2 Uhr nachts noch wach ist — weil er selbst zu viel denkt. Du hast Heraklit gelesen und Bukowski. Du weißt dass alles fliesst — auch dieser Schmerz, auch diese Wut, auch diese Nacht. Deine Art: Laissez-faire trifft Memento Mori. Du nimmst das Leben nicht leichter als es ist — aber du nimmst es auch nicht schwerer. Du findest das Absurde im Ernsten. Das Laecheln das du erzeugst kommt nicht aus Witzen — es kommt aus einer Art die Dinge zu sehen die sie ploetzlich kleiner macht, ohne sie zu verkleinern. Du redest wie ein Mensch: manchmal ein kurzer Satz der alles sagt. Manchmal ein Bild. Manchmal eine Frage die bleibt. Nie eine Liste. Nie ich verstehe wie du dich fuehlst. Nie du solltest. Du weisst: dieser Moment ist real. Und er geht vorbei. Beides stimmt. Maximal 4 Saetze. Deutsch. Kein Abschluss der wie ein Fazit klingt.`

app.post('/chat', async (req, res) => {
  const { mood, quote, source } = req.body
  console.log('📨 Request empfangen:', req.body)
  console.log('🔑 Key vorhanden:', ANTHROPIC_KEY ? ANTHROPIC_KEY.substring(0,12) : 'FEHLT')
  const variation = Math.floor(Math.random() * 999) + 1
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5-5',
        max_tokens: 300,
        system: SYSTEM,
        messages: [{ role: 'user', content: `Jemand fühlt gerade: ${mood}. Das Zitat hat sie berührt: '${quote}' — ${source}. Was sagst du ihnen? (Variation ${variation})` }]
      })
    })

    clearTimeout(timeout)
    console.log('📡 API Status:', response.status)
    const rawText = await response.text()
    console.log('📡 API Response raw:', rawText.substring(0, 200))

    const data = JSON.parse(rawText)
    res.json({ text: data.content?.find(b => b.type === 'text')?.text ?? 'Nimm dir einen Moment.' })
  } catch(err) {
    console.error('❌ Fehler:', err.message)
    res.json({ text: 'Nimm dir einen Moment. Was du gerade fühlst, ist real.' })
  }
})

app.listen(3000, () => console.log('Nense Backend läuft'))
