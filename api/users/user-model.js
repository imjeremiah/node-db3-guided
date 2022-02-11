const res = require('express/lib/response')
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

  // STEP 1 - DEISGN QUERY IN SQLITE STUDIO

  // SELECT
  //    p.id as post_id,
  //    p.contents,
  //    u.username
  // FROM users AS u
  // LEFT JOIN posts AS p ON u.id = p.user_id
  // WHERE u.id = 1;

  // STEP 2 - FIND OUT HOW TO WRITE IT IN KNEX
  const rows = await db('users as u')
    .join('posts as p', 'u.id', 'p.user_id')
    .select('p.id as post_id', 'p.contents', 'u.username')
    .where('u.id', user_id)

  return rows

  // STEP 3 - TRANSFORM DATA WITH RAW JS (IN user-router)
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
  const rows =  db('posts as p')
    .join('users as u', 'u.id', 'p.user_id')
    .select(['u.id as user_id', 'u.username'])
    .count('p.user_id as post_count')
    .whereNotNull('p.user_id')
    .groupBy('username')

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
    .select('u.username', 'u.id as user_id', 'p.id as post_id', 'p.contents')
    .where('u.id', id)

  const result = {
    username: rows[0].username,
    user_id: rows[0].user_id,
    posts: rows[0].post_id ? rows.map(row => ({ post_id: row.post_id, contents: row.contents })) : []
  }

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
