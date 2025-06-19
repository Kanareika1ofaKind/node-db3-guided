const db = require('../../data/db-config.js')

module.exports = {
  findPosts,
  find,
  findById,
  add,
  remove
}

async function findPosts(user_id) {
  /*
    Implement so it resolves this structure:

    [
      {
          "post_id": 10,
          "contents": "Trusting everyone is...",
          "username": "seneca"
      },
      etc
    ]
  */
  const rows = await db('posts as p')
    .join('users as u', 'u.id', 'p.user_id')
    .select('p.id as post_id', 'p.contents', 'u.username')
    .where({ user_id })
  return rows
}

async function find() {
  /*
    Improve so it resolves this structure:

    [
        {
            "user_id": 1,
            "username": "lao_tzu",
            "post_count": 6
        },
        {
            "user_id": 2,
            "username": "socrates",
            "post_count": 3
        },
        etc
    ]
  */
  const rows = await db('users as u')
    .leftJoin('posts as p', 'u.id', 'p.user_id')
    .groupBy('u.id')
    .select('u.id as user_id', 'u.username')
    .count('p.id as post_count')
  return rows
}

async function findById(id) {
  /*
    Improve so it resolves this structure:

    {
      "user_id": 2,
      "username": "socrates"
      "posts": [
        {
          "post_id": 7,
          "contents": "Beware of the barrenness of a busy life."
        },
        etc
      ]
    }
  */
  const rows = await db('users as u')
    .leftJoin('posts as p', 'u.id', 'p.user_id')
    .select(
      'u.id as user_id',
      'u.username',
      'p.id as post_id',
      'p.contents',
    )
    .where('u.id', id)
  let result = rows.reduce((acc, row) => {

    if (row.contents) {
      acc.posts.push({ post_id: row.post_id, contents: row.contents })
    }

    return acc
  }, { user_id: rows[0].user_id, username: rows[0].username, posts: [] })
  return result
}

function add(user) {
  return db('users')
    .insert(user)
    .then(([id]) => { // eslint-disable-line
      return findById(id)
    })
}

function remove(id) {
  // returns removed count
  return db('users').where({ id }).del()
}
