import mongoose from 'mongoose'

/**
 * SectionSchema – flexible key/value store per section.
 * Each section has a `type` (hero, about, contact) and
 * a `content` map for its text fields.
 */
const SectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['hero', 'about', 'contact'],
      required: true,
    },
    content: {
      heading: { type: String, default: '' },
      subheading: { type: String, default: '' },
      body: { type: String, default: '' },
      ctaLabel: { type: String, default: '' },
      email: { type: String, default: '' },
    },
  },
  { _id: false }
)

const ThemeSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: '#6366f1' },
    bgColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#111827' },
    fontFamily: {
      type: String,
      enum: ['Inter', 'Georgia', 'Roboto Mono'],
      default: 'Inter',
    },
  },
  { _id: false }
)

const SiteSchema = new mongoose.Schema(
  {
    /**
     * tenantId links every site to its owner's workspace.
     * All DB queries MUST include tenantId to enforce data isolation.
     */
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title too long'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description too long'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens'],
    },
    template: {
      type: String,
      enum: ['landing', 'portfolio', 'business'],
      default: 'landing',
    },
    sections: {
      type: [SectionSchema],
      default: [],
    },
    theme: {
      type: ThemeSchema,
      default: () => ({}),
    },
    published: {
      type: Boolean,
      default: true,
    },
    // Basic analytics – incremented server-side on each public page view
    pageViews: {
      type: Number,
      default: 0,
    },
    // SEO (bonus – partially implemented)
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
    },
  },
  { timestamps: true }
)

// Compound index: slug lookups are always public; tenantId queries are dashboard-side
SiteSchema.index({ tenantId: 1, createdAt: -1 })

export default mongoose.models.Site || mongoose.model('Site', SiteSchema)
