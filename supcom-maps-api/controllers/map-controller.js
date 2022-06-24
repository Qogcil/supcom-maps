// modules
const fs = require('fs');

// database
const knex = require('../db');

// constants
const MAPS = './maps';

// functions
// loop through files
const loopFiles = async (path) => {
	const dir = await fs.promises.opendir(path);
	mapFiles = [];
	for await (const dirent of dir) {
		Array.from(dirent.name)[0] !== '.' ? mapFiles.push(dirent.name) : null;
	}
	return mapFiles;
}

function chunkArray(array, size) {
	let result = []
	for (let i = 0; i < array.length; i += size) {
	  let chunk = array.slice(i, i + size)
	  result.push(chunk)
	}
	return result
}

//base 32 decoding and hex to decimal conversion
const encoder = (()=>{
    const dec2hex = (s)=>{
        return (s < 15.5 ? "0" : "") + Math.round(s).toString(16)
    }
      , hex2dec = (s)=>{
        return parseInt(s, 16)
    }
      , base32tohex = (base32)=>{
        for (var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", bits = "", hex = "", i = 0; i < base32.length; i++) {
            var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
            bits += leftpad(val.toString(2), 5, "0")
        }
        for (i = 0; i + 4 <= bits.length; i += 4) {
            var chunk = bits.substr(i, 4);
            hex += parseInt(chunk, 2).toString(16)
        }
        return hex
    }
      , leftpad = (str, len, pad)=>{
        return len + 1 >= str.length && (str = new Array(len + 1 - str.length).join(pad) + str),
        str
    };
    return {base32tohex, dec2hex, hex2dec}
})()

exports.getMaps = async (req, res) => {
  	knex
    .select('*')
    .from('map')
	.orderBy('likes', 'desc')
    .then(mapData => {
      res.json(mapData)
    })
    .catch(err => {
      res.json({ message: `There was an error retrieving map: ${err}` })
    })
}

exports.refreshMaps = async (req, res) => {
	const mapFiles = await loopFiles(MAPS)
	await knex('map').del();
	mapRecords = [];
	await mapFiles.map((file) => {
		try {
			// parse options
			const filePath = `${file}`;
			const seed = file.match(/^(.*)(?:_preview\.png)/)[1];
			const playersPerTeamOptionEncoded = file.match(/^(?:[^_]*\_){5}(.{2})/)[1];
			const mapSizeOptionEncoded = file.match(/^(?:[^_]*\_){5}.{2}(.{2})/)[1];
			const teamsOptionEncoded = file.match(/^(?:[^_]*\_){5}.{4}(.{2})/)[1];

			// decode options
			const playersPerTeam = encoder.hex2dec(encoder.base32tohex(playersPerTeamOptionEncoded));
			const mapSize = encoder.hex2dec(encoder.base32tohex(mapSizeOptionEncoded)) * (5/16); // convert to supcom kilometers
			const teams = encoder.hex2dec(encoder.base32tohex(teamsOptionEncoded)) / 16;

			const map = {
				"file_path": filePath,
				"seed": seed,
				"map_size": mapSize,
				"players_per_team": playersPerTeam,
				"teams": teams,
				"likes": 0,
			}
			mapRecords.push(map);
		} catch (err) {
			console.log(err);
		}
	});
	
	const chunkedRecords = chunkArray(mapRecords, 500)
	chunkedRecords.map((chunk) => {
		return knex('map').insert(chunk).onConflict().ignore().then((x)=>{console.log(x)})
	})

	return res.json(chunkedRecords)
}

exports.mapDelete = async (req, res) => {
  knex('map')
    .where('id', req.body.id) // find correct record based on id
    .del() // delete the record
    .then(() => {
      // Send a success message in response
      res.json({ message: `map ${req.body.id} deleted.` })
    })
    .catch(err => {
      // Send a error message in response
      res.json({ message: `There was an error deleting ${req.body.id} map: ${err}` })
    })
}

// Remove all map on the list
exports.mapReset = async (req, res) => {
  // Remove all map from database
  knex
    .select('*') // select all records
    .from('map') // from 'map' table
    .truncate() // remove the selection
    .then(() => {
      // Send a success message in response
      res.json({ message: 'map list cleared.' })
    })
    .catch(err => {
      // Send a error message in response
      res.json({ message: `There was an error resetting map list: ${err}.` })
    })
}

exports.likeMap = async (req, res) => {
	const {map_id} = req.params;

	await knex('map').where('map_id', map_id).increment('likes', 1)
	const [{likes: newLikes}] = await knex('map').select('likes').where('map_id', map_id)

	res.json({ message: `likes count: ${newLikes}.`, likes: newLikes })
}

exports.unlikeMap = async (req, res) => {
	const {map_id} = req.params;
	
	await knex('map').where('map_id', map_id).decrement('likes', 1)
	const [{likes: newLikes}] = await knex('map').select('likes').where('map_id', map_id)

	res.json({ message: `likes count: ${newLikes}.`, likes: newLikes })
}