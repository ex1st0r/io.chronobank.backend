const keystone = require('keystone')
const config = require('config')
const download = require('../utils').download.intoDirectory(config.get('uploads.dir'))
const Types = keystone.Field.Types
const withTranslation = require('../utils').withTranslation

const Header = new keystone.List('Header', {
  map: { name: 'title' },
  autokey: { path: 'slug', from: 'title', unique: true }
})

Header.add({
  title: { type: String, required: true },
  stereotype: { type: Types.Select, options: [
    { value: 'default', label: 'Default' },
    { value: 'splash', label: 'Splash' },
    { value: 'product', label: 'Product' },
    { value: 'text', label: 'Text' }
  ]},
  background: { type: Types.Select, options: [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' }
  ]},
  image: { type: Types.CloudinaryImage },
  image320: { type: Types.CloudinaryImage },
  image480: { type: Types.CloudinaryImage },
  image640: { type: Types.CloudinaryImage },
  image2x: { type: Types.CloudinaryImage },
  image2x320: { type: Types.CloudinaryImage },
  image2x480: { type: Types.CloudinaryImage },
  image2x640: { type: Types.CloudinaryImage },
  video: { type: Types.Url },
  brief: { type: Types.Html, wysiwyg: true, height: 300 },
},
  'Internationalization',
  withTranslation.all({
    brief: { type: Types.Html, wysiwyg: true, label: 'Brief', height: 300 }
  })
)

Header.schema.pre('save', function (next) {
  const i18n = {}
  for (const [k, v] of Object.entries(this.i18n.toJSON())) {
    if (v && v.active) {
      i18n[k] = v
    }
  }
  this.i18n = i18n
  this.i18nTranslations = Object.keys(i18n).join(', ')
  next()
})

Header.schema.post('save', async (d) => {
  await Promise.all([d.image, d.image320, d.image480, d.image640, d.image2x, d.image2x320, d.image2x480, d.image2x640]
    .map(image => (image && image.secure_url)
      ? download(image.secure_url)
      : Promise.resolve())
    )
})

Header.register()
