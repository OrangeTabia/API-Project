import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { fetchLoadCurrentUserSpots } from '../../store/spot';
import { useEffect } from 'react';
import OpenModalButton from '../OpenModalButton';
import DeleteSpot from './DeleteSpot';
import { MdStarRate } from "react-icons/md";

const ManageSpots = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); 
    const currentUserSpots = useSelector(state => state.spot.Spots); 

    useEffect(() => {
        dispatch(fetchLoadCurrentUserSpots()); 
    }, [dispatch])
 
    const noExistingSpots = currentUserSpots?.length <= 0;  

    return (
        <>
            <h1>Manage Spots</h1>

            {noExistingSpots && 
            <NavLink to="/spots">
                <button>Create a New Spot</button>
            </NavLink>}

            <div className="current-spots-div">
                {currentUserSpots?.map((spotTile) => {
                    const handleTileClick = () => {
                        navigate(`/spots/${spotTile.id}`);
                    }
                    
                    return (
                        <div key={spotTile.id} className="spot-tile">
                            <div className="image-div" onClick={handleTileClick}>
                                <img className="spot-image" src={spotTile.previewImage} alt="image thumbnail"/>
                            </div>
                            <div className="city-state-ratings">
                                <span>{`${spotTile.city}, ${spotTile.state}`}</span>
                                <span><MdStarRate />{(spotTile.avgRating != 0)? `${(spotTile.avgRating).toFixed(1)}` : 'New'}</span>
                            </div>
                            <p className="price">{`$${spotTile.price}`} night</p>
                            <button onClick={() => navigate(`/spots/${spotTile.id}/edit`)}>Update</button>
                            <OpenModalButton
                            buttonText="Delete"
                            modalComponent={<DeleteSpot spotId={spotTile.id}/>}
                            />
                        </div>
                    )
                })}

            </div>
        </>

    )
}

export default ManageSpots;