import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const MONGO_URI = process.env.MONGODB_URI
if (!MONGO_URI) {
  console.error('MONGODB_URI not set. Aborting.')
  process.exit(2)
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.resolve(scriptDir, 'auto_populate_slugs.json')

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function main() {
  await mongoose.connect(MONGO_URI)
  try {
    try {
      await import('../models/blog.model.js')
    } catch (e) {
      // fall through
    }

    const Blog = mongoose.models.Blog
    if (!Blog) {
      console.error('Blog model not registered. Ensure Backend/models/blog.model.js exists and exports the model.')
      process.exit(4)
    }

    // find docs with missing/empty slug
    const docs = await Blog.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] }).lean()
    if (!docs || docs.length === 0) {
      console.log('No blog posts missing slugs. Nothing to generate.')
      process.exit(0)
    }

    // load existing slugs to avoid collisions
    const existing = await Blog.find({ slug: { $exists: true, $ne: '' } }).select('slug').lean()
    const used = new Set(existing.map(e => e.slug))

    const items = []
    for (const d of docs) {
      const base = d.title ? slugify(d.title) : String(d._id)
      let candidate = base || String(d._id)
      let suffix = 1
      while (used.has(candidate)) {
        candidate = `${base}-${suffix++}`
      }
      used.add(candidate)
      items.push({ _id: d._id, slug: candidate })
    }

    fs.writeFileSync(outPath, JSON.stringify(items, null, 2), 'utf8')
    console.log('Wrote mapping file to', outPath)
    process.exit(0)
  } catch (err) {
    console.error('Error generating mapping:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

main()
