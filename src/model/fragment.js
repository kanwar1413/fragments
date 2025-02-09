// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data/memory');

const validTypes = [
  `text/plain`,
  `text/markdown`,
  `text/html`,
  `application/json`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/gif`,
];

const formats = {
  'text/plain': ['text/plain'],
  'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
  'text/html': ['text/html', 'text/plain'],
  'application/json': ['application/json', 'text/plain'],
  'image/png': ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  'image/jpeg': ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  'image/webp': ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  'image/gif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
};


class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) {
      throw new Error('ownerId and type are required fields');
    }
    if (typeof ownerId !== 'string') {
      throw new Error('ownerId must be a string');
    }

    if (typeof type !== 'string') {
      throw new Error('type must be a string');
    }

    if (typeof size !== 'undefined' && typeof size !== 'number') {
      throw new Error('size must be a number');
    }
    if (size < 0) {
      logger.error('size must be a non-negative number');
      throw new Error('size must be a non-negative number');
    }

    if (!validTypes.includes(contentType.parse(type).type)) {
      throw new Error(
        `The requested '${contentType.parse(type).type}' MIME type is not supported yet.`
      );
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || this.created;
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId);
    if (!expand) {
      return fragments.map((fragment) => fragment.id);
    }
    return Promise.all(fragments.map(async (frag) => new Fragment(await readFragment(ownerId, frag.id))));
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragmentData = await readFragment(ownerId, id);
    if (!fragmentData) {
      throw new Error(`Fragment with id ${id} not found`);
    }
    return new Fragment(fragmentData);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this.ownerId, this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    // Ensure data is defined
    if (data === undefined || data === null) {
      throw new Error('Data must not be null or undefined');
    }

    // If data isn't a Buffer, attempt to convert it
    if (!Buffer.isBuffer(data)) {
      if (typeof data === 'string') {
        data = Buffer.from(data, 'utf-8');
      } else {
        throw new Error('Data must be a Buffer or a string');
      }
  }

  // Update size and timestamps for metadata
  this.size = data.length;
  this.updated = new Date().toISOString();

  // Save data and metadata to the database
  await writeFragmentData(this.ownerId, this.id, data);
  await this.save();
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return formats[this.mimeType] || [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const supportedTypes = ['text/plain', 'text/html', 'application/json'];
    const { type } = contentType.parse(value);
    return supportedTypes.includes(type);
  }
}
module.exports.Fragment = Fragment;