import './App.css';
import { useEffect, useState, memo } from 'react';
import memoize from 'memoize-one';
import { FixedSizeGrid as Grid, areEqual } from 'react-window';

const createItemData = memoize((items, toggleItemActive) => ({
	items,
	toggleItemActive,
}));

const getMapsData = async () => {
	return fetch('http://192.168.1.4:9006/maps').then(res => res.json());
}

const getMapData = async (map_id) => {
	return fetch(`http://192.168.1.4:9006/maps/${map_id}`).then(res => res.json());
}

const sortMapData = (mapData) => {
	const newMapData = mapData.map(a => Object.assign({}, a));
	newMapData.sort((a, b) => a.likes < b.likes ? 1 : -1)
	return newMapData
}

const modifyGalleryItem = (map_id, mapItem, mapData) => {
	const newMapData = mapData.map(a => Object.assign({}, a));
	const index = newMapData.findIndex((obj => obj.map_id == map_id));
	newMapData[index] = {...mapItem}
	return newMapData;
}

const getMapPreview = async (file_path) => {
	const imageBlob = await fetch(`http://192.168.1.4:9006/previews/${file_path}`).then(res => res.blob());
	const imageObjectURL = URL.createObjectURL(imageBlob);
	return imageObjectURL;
};

const likeMap = async (map_id) => {
	const res = await fetch(`http://192.168.1.4:9006/maps/${map_id}/like`, {method: 'PUT'}).then(res => res.json());
	return res.likes
};

const unlikeMap = async (map_id) => {
	const res = await fetch(`http://192.168.1.4:9006/maps/${map_id}/unlike`, {method: 'PUT'}).then(res => res.json());
	return res.likes
}


const Gallery = () => {
	const [mapsData, setMapsData] = useState([]);

	useEffect(() => {
		(async () => {
			const data = await getMapsData(1);
			setMapsData(data);
		 })();
	}, []);

	const Cell = memo(({ data, columnIndex, rowIndex, style }) => {
		const index = 6*rowIndex + columnIndex;
		const item = data[index];
		return (
			<Map map={item}/>
		);
	}, areEqual);

	const mapsCount = mapsData.length;
	const rowCount = Math.ceil(mapsCount/6);
	const columnCount = 6;
	console.log(mapsCount, rowCount, columnCount)

	return (
		<Grid
			columnCount={columnCount}
			columnWidth={256}
			height={900}
			rowCount={rowCount}
			rowHeight={256}
			width={1920}
			itemCount={mapsCount}
			itemData={mapsData}
		>
		  {Cell}
		</Grid>
	)
}

const SVGStar = (props) => (
	<svg
	  width={32}
	  height={32}
	  viewBox="0 0 24 24"
	  xmlns="http://www.w3.org/2000/svg"
	  {...props}
	>
	  <path
		fill="#FFC95E"
		fillRule="evenodd"
		d="M12 16.667 5 22l3-8-6-4.5h7.5L12 2l2.5 7.5H22L16 14l3 8z"
	  />
	</svg>
)

const Map = ({map}) => {
	const [mapPreview, setMapPreview] = useState();

	useEffect(() => {
		(async () => {
			const img = await getMapPreview(map.file_path);
			setMapPreview(img);
		 })();
	}, []);

	const handleClick = (e) => {
		// navigator.clipboard.writeText(seed);
		if (e.type === 'click') {
			likeMap(map.map_id);
		} else if (e.type === 'contextmenu') {
			e.preventDefault()
			console.log('right click')
			unlikeMap(map.map_id);
		}
		const refreshedMap = getMapData(map.map_id);
	};

	const MapInfoText = ({players_per_team}) => {
		const players_per_team_actual = players_per_team/2;
		const teamSetup = `${players_per_team_actual}`+`v${players_per_team_actual}`.repeat(map.teams-1);
		return <div className='map-size'>{teamSetup} {map.map_size}x{map.map_size}</div>
	}

	return (
		<div className='gallery-item' onClick={handleClick} onContextMenu={handleClick}>
			<img src={mapPreview} alt='map preview' loading='lazy'/>
			<div className='gallery-item-container'>
				<div className='gallery-item-star-container'>
				{
					[...Array(map.likes > 0 ? map.likes : 0)].map((i) =>
						<div className='star'>{map.likes > 0 ? <SVGStar /> : null}</div>
					)
				}
				</div>
				<MapInfoText players_per_team={map.players_per_team} />
			</div>
		</div>
	)	
}

function App() {
	
	return (
		<div className="App">
			<div>
				<Gallery />
			</div>
		</div>
	);
}

export default App;