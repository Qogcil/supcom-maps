import './App.css';
import { useEffect, useState } from 'react';

const Gallery = () => {
	const [mapData, setMapData] = useState([]);

	const getMapData = async () => {
		const mapData = await fetch('http://localhost:9001/maps')
		.then(response => response.json())
		return setMapData(mapData);
	}

	useEffect(() => {
		getMapData();
	}, []);

	return (
		<div className="gallery">
				{mapData.map(map => {return <Map key={map.map_id} {...map} />})}
		</div>
	)
}

const Map = ({file_path, seed}) => {
	const [img, setImg] = useState();

	const getMapPreview = async () => {
		const res = await fetch(`http://localhost:9001/previews/${file_path}`);
		const imageBlob = await res.blob();
		const imageObjectURL = URL.createObjectURL(imageBlob);
		setImg(imageObjectURL);
	};

	useEffect(() => {
		getMapPreview();
	}, []);

	return (
		<div className='gallery-item' onClick={() => {navigator.clipboard.writeText(seed)}}>
			<img src={img} alt='map preview'/>
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
			<CopiedMessage x={x} y={y} />
		</div>
	);
}

export default App;