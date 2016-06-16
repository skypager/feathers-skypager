if(!global._babelPolyfill) { require('babel-polyfill'); }

import Proto from 'uberproto';
import filter from 'feathers-query-filters';
import errors from 'feathers-errors';
import * as utils from './utils';
import isArray from 'lodash/isArray'
import omit from 'lodash/omit'

const errorHandler = utils.errorHandler

class Service {
  constructor(options) {
    this.paginate = options.paginate || {};
    this.project = options.project;
    this.Model = this.project.get(`content.${options.Model}`)
    this.scope = options.scope || {}
    this.id = options.id || 'id';
  }

  extend(obj) {
    return Proto.extend(obj, this);
  }

  find(params = {}) {
    return Promise.resolve(
      this.Model.query({
        ...params,
        ...this.scope,
      })
    )
    .then(results => results.map(item => item.toJSON()))
    .catch(errorHandler)
  }

  get(id) {
    return this.getInstanceAt(id)
      .then(result => result.toJSON())
      .catch(errorHandler)
  }

  getInstanceAt(id, strict = true) {
    return this.get(id)
    .then((instance) => {
      if (!instance && strict) {
        throw new errors.NotFound(`No record found for id '${id}'`);
      }

      return instance
    })
  }

  create(data, params) {
    return Promise.reject('Create not supported yet')
  }

  patch(id, data) {
    return this.get(id)
  }

  update(id, data, ...args) {
    if (isArray(data)) {
      return Promise.reject('Not replacing multiple records. Did you mean `patch`?');
    }

    delete data[this.id];

    return this.Model
      .where({id})
      .fetch()
      .then(instance => {
        if (!instance) {
          throw new errors.NotFound(`No record found for id '${id}'`);
          return
        }

        const copy = {};
        Object.keys(instance.toJSON()).forEach(key => {
          // NOTE (EK): Make sure that we don't waterline created fields to null
          // just because a user didn't pass them in.
          if ((key === 'id') || (key === 'updated_at' || key === 'created_at') && typeof data[key] === 'undefined') {
            return;
          }

          if (typeof data[key] === 'undefined') {
            copy[key] = null;
          } else {
            copy[key] = data[key];
          }
        });

        return this.patch(id, copy, {});
    })
    .catch(errorHandler);
  }

  remove(id, params) {
    return this.get(id)
  }
}

export default function init(options) {
  return new Service(options);
}

init.Service = Service;
