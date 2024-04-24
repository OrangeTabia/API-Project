import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { fetchLoadCurrentUserSpots } from '../../store/spot';
import { useEffect } from 'react';
import { MdStarRate } from "react-icons/md";

const ManageSpots = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); 
    const spotsInfo = useSelector(state => state.spot.Spots); 

    console.log("Spots info", spotsInfo);

    useEffect(() => {
        dispatch(fetchLoadCurrentUserSpots()); 
    }, [dispatch])
 

    return (
        <>
            <h1>Manage Spots</h1>
            <button>Create a New Spot</button>
            <div className="current-spots-div">
                {spotsInfo?.map((spotTile) => {
                    const handleTileClick = () => {
                        navigate(`spots/${spotTile.id}`);
                    }
                    return (
                        <div key={spotTile.id} className="spot-tile" onClick={handleTileClick}>
                            <div className="image-div">
                                <img className="spot-image" src={spotTile.previewImage} alt="image thumbnail"/>
                            </div>
                            <div className="city-state-ratings">
                                <span>{`${spotTile.city}, ${spotTile.state}`}</span>
                                <span><MdStarRate />{(spotTile.avgRating != 0)? `${(spotTile.avgRating).toFixed(1)}` : 'New'}</span>
                            </div>
                            <p className="price">{`$${spotTile.price}`} night</p>
                            <NavLink to="/spots">
                                <button>Update</button>
                            </NavLink>
                            <NavLink>
                                <button>Delete</button>
                            </NavLink>
                        </div>
                    )
                })}

            </div>
        </>

    )
}

export default ManageSpots;