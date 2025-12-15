import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const MONGO_URI = process.env.MONGODB_URI
if (!MONGO_URI) {
  console.error('MONGODB_URI not set. Aborting.')
  process.exit(2)
}

const mappingArg = process.argv[2]
const scriptDir = path.dirname(fileURLToPath(import.meta.url))

const candidates = []
if (mappingArg) {
  if (path.isAbsolute(mappingArg)) {
    candidates.push(mappingArg)
  } else {
    candidates.push(path.resolve(process.cwd(), mappingArg))
    candidates.push(path.resolve(scriptDir, mappingArg))
    candidates.push(path.resolve(scriptDir, '..', mappingArg))
  }
} else {
  candidates.push(path.resolve(scriptDir, 'auto_populate_slugs.json'))
  candidates.push(path.resolve(scriptDir, '..', 'auto_populate_slugs.json'))
  candidates.push(path.resolve(process.cwd(), 'auto_populate_slugs.json'))
}

let mappingPath = candidates.find(p => fs.existsSync(p))
if (!mappingPath) {
  console.error('Mapping file not found. Paths checked:')
  for (const c of candidates) console.error(' -', c)
  process.exit(3)
}
try {
  const raw = fs.readFileSync(mappingPath, 'utf8')
  const items = JSON.parse(raw)

  await mongoose.connect(MONGO_URI)

  try {
    // ensure Blog model is registered if app models exist
    try {
      // import model file if present
      await import('../models/blog.model.js')
    } catch (e) {
      // ignore if not present
    }

        const Blog = mongoose.models.Blog
        if (!Blog) {
      console.error('Blog model not registered. Ensure Backend/models/blog.model.js exists and exports the model.')
      process.exit(4)
        }

    for (const it of items) {
      const id = it._id
      const slug = it.slug
      try {
        const res = await Blog.updateOne({ _id: id }, { $set: { slug } })
        console.log(`Updated ${id}:`, res.matchedCount, 'matched,', res.modifiedCount, 'modified')
      } catch (e) {
        console.error('Failed to update', id, e)
      }
    }
  } finally {
    await mongoose.disconnect()
  }
} catch (err) {
  console.error('Error applying slugs:', err)
  process.exit(1)
}
