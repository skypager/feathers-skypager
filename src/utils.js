import errors from 'feathers-errors';
import pick from 'lodash/pick'
import omit from 'lodash/omit'

export function getOptions (params) {
  return pick(params, 'withRelated', 'require')
}

export function errorHandler(error) {
  let feathersError = error

  if (typeof error === 'undefined') {
    feathersError = new errors.BadRequest('Unknown Error', {
      errors: ['Unknown Error'],
    })
  }

  if (typeof error === 'string') {
    feathersError = new errors.BadRequest(error.message, {
      errors: [error],
    })
  }

console.log('Error', error)
  try {
    const e = error
    const data = Object.assign({ errors: error.errors}, e);
    feathersError = new errors.BadRequest(e.summary, data);
  } catch(error) {
    feathersError = error
  }

  throw feathersError
}

export function getOrder(sort={}) {
  const order = {};

  Object.keys(sort).forEach(name => {
    order[name] = sort[name] === 1 ? 'asc' : 'desc';
  });

  return order;
}

const queryMappings = {
  $lt: '<',
  $lte: '<=',
  $gt: '>',
  $gte: '>=',
  $ne: '!',
  $nin: '!',
};

const specials = ['$sort', '$limit', '$skip', '$select'];

function getValue(value, prop) {
  if(typeof value === 'object' && specials.indexOf(prop) === -1) {
    const query = {};

    Object.keys(value).forEach(key => {
      if(queryMappings[key]) {
        query[queryMappings[key]] = value[key];
      } else {
        query[key] = value[key];
      }
    });

    return query;
  }

  return value;
}

export function getWhere(query) {
  return omit(query, 'require', 'withRelated', '$limit', '$order', '$skip', '$select')
}
