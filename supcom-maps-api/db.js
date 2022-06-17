// modules
const path = require('path');

// Get the location of database.sqlite file
const dbPath = path.resolve(__dirname, 'db/database.sqlite');

// knex
const knex = require('knex')({
  client: 'better-sqlite3',
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true
});

// default table
(async ()=>{
	await knex.schema
	.hasTable('map')
	.then((exists) => {
	if (!exists) {
		return knex.schema.createTable('map', (table)  => {
		table.increments('map_id').primary()
		table.string('file_path').unique()
		table.string('seed').unique()
		table.string('name')
		table.decimal('map_size', 4, 2)
		table.integer('players_per_team')
		table.integer('teams')
		table.boolean('is_water')
		table.integer('likes')
		})
		.then(() => {
		console.log('Table \'map\' created')
		})
		.catch((error) => {
		console.error(`There was an error creating table: ${error}`)
		})
	}
	})
	.then(() => {
	console.log('done')
	})
	.catch((error) => {
	console.error(`There was an error setting up the database: ${error}`)
	})

// Just for debugging purposes:
// Log all data in "maps" table
	await knex.select('*').from('map')
	.then(data => console.log('data:', data))
	.catch(err => console.log(err))
})();

// Export the database
module.exports = knex