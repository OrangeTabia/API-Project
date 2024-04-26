import { useDispatch, useSelector } from 'react-redux'; 
import { useNavigate } from 'react-router-dom'; 
import { useEffect } from 'react'; 
import { fetchSpots } from '../../store/spot';
import { MdStarRate } from "react-icons/md";
import './SpotsLanding.css'; 

const DisplayAllSpots = () => {
    const navigate = useNavigate(); 
    const dispatch = useDispatch();
    const spotsInfo = useSelector(state => state.spot.Spots);  

    useEffect(() => {
        dispatch(fetchSpots());
    }, [dispatch]);

    return (
        <>
            <div className="all-spots-div">
                {spotsInfo?.map((spotTile) => {
                const handleTileClick = () => {
                    navigate(`spots/${spotTile.id}`); 
                }
                return (
                        <div key={spotTile.id} className="spot-tile" title={spotTile.name} onClick={handleTileClick}>
                            <div className="image-div">
                                <img className="spot-image" src={spotTile.previewImage} alt="image thumbnail"/>
                            </div>
                            <div className="city-state-ratings">
                                <span>{`${spotTile.city}, ${spotTile.state}`}</span>
                                <span><MdStarRate />{(spotTile.avgRating != 0)? `${(spotTile.avgRating).toFixed(1)}` : 'New'}</span>
                            </div>
                            <div className="price-per-night">    
                                <span className="price">{`$${spotTile.price} `}</span>
                                <span className="night">night</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default DisplayAllSpots;