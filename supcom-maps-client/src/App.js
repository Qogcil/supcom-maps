import './App.css';
import { useEffect, useState } from 'react';

const Gallery = () => {
	const [mapData, setMapData] = useState([]);

	const getMapData = async () => {
		const mapData = await fetch('http://192.168.1.4:9006/maps')
		.then(response => response.json())
		return setMapData(mapData);
	}

	useEffect(() => {
		getMapData();
	}, []);

	// useEffect(() => {
	// 	const newMapData = mapData.map(a => Object.assign({}, a));
	// 	newMapData.sort((a, b) => a.likes < b.likes ? 1 : -1);
	// 	setMapData(newMapData => newMapData);
	// }, [newMapData]);

	const sortGallery = () => {
		setMapData(newMapData => newMapData.sort((a, b) => a.likes < b.likes ? 1 : -1));
		return;
	}

	const modifyGalleryItem = (map_id, mapItem) => {
		const newMapData = mapData.map(a => Object.assign({}, a));
		const index = newMapData.findIndex((obj => obj.map_id == map_id));
		newMapData[index] = {...mapItem}
		setMapData(newMapData);
	}

	return (
		<div className="gallery">
				{mapData.map(map => {return <Map key={map.map_id} {...map} sortGallery={sortGallery} modifyGalleryItem={modifyGalleryItem} fullMap={map}/>})}
		</div>
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

const Map = ({map_id, file_path, seed, likes, sortGallery, modifyGalleryItem, fullMap}) => {
	const [img, setImg] = useState();

	const getMapPreview = async () => {
		const res = await fetch(`http://192.168.1.4:9006/previews/${file_path}`);
		const imageBlob = await res.blob();
		const imageObjectURL = URL.createObjectURL(imageBlob);
		setImg(imageObjectURL);
	};

	const likeMap = async () => {
		const res = await fetch(`http://192.168.1.4:9006/maps/${map_id}/like`, {method: 'PUT'}).then(response => response.json());
		console.log(res.likes)
		await modifyGalleryItem(map_id, {...fullMap, likes: res.likes});
		await sortGallery();
	};

	const unlikeMap = async () => {
		const res = await fetch(`http://192.168.1.4:9006/maps/${map_id}/unlike`, {method: 'PUT'}).then(response => response.json());
		console.log(res.likes)
		await modifyGalleryItem(map_id, {...fullMap, likes: res.likes});
		await sortGallery();
	}

	const handleClick = (e) => {
		// navigator.clipboard.writeText(seed);
		if (e.type === 'click') {
			likeMap();
		} else if (e.type === 'contextmenu') {
			e.preventDefault()
			console.log('right click')
			unlikeMap();
		}
	  };

	useEffect(() => {
		getMapPreview();
	}, []);

	return (
		<div className='gallery-item' onClick={handleClick} onContextMenu={handleClick}>
			<img src={img} alt='map preview' loading='lazy'/>
			<div className='gallery-item-star-container'>
				{
					[...Array(likes)].map((i) =>
						<div className='star'>{likes > 0 ? <SVGStar /> : null}</div>
					)
				}
			</div>
			{/* <div className='star'>{likes > 0 ? <SVGStar /> : null}</div> */}
		</div>
	)	
}

const CopiedMessage = ({x, y, isShowingAl}) => {
	return(
		<div style={{"position": "fixed", "top": y, "left": x }}>
			<p>Copied to clipboard!</p>
		</div>
	)
}

function App() {

	const [x, setX] = useState()
	const [y, setY] = useState()

	useEffect(
		() => {
		const update = (e) => {
			setX(e.x)
			setY(e.y)
		}
		window.addEventListener('mousemove', update)
		window.addEventListener('touchmove', update)
		return () => {
			window.removeEventListener('mousemove', update)
			window.removeEventListener('touchmove', update)
		}
		},
		[setX, setY]
  	)
	
	return (
		<div className="App">
			<div>
				<Gallery />
			</div>
			{/* <CopiedMessage x={x} y={y} /> */}
		</div>
	);
}

export default App;