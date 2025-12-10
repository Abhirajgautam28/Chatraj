import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'

const MONGO_URI = process.env.MONGODB_URI
if (!MONGO_URI) {
  console.error('MONGODB_URI not set. Aborting.')
  process.exit(2)
}

const mappingFile = process.argv[2] || path.resolve(new URL(import.meta.url).pathname, '..', 'auto_populate_slugs.json')

let mappingPath = mappingFile
try {
  if (!fs.existsSync(mappingPath)) {
    console.error('Mapping file not found at', mappingPath)
    process.exit(3)
  }
  const raw = fs.readFileSync(mappingPath, 'utf8')
  const items = JSON.parse(raw)

  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

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
      console.error('Blog model not registered; cannot apply slugs.')
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
