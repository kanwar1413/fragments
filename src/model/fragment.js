const { randomUUID } = require('crypto');
const contentType = require('content-type');
const logger =require('../logger')
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
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    let data = await readFragment(ownerId, id);

    if (!data) {
      return Promise.reject(new Error(`Fragment with ID '${id}' does not exist.`));
    }
    return new Fragment(data);
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragmentList = await listFragments(ownerId);
    if (!expand) return fragmentList;
    return Promise.all(fragmentList.map(id => Fragment.byId(ownerId, id)));
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
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    return await readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!(Buffer.isBuffer(data) || data)) throw new Error('supplied data is not Buffer');
    this.size = data.byteLength;
    await this.save();
    return writeFragmentData(this.ownerId, this.id, data);
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
    return validTypes.includes(contentType.parse(value).type);
  }
}

module.exports.Fragment = Fragment;