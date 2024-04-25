import SpotForm from './SpotForm'; 
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom'; 
import { useEffect } from 'react'; 
import { fetchSpotDetails } from '../../store/spot';

const UpdateSpot = () => {
    const currentUser = useSelector(state => state.session?.user);
    
    const { spotId } = useParams(); 
    const dispatch = useDispatch(); 
    const spot = useSelector(state => state.spot); 

    useEffect(() => {
        dispatch(fetchSpotDetails(spotId)); 
    }, [dispatch, reportId]); 

    console.log("SPOT INFO", spot); 

    if (!spot) return (<></>); 

    return (
        Object.keys(spot).length > 1 && (
            <>
                <SpotForm 
                spot={spot}
                formType={"Update Spot"}
                />
            </>
        )
    )
}

export default UpdateSpot;