import http from "./base-api";

const create = (turn) => http.post("/turns", turn);

const list = (date, endDate, params, maybeSignal) => {
  // Supports legacy calls: list(date, endDate, signal)
  // Supports category-aware calls: list(date, endDate, category, signal)
  // Supports params object: list(date, endDate, { category, signal })
  let category;
  let signal;

  if (typeof params === 'string') {
    category = params;
    signal = maybeSignal;
  } else if (params && typeof params === 'object') {
    if (
      typeof params.abort === 'function' &&
      'onabort' in params &&
      params.category === undefined
    ) {
      signal = params;
    } else {
      category = params.category;
      signal = params.signal;
    }
  }

  const query = new URLSearchParams();
  if (endDate) query.set('endDate', endDate);
  if (category) query.set('category', category);
  const queryString = query.toString();
  const url = queryString
    ? `/turns/date/${date}?${queryString}`
    : `/turns/date/${date}`;

  return http.get(url, signal ? { signal } : {});
};

const detail = (id) => http.get(`/turns/${id}`);

const update = (id, turn) => http.patch(`/turns/${id}`, turn);

const deleteTurn = (id) => http.delete(`/turns/${id}`);

const turnsApi = {
  create,
  list,
  detail,
  update,
  deleteTurn,
};

export default turnsApi;
